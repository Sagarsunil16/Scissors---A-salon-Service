import { useState, useEffect, useRef } from "react";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../../Components/ui/alert-dialog";
import { Input } from "../../Components/ui/input";
import { Button } from "../../Components/ui/button";
import { Mic, Send, Image as ImageIcon, Video, ChevronLeft, Trash2,Heart } from "lucide-react";
import io, { Socket } from "socket.io-client";
import SalonSidebar from "../../Components/SalonSidebar";
import SalonHeader from "../../Components/SalonHeader";
import { IMessage, Chat } from "../../types/Imessage";
import { useSelector } from "react-redux";
import { formatMessageTime } from "../../lib/utils";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { getChats, getMessages, } from "../../Services/salonAPI";
import toast from "react-hot-toast";

const SalonMessages: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [message, setMessage] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [incomingCall, setIncomingCall] = useState<{ callerId: string; roomName: string } | null>(null);
  const [isCallProcessing, setIsCallProcessing] = useState<boolean>(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [showChatList, setShowChatList] = useState<boolean>(true);
  const [reactionMessageId, setReactionMessageId] = useState<string | null>(null);
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  const { salon } = useSelector((state: any) => state.salon);
  const socketRef = useRef<Socket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const callContainerRef = useRef<HTMLDivElement>(null);
  const zegoInstanceRef = useRef<ZegoUIKitPrebuilt | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  


 useEffect(() => {
    if (!salon?._id) return;

    socketRef.current = io(import.meta.env.VITE_API_URL || "http://localhost:3000", {
      auth: { userId: salon._id, role: "Salon" },
    });

    socketRef.current.on("connect", () => {
      console.log("[CLIENT] Connected with ID:", socketRef.current?.id);
    });

    socketRef.current.on("disconnect", () => {
      console.log("[CLIENT] Disconnected");
    });

    socketRef.current.on("error", (error: { message: string; status?: number }) => {
      console.error("[CLIENT] Error:", error);
      const message = error.message || "An error occurred";
      if (error.status === 404) {
        toast.error("Chat not found. It may have already been deleted.");
      } else if (error.status === 403) {
        toast.error("You are not authorized to perform this action.");
      } else {
        toast.error(message);
      }
      setIsCalling(false);
      setIsCallProcessing(false);
      setIncomingCall(null);
      setDeletingChatId(null);
    });

    socketRef.current.on("onlineUsers", (users: string[]) => {
      console.log("[CLIENT] Online users:", users);
      setOnlineUsers(users);
    });

    socketRef.current.on("incomingCall", ({ callerId, roomName }) => {
      if (callerId === salon._id) {
        console.log("[CLIENT] Ignoring incomingCall from self");
        return;
      }
      console.log(`[CLIENT] Incoming call from ${callerId} in ${roomName}`);
      setIncomingCall({ callerId, roomName });
    });

    socketRef.current.on("callAccepted", ({ callerId, recipientId }) => {
      const otherUserId = callerId === salon._id ? recipientId : callerId;
      console.log(`[CLIENT] Call accepted, joining with ${otherUserId}`);
      joinVideoCall(otherUserId);
      setIsCallProcessing(false);
    });

    socketRef.current.on("callRejected", () => {
      console.log("[CLIENT] Call rejected by user");
      setIsCalling(false);
      setIncomingCall(null);
      setIsCallProcessing(false);
      toast.error("Call rejected by user");
    });

    socketRef.current.on("chatDeleted", ({ userId, salonId }) => {
      if (salonId === salon._id) {
        console.log(`[CLIENT] Chat deleted for user ${userId}`);
        setSelectedChat(null)
        toast.success("Chat deleted successfully");
        
      }
      setDeletingChatId(null);
    });

    socketRef.current.on("messagesRead", ({ userId, salonId, role }) => {
      console.log(`[CLIENT] Messages read by ${role} for user ${userId}, salon ${salonId}`);
      if (role === "Salon" && salonId === salon._id && selectedChat?.userId === userId) {
        setMessages((prev) => prev.map((msg) => ({ ...msg, isRead: true })));
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.userId === userId ? { ...chat, unreadCount: 0 } : chat
          )
        );
        setSelectedChat((prev) => (prev ? { ...prev, unreadCount: 0 } : null));
      }
    });

    socketRef.current.on("messageReaction", ({ messageId, reaction }) => {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId
            ? { ...msg, reactions: [...(msg.reactions || []), reaction] }
            : msg
        )
      );
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [salon._id]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobileView(mobile);
      setShowChatList(mobile ? true : true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await getChats();
        console.log("[CLIENT] Fetched chats:", response.data.chats);
        setChats(
          response.data.chats.map((chat: any) => ({
            id: chat._id,
            userId: chat.userId?._id,
            name: chat.userId.firstname,
            lastMessage: chat.lastMessage,
            lastActive: chat.lastActive,
            unreadCount: chat.unreadCount,
          }))
        );
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };
    fetchChats();
  }, []);

 
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleChatSelect = async (chat: Chat) => {
    setSelectedChat(chat);
    if (isMobileView) setShowChatList(false);
    try {
      const response = await getMessages(chat.userId as string);
      console.log("[CLIENT] Fetched messages for user", chat.userId, ":", response.data);
      setMessages(response.data);
      socketRef.current?.emit("joinChat", { salonId: chat.userId })
      socketRef.current?.emit("markMessagesAsRead", { userId: chat.userId, salonId: salon._id });
      setChats((prevChats) =>
        prevChats.map((c) =>
          c.userId === chat.userId ? { ...c, unreadCount: 0 } : c
        )
      );
      setSelectedChat((prev) => (prev ? { ...prev, unreadCount: 0 } : null));
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    socketRef.current?.on("newMessage", (message: IMessage) => {
      console.log("[CLIENT] New message received:", message);
      const normalizedMessage = { ...message, id: message._id };
      if (
        selectedChat &&
        (message.senderId === selectedChat.userId || message.recipientId === selectedChat.userId)
      ) {
        setMessages((prev) => [...prev, normalizedMessage]);
        if (message.recipientId === salon._id) {
          // markMessagesAsRead(selectedChat.userId as string);
          socketRef.current?.emit("markMessagesAsRead", { userId: selectedChat.userId, salonId: salon._id });
          setChats((prevChats) =>
            prevChats.map((chat) =>
              chat.userId === selectedChat.userId ? { ...chat, unreadCount: 0 } : chat
            )
          );
          setSelectedChat((prev) => (prev ? { ...prev, unreadCount: 0 } : null));
        }
      } else if (message.senderId !== salon._id) {
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.userId === message.senderId
              ? {
                  ...chat,
                  lastMessage: message.content || "Image",
                  lastActive: message.timestamp,
                  unreadCount: (chat.unreadCount || 0) + 1,
                }
              : chat
          )
        );
      }
    });

    return () => {
      socketRef.current?.off("newMessage");
    };
  }, [selectedChat, salon._id]);

  const sendMessage = async () => {
    if ((message.trim() === "" && !image) || !selectedChat) return;

    let imageBase64 = "";
    if (image) {
      const reader = new FileReader();
      reader.readAsDataURL(image);
      await new Promise((resolve) => {
        reader.onload = () => {
          imageBase64 = reader.result as string;
          resolve(null);
        };
      });
    }

    const messageData = {
      content: message,
      senderType: "Salon",
      senderId: salon._id,
      recipientId: selectedChat.userId,
      recipientType: "User",
      image: imageBase64,
    };

    socketRef.current?.emit("sendMessage", messageData);
    setMessage("");
    setImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDeleteChat = async (userId: string) => {
    try {
      socketRef.current?.emit("deleteChat", { userId, salonId: salon._id });
    } catch (error: any) {
      console.error("Error deleting chat:", error);
      toast.error(error.message || "Failed to delete chat");
    }
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    try {;
      socketRef.current?.emit("addReaction", { messageId, emoji });
      setReactionMessageId(null)
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setImage(e.target.files[0]);
  };

  const startVideoCall = () => {
    if (!selectedChat || isCalling || isCallProcessing) return;
    setIsCallProcessing(true);
    socketRef.current?.emit("startVideoCall", {
      recipientId: selectedChat.userId,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const acceptVideoCall = () => {
    if (!incomingCall || !selectedChat || isCallProcessing) return;
    setIsCallProcessing(true);
    socketRef.current?.emit("acceptVideoCall", {
      callerId: incomingCall.callerId,
    });
    setIncomingCall(null);
  };

  const rejectVideoCall = () => {
    if (!incomingCall || isCallProcessing) return;
    socketRef.current?.emit("rejectVideoCall", {
      callerId: incomingCall.callerId,
    });
    setIncomingCall(null);
    setIsCallProcessing(false);
  };

  const joinVideoCall = (otherUserId: string) => {
    const roomID = [salon._id, otherUserId].sort().join("-");
    const appID = parseInt(import.meta.env.VITE_ZEGO_APP_ID || "0");
    const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET || "";
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      salon._id,
      salon.salonName
    );

    try {
      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zegoInstanceRef.current = zp;
      zp.joinRoom({
        container: callContainerRef.current,
        scenario: { mode: ZegoUIKitPrebuilt.OneONoneCall },
        showPreJoinView: false,
        showScreenSharingButton: false,
        showRoomTimer: true,
        onLeaveRoom: () => {
          console.log("[CLIENT] Left call room");
          setIsCalling(false);
          setIsCallProcessing(false);
          if (callContainerRef.current) callContainerRef.current.innerHTML = "";
          zegoInstanceRef.current = null;
          window.location.reload()
        },
      });
    } catch (error) {
      console.error("[ZEGO] Join room failed:", error);
      alert("Failed to start call. Please check permissions or try again.");
      setIsCalling(false);
      setIsCallProcessing(false);
      zegoInstanceRef.current = null;
    }

    setIsCalling(true);
  };

  const endVideoCall = () => {
    console.log("[CLIENT] Ending video call");
    if (zegoInstanceRef.current) {
      try {
        zegoInstanceRef.current.destroy();
        console.log("[CLIENT] Zego instance destroyed");
      } catch (error) {
        console.error("[CLIENT] Error destroying Zego instance:", error);
      }
      zegoInstanceRef.current = null;
    }
    if (callContainerRef.current) callContainerRef.current.innerHTML = "";
    setIsCalling(false);
    setIncomingCall(null);
    setIsCallProcessing(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.src = "https://placehold.co/40x40";
  };

  return (
    <div className="flex max-h-screen overflow-hidden bg-gradient-to-br from-purple-100 to-orange-100 font-sans">
      <SalonSidebar />
      <div className="flex-1 flex flex-col min-h-0">
        <SalonHeader />
        <div className="flex-1 flex flex-col md:flex-row min-h-0">
          {(showChatList || !isMobileView) && (
            <div className="w-full md:w-1/3 bg-white p-4 border-r shadow-lg min-h-0 transition-all duration-300">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-purple-700">Chats</h2>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded-lg transition">
                  + Compose
                </Button>
              </div>
              <Input
                placeholder="Search chats..."
                className="mb-4 border-purple-300 focus:ring-purple-500"
                aria-label="Search chats"
              />
              <div className="space-y-2 overflow-y-auto h-[calc(100vh-16rem)] scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`p-3 rounded-xl cursor-pointer transition-colors relative hover:bg-purple-100 shadow-sm ${
                      selectedChat?.id === chat.id ? "bg-purple-200" : "bg-white"
                    }`}
                    onClick={() => handleChatSelect(chat)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={chat.image || "https://placehold.co/40x40"}
                          alt={chat.name}
                          className="rounded-full w-10 h-10 object-cover"
                          onError={handleImageError}
                        />
                        {onlineUsers.includes(chat.userId as string) && (
                          <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-800">{chat.name}</p>
                        <p className="text-sm text-gray-600 truncate">{chat.lastMessage}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        {chat.unreadCount ? (
                          <span className="bg-purple-600 text-white text-xs rounded-full px-2 py-1">
                            {chat.unreadCount}
                          </span>
                        ) : null}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={deletingChatId === chat.userId}
                              className="text-red-500 hover:text-red-700 mt-1"
                              aria-label={`Delete chat with ${chat.name}`}
                            >
                              {deletingChatId === chat.userId ? (
                                <span className="animate-spin">⏳</span>
                              ) : (
                                <Trash2 size={16} />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Chat</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete your chat with {chat.name}? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteChat(chat.userId as string)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div
            className={`flex-1 flex flex-col min-h-0 ${
              isMobileView && showChatList ? "hidden" : "block"
            } transition-all duration-300`}
          >
            {selectedChat ? (
              <>
                <div className="h-16 p-4 bg-white border-b flex items-center shadow-sm shrink-0">
                  {isMobileView && (
                    <button
                      onClick={() => setShowChatList(true)}
                      className="mr-2 text-gray-500 hover:text-gray-700"
                    >
                      <ChevronLeft size={20} />
                    </button>
                  )}
                  <div className="relative">
                    <img
                      src={selectedChat.image || "https://placehold.co/40x40"}
                      alt={selectedChat.name}
                      className="rounded-full mr-3 w-10 h-10 object-cover"
                      onError={handleImageError}
                    />
                    {onlineUsers.includes(selectedChat.userId as string) && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-semibold text-gray-800">{selectedChat.name}</h2>
                    <p className="text-xs text-gray-500">
                      {onlineUsers.includes(selectedChat.userId as string)
                        ? "Online"
                        : `Last seen ${formatMessageTime(selectedChat.lastActive)}`}
                    </p>
                  </div>
                  <Button
                    onClick={startVideoCall}
                    disabled={isCalling || !!incomingCall || isCallProcessing}
                    className="ml-auto bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full"
                  >
                    <Video size={20} />
                  </Button>
                </div>
                {incomingCall && (
                  <div className="p-4 bg-yellow-100 border-b shrink-0">
                    <p className="text-sm font-medium">Incoming video call from user...</p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        onClick={acceptVideoCall}
                        disabled={isCallProcessing}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        Accept
                      </Button>
                      <Button
                        onClick={rejectVideoCall}
                        disabled={isCallProcessing}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                )}
                {isCalling && (
                  <div className="p-4 bg-gray-100 border-b shrink-0">
                    <div ref={callContainerRef} className="w-full h-[300px] md:h-[400px]" />
                    <div className="flex gap-2 mt-2">
                      <Button
                        onClick={endVideoCall}
                        className="bg-red-600 hover:bg-red-700 text-white w-32"
                      >
                        End Call
                      </Button>
                      <Button
                        onClick={endVideoCall}
                        className="bg-gray-600 hover:bg-gray-700 text-white w-32"
                      >
                        Close UI
                      </Button>
                    </div>
                  </div>
                )}
                <div
                  className="flex-1 p-4 md:p-6 overflow-y-auto bg-gray-50 min-h-0 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-gray-100"
                  style={{ height: "calc(100vh - 16rem - 80px)" }}
                >
                  {messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`mb-4 flex ${
                        msg.senderType === "Salon" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div className="flex flex-col max-w-xs md:max-w-md">
                        {formatMessageTime(msg.timestamp) && (
                          <div
                            className={`text-xs text-gray-500 mb-1 ${
                              msg.senderType === "Salon" ? "text-right" : "text-left"
                            }`}
                          >
                            {formatMessageTime(msg.timestamp)}
                          </div>
                        )}
                        {msg.image && (
                          <img
                            src={msg.image}
                            alt="Uploaded"
                            className="max-w-full h-auto rounded-lg mb-2 shadow-md"
                          />
                        )}
                        {msg.content && (
                          <div
                            className={`p-3 rounded-2xl shadow-sm relative ${
                              msg.senderType === "Salon"
                                ? "bg-purple-600 text-white"
                                : "bg-white text-gray-800"
                            }`}
                          >
                            {msg.content}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute -bottom-6 right-0"
                              onClick={() => setReactionMessageId(msg._id)}
                            >
                              <Heart size={16} />
                            </Button>
                          </div>
                        )}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {msg.reactions.map((reaction, index) => (
                              <span key={index} className="text-sm">
                                {reaction.emoji}
                              </span>
                            ))}
                          </div>
                        )}
                        {reactionMessageId === msg._id && (
                          <div className="flex gap-2 mt-2">
                            {["😊", "❤️", "👍"].map((emoji) => (
                              <Button
                                key={emoji}
                                variant="outline"
                                size="sm"
                                onClick={() => handleAddReaction(msg._id, emoji)}
                              >
                                {emoji}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={messageEndRef} />
                </div>
                <div className="p-4 border-t bg-white flex flex-col shadow-inner shrink-0">
                  <div className="flex items-center">
                    <Input
                      placeholder="Type your message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 mr-2 border-purple-300 focus:ring-purple-500 rounded-lg"
                    />
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="mr-2 bg-gray-200 hover:bg-gray-300 p-2 rounded-full transition"
                    >
                      <ImageIcon className="text-gray-600" size={20} />
                    </Button>
                    <Button
                      className="mr-2 bg-gray-200 hover:bg-gray-300 p-2 rounded-full transition"
                    >
                      <Mic className="text-gray-600" size={20} />
                    </Button>
                    <Button
                      onClick={sendMessage}
                      className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full transition"
                    >
                      <Send size={20} />
                    </Button>
                  </div>
                  {image && (
                    <div className="mt-2 text-sm text-gray-600">
                      Selected image: {image.name}{" "}
                      <button onClick={() => setImage(null)} className="text-red-500 hover:underline">
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50 min-h-0">
                <div className="text-center">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
                    <Send className="h-5 w-5 text-gray-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-700">No Chat Selected</h3>
                  <p className="text-gray-500 mt-2">
                    Please select a chat from the list to start messaging.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalonMessages;