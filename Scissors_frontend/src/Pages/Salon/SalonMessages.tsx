import { useState, useEffect, useRef } from "react";
import { Input } from "../../Components/ui/input";
import { Button } from "../../Components/ui/button";
import { Mic, Send, Image as ImageIcon, Video } from "lucide-react";
import io, { Socket } from "socket.io-client";
import axios from "axios";
import SalonSidebar from "../../Components/SalonSidebar";
import SalonHeader from "../../Components/SalonHeader";
import { IMessage, Chat } from "../../types/Imessage";
import { useSelector } from "react-redux";
import { formatMessageTime } from "../../lib/utils";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import { useNavigate } from "react-router-dom";
import { getChats, getMessages } from "../../Services/salonAPI";

const SalonMessages: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [message, setMessage] = useState<string>("");
  const [image, setImage] = useState<File | null>(null);
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [incomingCall, setIncomingCall] = useState<{
    callerId: string;
    roomName: string;
  } | null>(null);
  const [isCallProcessing, setIsCallProcessing] = useState<boolean>(false);
  const { salon } = useSelector((state: any) => state.salon);
  const socketRef = useRef<Socket | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const callContainerRef = useRef<HTMLDivElement>(null);
  const zegoInstanceRef = useRef<ZegoUIKitPrebuilt | null>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  // Initialize Socket.IO
  useEffect(() => {
    if (!salon?._id) return;

    socketRef.current = io("http://localhost:3000", {
      auth: { userId: salon._id },
    });

    socketRef.current.on("connect", () => {
      console.log("[CLIENT] Connected with ID:", socketRef.current?.id);
    });

    socketRef.current.on("disconnect", () => {
      console.log("[CLIENT] Disconnected");
    });

    socketRef.current.on("error", (errorMsg: string) => {
      console.error("[CLIENT] Error:", errorMsg);
      alert(errorMsg);
      setIsCalling(false);
      setIsCallProcessing(false);
      setIncomingCall(null);
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
      alert("Call rejected by user");
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [salon._id]);

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await getChats()
        setChats(response.data);
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
    try {
      const response =  await getMessages(chat.userId as string)
      setMessages(response.data);
      const roomName = [salon._id, chat.userId].sort().join("-");
      socketRef.current?.emit("joinChat", { salonId: chat.userId });
      console.log(`Salon joining room: ${roomName}`);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };
  useEffect(() => {
    console.log("[CLIENT] Messages state updated:", messages);
  }, [messages]);

  useEffect(() => {
    socketRef.current?.on("newMessage", (message: IMessage) => {
      // Normalize message
      const normalizedMessage = { ...message, id: message._id };
      if (
        selectedChat &&
        (message.senderId === selectedChat.userId ||
          message.recipientId === selectedChat.userId)
      ) {
        setMessages((prev) => {
          const updatedMessages = [...prev, normalizedMessage];
          return updatedMessages;
        });
      }
      setChats((prevChats) =>
        prevChats.map((chat) =>
          chat.userId === message.senderId ||
          chat.userId === message.recipientId
            ? { ...chat, lastMessage: message.content, lastActive: "just now" }
            : chat
        )
      );
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
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
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
    // if (!callContainerRef.current || !selectedChat || !otherUserId) {
    //   console.error("[CLIENT] joinVideoCall: Missing required data");
    //   setIsCalling(false);
    //   setIsCallProcessing(false);
    //   return;
    // }

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
          navigate("/salon/messages"); // auto-redirect to home
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

  return (
    <div className="flex h-screen bg-gradient-to-br from-purple-100 to-orange-100">
      <SalonSidebar />
      <div className="flex-1 flex flex-col">
        <SalonHeader />
        <div className="flex-1 flex h-full">
          <div className="w-1/3 bg-white p-4 border-r shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-purple-700">Chats</h2>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1 rounded-lg transition">
                + Compose
              </Button>
            </div>
            <Input
              placeholder="Search chats..."
              className="mb-4 border-purple-300"
            />
            <div className="space-y-2">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`p-3 border border-black rounded-lg cursor-pointer transition-colors ${
                    selectedChat?.id === chat.id ? "bg-purple-200" : "bg-white"
                  }`}
                  onClick={() => handleChatSelect(chat)}
                >
                  <p className="font-semibold text-gray-800">{chat.name}</p>
                  <p className="text-sm text-gray-600 truncate">
                    {chat.lastMessage}
                  </p>
                  <span className="text-xs text-gray-400">
                    {formatMessageTime(chat.lastActive)}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="w-2/3 flex flex-col">
            {selectedChat ? (
              <>
                <div className="p-4 bg-white border-b flex items-center shadow-sm">
                  <img
                    src={
                      selectedChat?.image || "https://via.placeholder.com/40"
                    }
                    alt="User"
                    className="rounded-full mr-3 w-10 h-10 object-cover"
                  />
                  <h2 className="text-xl font-semibold text-gray-800">
                    {selectedChat.name}
                  </h2>
                  <Button
                    onClick={startVideoCall}
                    disabled={isCalling || !!incomingCall || isCallProcessing}
                    className="ml-auto bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full"
                  >
                    <Video />
                  </Button>
                </div>
                {incomingCall && (
                  <div className="p-4 bg-yellow-100 border-b">
                    <p>Incoming video call from user...</p>
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
                    <div
                      ref={callContainerRef}
                      style={{ width: "100%", height: "300px" }}
                    />
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
                <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
                  {messages.map((msg) => (
                    <div
                      key={msg._id}
                      className={`mb-4 flex ${
                        msg.senderType === "Salon"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div className="flex flex-col max-w-xs">
                        {formatMessageTime(msg.timestamp) && (
                          <div
                            className={`text-xs text-gray-500 mb-1 ${
                              msg.senderType === "Salon"
                                ? "text-right"
                                : "text-left"
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
                            className={`p-3 rounded-lg shadow-md ${
                              msg.senderType === "Salon"
                                ? "bg-purple-600 text-white"
                                : "bg-white text-gray-800"
                            }`}
                          >
                            {msg.content}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                   <div ref={messageEndRef} />
                </div>
                <div className="p-4 border-t bg-white flex flex-col shadow-inner">
                  <div className="flex items-center">
                    <Input
                      placeholder="Type your message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="flex-1 mr-2 border-purple-300 focus:ring-purple-500"
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
                      <ImageIcon className="text-gray-600" />
                    </Button>
                    <Button className="mr-2 bg-gray-200 hover:bg-gray-300 p-2 rounded-full transition">
                      <Mic className="text-gray-600" />
                    </Button>
                    <Button
                      onClick={sendMessage}
                      className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full transition"
                    >
                      <Send />
                    </Button>
                  </div>
                  {image && (
                    <div className="mt-2 text-sm text-gray-600">
                      Selected image: {image.name}{" "}
                      <button
                        onClick={() => setImage(null)}
                        className="text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                    <div ref={messageEndRef}></div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50">
                <div className="text-center">
                  <h3 className="text-2xl font-semibold text-gray-700">
                    No Chat Selected
                  </h3>
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
