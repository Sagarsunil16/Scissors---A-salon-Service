import { Button } from "../../Components/ui/button";
import { Input } from "../../Components/ui/input";
import { Card, CardContent, CardHeader } from "../../Components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../../Components/ui/avatar";
import { Send, Search, MoreVertical, ChevronLeft, Video, ImageIcon, Trash2, Heart } from "lucide-react";
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "../../Components/ui/alert-dialog";
import { useState, useEffect, useRef } from "react";
import io, { Socket } from "socket.io-client";
import Navbar from "../../Components/Navbar";
import Footer from "../../Components/Footer";
import ProfileNavbar from "../../Components/ProfileNavbar";
import { IMessage, Chat } from "../../types/Imessage";
import { useSelector } from "react-redux";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useNavigate } from "react-router-dom";
import { getChats, getMessages } from "../../Services/UserAPI";
import toast from "react-hot-toast";

const MessagesPage: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isMobileView, setIsMobileView] = useState<boolean>(false);
  const [showChatList, setShowChatList] = useState<boolean>(true);
  const [image, setImage] = useState<File | null>(null);
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [incomingCall, setIncomingCall] = useState<{ callerId: string; roomName: string } | null>(null);
  const [isCallProcessing, setIsCallProcessing] = useState<boolean>(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [reactionMessageId, setReactionMessageId] = useState<string | null>(null);
  const [deletingChatId, setDeletingChatId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const callContainerRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useSelector((state: any) => state.user);
  const zegoInstanceRef = useRef<ZegoUIKitPrebuilt | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const navigate = useNavigate();
    
  useEffect(() => {
    if (!currentUser?._id) return;

    socketRef.current = io(import.meta.env.VITE_API_URL || "http://localhost:3000", {
      auth: { userId: currentUser._id, role: "User" },
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
      if (callerId === currentUser._id) {
        console.log("[CLIENT] Ignoring incomingCall from self");
        return;
      }
      console.log(`[CLIENT] Incoming call from ${callerId} in ${roomName}`);
      setIncomingCall({ callerId, roomName });
    });

    socketRef.current.on("callAccepted", ({ callerId, recipientId }) => {
      const otherUserId = callerId === currentUser._id ? recipientId : callerId;
      console.log(`[CLIENT] Call accepted, joining with ${otherUserId}`);
      joinVideoCall(otherUserId);
      setIsCallProcessing(false);
    });

    socketRef.current.on("callRejected", () => {
      console.log("[CLIENT] Call rejected by salon");
      setIsCalling(false);
      setIncomingCall(null);
      setIsCallProcessing(false);
      toast.error("Call rejected by salon");
    });

    socketRef.current.on("chatDeleted", ({ userId, salonId }) => {
      if (userId === currentUser._id) {
        console.log(`[CLIENT] Chat deleted for salon ${salonId}`);
        setSelectedChat(null)
        toast.success("Chat deleted successfully");
      }
      setDeletingChatId(null);
    });

    socketRef.current.on("messagesRead", ({ userId, salonId, role }) => {
      console.log(`[CLIENT] Messages read by ${role} for user ${userId}, salon ${salonId}`);
      if (role === "User" && userId === currentUser._id && selectedChat?.salonId === salonId) {
        setSelectedChat((prev) =>
          prev
            ? { ...prev, messages: prev.messages?.map((msg) => ({ ...msg, isRead: true })), unreadCount: 0 }
            : null
        );
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.salonId === salonId ? { ...chat, unreadCount: 0 } : chat
          )
        );
      }
    });

    socketRef.current.on("messageReaction", ({ messageId, reaction }) => {
      setSelectedChat((prev:any) =>
        prev
          ? {
              ...prev,
              messages: prev.messages.map((msg:IMessage) =>
                msg._id === messageId
                  ? { ...msg, reactions: [...(msg.reactions || []), reaction] }
                  : msg
              ),
            }
          : null
      );
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [currentUser?._id]);

  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await getChats();
        const { chats, salons } = response.data;
        console.log("[CLIENT] Fetched chats:", chats);
        const chatMap = new Map(chats.map((chat: Chat) => [chat.salonId, chat]));
        const allChats = salons.map((salon: any) => ({
          id: salon._id,
          salonId: salon._id,
          name: salon.salonName,
          avatar: salon.images[0]?.url || "https://via.placeholder.com/40",
          lastMessage: chatMap.get(salon._id)?.lastMessage || "Start a conversation",
          lastActive: chatMap.get(salon._id)?.lastActive || "just now",
          messages: chatMap.get(salon._id)?.messages || [],
          unreadCount: chatMap.get(salon._id)?.unreadCount || 0,
        }));
        setChats(allChats);
      } catch (error) {
        console.error("Error fetching chats:", error);
      }
    };
    fetchChats();
  }, []);

  const handleChatSelect = async (chat: Chat) => {
    setSelectedChat(chat);
    if (isMobileView) setShowChatList(false);

    try {
      const response = await getMessages(chat.salonId as string);
      setSelectedChat({ ...chat, messages: response.data });
      socketRef.current?.emit("joinChat", { salonId: chat.salonId });
      // await markMessagesAsRead(chat.salonId as string);
      socketRef.current?.emit("markMessagesAsRead", { userId: currentUser._id, salonId: chat.salonId });
      setChats((prevChats) =>
        prevChats.map((c) =>
          c.salonId === chat.salonId ? { ...c, unreadCount: 0 } : c
        )
      );
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.messages]);

  useEffect(() => {
    if (!socketRef.current) return;
    socketRef.current.on("newMessage", (message: IMessage) => {
      console.log("[CLIENT] Received newMessage:", message);
      if (
        selectedChat &&
        ((message.senderId === currentUser._id && message.recipientId === selectedChat.salonId) ||
         (message.senderId === selectedChat.salonId && message.recipientId === currentUser._id))
      ) {
        setSelectedChat((prev) =>
                  prev && {
            ...prev,
            messages: (prev.messages || []).some((m) => m._id === message._id)
              ? prev.messages
              : [...(prev.messages || []), { ...message, id: message._id }],
            lastMessage: message.content || "Image",
            lastActive: message.timestamp,
            unreadCount: message.recipientId === currentUser._id ? 0 : prev.unreadCount,
          }
        );
        if (message.recipientId === currentUser._id) {
          // markMessagesAsRead(selectedChat.salonId as string);
          socketRef.current?.emit("markMessagesAsRead", { userId: currentUser._id, salonId: selectedChat.salonId });
          setChats((prevChats) =>
            prevChats.map((chat) =>
              chat.salonId === selectedChat.salonId ? { ...chat, unreadCount: 0 } : chat
            )
          );
        }
      } else if (message.senderId !== currentUser._id) {
        setChats((prevChats) =>
          prevChats.map((chat) =>
            chat.salonId === message.senderId
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
  }, [selectedChat, currentUser._id]);

  const handleSendMessage = async () => {
    if ((newMessage.trim() === "" && !image) || !selectedChat) return;

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
      content: newMessage,
      senderType: "User",
      senderId: currentUser._id,
      recipientId: selectedChat.salonId,
      recipientType: "Salon",
      image: imageBase64,
    };

    socketRef.current?.emit("sendMessage", messageData);
    setNewMessage("");
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

   const handleDeleteChat = async (salonId: string) => {
    try {
      socketRef.current?.emit("deleteChat", { userId: currentUser._id, salonId });
    } catch (error: any) {
      console.error("Error deleting chat:", error);
      toast.error(error.message || "Failed to delete chat");
    }
  };

  const handleAddReaction = async (messageId: string, emoji: string) => {
    try {
      socketRef.current?.emit("addReaction", { messageId, emoji });
      setReactionMessageId(null)
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const startVideoCall = () => {
    if (!selectedChat || isCalling || isCallProcessing) return;
    setIsCallProcessing(true);
    socketRef.current?.emit("startVideoCall", { recipientId: selectedChat.salonId });
  };

  const acceptVideoCall = () => {
    if (!incomingCall || !selectedChat || isCallProcessing) return;
    setIsCallProcessing(true);
    socketRef.current?.emit("acceptVideoCall", { callerId: incomingCall.callerId });
    setIncomingCall(null);
  };

  const rejectVideoCall = () => {
    if (!incomingCall || isCallProcessing) return;
    socketRef.current?.emit("rejectVideoCall", { callerId: incomingCall.callerId });
    setIncomingCall(null);
    setIsCallProcessing(false);
  };

  const joinVideoCall = (otherUserId: string) => {
    const roomID = [currentUser._id, otherUserId].sort().join("-");
    const appID = parseInt(import.meta.env.VITE_ZEGO_APP_ID || "0");
    const serverSecret = import.meta.env.VITE_ZEGO_SERVER_SECRET || "";
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      currentUser._id,
      currentUser.name || "User"
    );

    try {
      const zp = ZegoUIKitPrebuilt.create(kitToken);
      zegoInstanceRef.current = zp;
      zp.joinRoom({
        container: callContainerRef.current,
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall,
        },
        showPreJoinView: false,
        showScreenSharingButton: false,
        showRoomTimer: true,
        onLeaveRoom: () => {
          console.log("[CLIENT] Left call room");
          setIsCalling(false);
          setIsCallProcessing(false);
          if (callContainerRef.current) callContainerRef.current.innerHTML = "";
          zegoInstanceRef.current = null;
          navigate("/messages");
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
    if (callContainerRef.current) {
      callContainerRef.current.innerHTML = "";
    }
    setIsCalling(false);
    setIncomingCall(null);
    setIsCallProcessing(false);
  };

  const filteredChats = chats.filter(
    (chat) =>
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <div className="flex justify-center py-4 mt-20">
        <ProfileNavbar />
      </div>
      <div className="container mx-auto px-4 pb-20">
        <div className="flex flex-col md:flex-row w-full h-[calc(100vh-200px)] bg-white rounded-xl shadow-md overflow-hidden pt-10">
          {(showChatList || !isMobileView) && (
           <Card className="w-full md:w-1/3 h-full rounded-r-none border-r-0 shadow-none">
              <CardHeader className="p-4 border-b">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Messages</h2>
                  <button className="text-gray-500 hover:text-gray-700" aria-label="More options">
                    <MoreVertical size={20} />
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search messages..."
                    className="pl-10 w-full"
                    aria-label="Search messages"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0 overflow-y-auto h-[calc(100%-80px)]">
                {filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`flex items-center gap-3 p-4 border-b hover:bg-gray-50 transition-colors cursor-pointer ${
                      selectedChat?.id === chat.id ? "bg-gray-100" : ""
                    }`}
                    onClick={() => handleChatSelect(chat)}
                  >
                    <div className="relative">
                      <Avatar>
                        <AvatarImage src={chat.avatar} alt={chat.name} />
                        <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {onlineUsers.includes(chat.salonId as string) && (
                        <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium text-gray-900 truncate">{chat.name}</h3>
                        <div className="flex flex-col items-end gap-1">
                          {chat.unreadCount ? (
                            <span className="bg-orange-500 text-white text-xs rounded-full px-2 py-1">
                              {chat.unreadCount}
                            </span>
                          ) : null}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={deletingChatId === chat.salonId}
                                className="text-red-500 hover:text-red-700"
                                aria-label={`Delete chat with ${chat.name}`}
                              >
                                {deletingChatId === chat.salonId ? (
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
                                <AlertDialogAction onClick={() => handleDeleteChat(chat.salonId as string)}>
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                      <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          <Card className={`flex-1 h-full rounded-l-none shadow-none ${isMobileView && showChatList ? "hidden" : ""}`}>
            {selectedChat ? (
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-3 p-4 border-b">
                  {isMobileView && (
                    <button onClick={() => setShowChatList(true)} className="mr-2 text-gray-500 hover:text-gray-700">
                      <ChevronLeft size={20} />
                    </button>
                  )}
                  <div className="relative">
                    <Avatar>
                      <AvatarImage src={selectedChat.avatar} alt={selectedChat.name} />
                      <AvatarFallback>{selectedChat.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {onlineUsers.includes(selectedChat.salonId as string) && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white"></span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{selectedChat.name}</h3>
                    <p className="text-xs text-gray-500">
                      {onlineUsers.includes(selectedChat.salonId as string) ? "Online" : `Last seen ${selectedChat.lastActive}`}
                    </p>
                  </div>
                  <Button
                    onClick={startVideoCall}
                    disabled={isCalling || !!incomingCall || isCallProcessing}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full"
                  >
                    <Video />
                  </Button>
                  <button className="text-gray-500 hover:text-gray-700">
                    <MoreVertical size={20} />
                  </button>
                </div>
                {incomingCall && (
                  <div className="p-4 bg-yellow-100 border-b">
                    <p>Incoming video call from salon...</p>
                    <Button
                      onClick={acceptVideoCall}
                      disabled={isCallProcessing}
                      className="mr-2 bg-green-600 hover:bg-green-700 text-white"
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
                )}
                {isCalling && (
                  <div className="p-4 bg-gray-100 border-b">
                    <div ref={callContainerRef} style={{ width: "100%", height: "300px" }} />
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
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                  {selectedChat.messages?.map((msg) => (
                    <div key={msg._id} className={`flex ${msg.senderType === "User" ? "justify-end" : "justify-start"}`}>
                      <div className="max-w-xs md:max-w-md">
                        <div className={`text-xs text-gray-500 mb-1 ${msg.senderType === "User" ? "text-right" : "text-left"}`}>
                          {formatMessageTime(msg.timestamp)}
                        </div>
                        {msg.image && (
                          <img
                            src={msg.image}
                            alt="Uploaded"
                            className="max-w-full h-auto rounded-lg mb-2 shadow-md"
                          />
                        )}
                        {msg.content && (
                          <div
                            className={`p-3 rounded-lg transition-all duration-200 relative ${
                              msg.senderType === "User"
                                ? "bg-orange-500 text-white rounded-br-none"
                                : "bg-white border border-gray-200 rounded-bl-none"
                            }`}
                          >
                            {msg.content}
                            <Button
                              variant="ghost"
                              size="sm"
                              className="absolute -bottom-6 right-0"
                              onClick={() => setReactionMessageId(msg._id)}
                            >
                              <Heart  size={16} />
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
                  <div ref={messagesEndRef} />
                </div>
                <div className="border-t p-3 bg-white">
                  <div className="flex gap-2 items-end">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 min-h-[40px]"
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
                      className="bg-gray-200 hover:bg-gray-300 p-2 rounded-full"
                    >
                      <ImageIcon className="text-gray-600" size={18} />
                    </Button>
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() && !image}
                      className="bg-orange-500 hover:bg-orange-600 text-white h-10 w-10 p-0 flex items-center justify-center"
                    >
                      <Send size={18} />
                    </Button>
                  </div>
                  {image && (
                    <div className="mt-2 text-sm text-gray-600">
                      Selected image: {image.name}{" "}
                      <button onClick={() => setImage(null)} className="text-red-500">
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <CardContent className="flex flex-col items-center justify-center h-full text-gray-500">
                <div className="text-center p-6">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mb-4">
                    <Send className="h-5 w-5 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No chat selected</h3>
                  <p className="text-sm">Choose a conversation from the list to start messaging</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MessagesPage;

function formatMessageTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}