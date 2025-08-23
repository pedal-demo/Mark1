import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  MessageCircle, 
  Send, 
  Phone, 
  Video, 
  MoreVertical,
  Plus,
  Smile,
  Image,
  Paperclip,
  ArrowLeft,
  Check,
  CheckCheck,
  Circle
} from 'lucide-react';

interface Message {
  id: number;
  sender: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  type: 'direct' | 'group';
  members?: number;
}

interface ChatMessage {
  id: number;
  text: string;
  sender: 'me' | 'them';
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

const ModernMessages: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChat, setSelectedChat] = useState<Message | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const messages: Message[] = [
    {
      id: 1,
      sender: 'Alex Rodriguez',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      lastMessage: 'Great ride today! When are we doing the next one?',
      time: '2 min ago',
      unread: 2,
      online: true,
      type: 'direct'
    },
    {
      id: 2,
      sender: 'Mountain Riders Group',
      avatar: 'https://images.unsplash.com/photo-1544191696-15693072b5a5?w=150',
      lastMessage: 'Sarah: Anyone up for a weekend trail ride?',
      time: '15 min ago',
      unread: 5,
      online: false,
      type: 'group',
      members: 12
    },
    {
      id: 3,
      sender: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
      lastMessage: 'Thanks for the bike maintenance tips!',
      time: '1 hour ago',
      unread: 0,
      online: true,
      type: 'direct'
    },
    {
      id: 4,
      sender: 'City Cyclists',
      avatar: 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=150',
      lastMessage: 'Mike: New bike lanes opened on 5th street!',
      time: '3 hours ago',
      unread: 1,
      online: false,
      type: 'group',
      members: 45
    }
  ];

  const sampleChatMessages: ChatMessage[] = [
    {
      id: 1,
      text: "Hey! How was your ride today?",
      sender: 'me',
      timestamp: '2:30 PM',
      status: 'read'
    },
    {
      id: 2,
      text: "Great ride today! When are we doing the next one?",
      sender: 'them',
      timestamp: '2:32 PM',
      status: 'delivered'
    },
    {
      id: 3,
      text: "How about this weekend? I found a new trail!",
      sender: 'me',
      timestamp: '2:35 PM',
      status: 'sent'
    }
  ];

  const filteredMessages = messages.filter(message =>
    message.sender.toLowerCase().includes(searchTerm.toLowerCase()) ||
    message.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedChat) {
      const newChatMessage: ChatMessage = {
        id: chatMessages.length + 1,
        text: newMessage,
        sender: 'me',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'sent'
      };
      setChatMessages([...chatMessages, newChatMessage]);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleChatSelect = (message: Message) => {
    setSelectedChat(message);
    setChatMessages(sampleChatMessages);
  };

  return (
    <div className="min-h-screen bg-[#1F1F1F] flex">
      {/* Left Panel - Message List */}
      <div className={`${selectedChat && isMobile ? 'hidden' : 'flex'} flex-col w-full md:w-80 lg:w-96 bg-[#2A2A2A] border-r border-gray-700`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-[#EAEAEA]">Messages</h1>
            <button className="p-2 bg-[#FF6B00] text-white rounded-lg hover:bg-orange-600 transition-colors">
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#A0A0A0]" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#1F1F1F] border border-gray-700 rounded-lg text-[#EAEAEA] placeholder-[#A0A0A0] focus:outline-none focus:border-[#FF6B00] transition-colors"
            />
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto">
          {filteredMessages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => handleChatSelect(message)}
              className={`p-4 hover:bg-[#1F1F1F] transition-colors cursor-pointer border-b border-gray-800 ${
                selectedChat?.id === message.id ? 'bg-[#FF6B00]/10 border-l-4 border-l-[#FF6B00]' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={message.avatar}
                    alt={message.sender}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {message.online && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#2A2A2A]"></div>
                  )}
                  {message.type === 'group' && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#FF6B00] rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">{message.members}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-[#EAEAEA] truncate">
                      {message.sender}
                    </h3>
                    <span className="text-xs text-[#A0A0A0] flex-shrink-0">
                      {message.time}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-[#A0A0A0] truncate">
                      {message.lastMessage}
                    </p>
                    {message.unread > 0 && (
                      <div className="w-5 h-5 bg-[#FF6B00] rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                        <span className="text-xs text-white font-bold">
                          {message.unread}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Right Panel - Chat Area */}
      <div className={`${!selectedChat && isMobile ? 'hidden' : 'flex'} flex-1 flex-col bg-[#1F1F1F]`}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-[#2A2A2A]">
              <div className="flex items-center gap-3">
                {isMobile && (
                  <button
                    onClick={() => setSelectedChat(null)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors mr-2"
                  >
                    <ArrowLeft className="w-5 h-5 text-[#EAEAEA]" />
                  </button>
                )}
                <div className="relative">
                  <img
                    src={selectedChat.avatar}
                    alt={selectedChat.sender}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  {selectedChat.online && (
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#2A2A2A]"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-[#EAEAEA]">
                    {selectedChat.sender}
                  </h3>
                  <p className="text-xs text-[#A0A0A0]">
                    {selectedChat.online ? 'Online' : `Last seen ${selectedChat.time}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                  <Phone className="w-5 h-5 text-[#A0A0A0]" />
                </button>
                <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                  <Video className="w-5 h-5 text-[#A0A0A0]" />
                </button>
                <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5 text-[#A0A0A0]" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              <div className="text-center text-[#A0A0A0] text-sm mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="h-px bg-gray-700 flex-1"></div>
                  <span>Start of conversation with {selectedChat.sender}</span>
                  <div className="h-px bg-gray-700 flex-1"></div>
                </div>
              </div>

              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                      msg.sender === 'me'
                        ? 'bg-[#FF6B00] text-white'
                        : 'bg-[#2A2A2A] text-[#EAEAEA]'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                    <div className={`flex items-center justify-end gap-1 mt-1 ${
                      msg.sender === 'me' ? 'text-white/70' : 'text-[#A0A0A0]'
                    }`}>
                      <span className="text-xs">{msg.timestamp}</span>
                      {msg.sender === 'me' && (
                        <div className="ml-1">
                          {msg.status === 'sent' && <Check className="w-3 h-3" />}
                          {msg.status === 'delivered' && <CheckCheck className="w-3 h-3" />}
                          {msg.status === 'read' && <CheckCheck className="w-3 h-3 text-blue-400" />}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-700 bg-[#2A2A2A]">
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                  <Paperclip className="w-5 h-5 text-[#A0A0A0]" />
                </button>
                <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                  <Image className="w-5 h-5 text-[#A0A0A0]" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-2 bg-[#1F1F1F] border border-gray-700 rounded-full text-[#EAEAEA] placeholder-[#A0A0A0] focus:outline-none focus:border-[#FF6B00] transition-colors pr-12"
                  />
                  <button className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-700 rounded-full transition-colors">
                    <Smile className="w-5 h-5 text-[#A0A0A0]" />
                  </button>
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-[#FF6B00] text-white rounded-full hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-24 h-24 bg-[#2A2A2A] rounded-full flex items-center justify-center mb-6">
                <MessageCircle className="w-12 h-12 text-[#FF6B00]" />
              </div>
              <h3 className="text-xl font-semibold text-[#EAEAEA] mb-2">
                Your Messages
              </h3>
              <p className="text-[#A0A0A0] mb-6 max-w-sm">
                Send private messages to friends and fellow riders. Select a conversation to start chatting.
              </p>
              <button className="px-6 py-2 bg-[#FF6B00] text-white rounded-lg hover:bg-orange-600 transition-colors">
                Start New Chat
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernMessages;
