import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, Plus, Phone, Video, MoreVertical, Send, Paperclip, 
  ArrowLeft, MessageCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useMessages } from '../contexts/MessageContext';

const Messages: React.FC = () => {
  const { user } = useAuth();
  const { conversations, messages, sendMessage, loading } = useMessages();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedConversationId) return;
    
    try {
      await sendMessage(selectedConversationId, messageText.trim());
      setMessageText('');
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const conversationMessages = selectedConversationId ? ((messages as unknown as Record<string, any[]>)[selectedConversationId] || []) : [];

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#1F1F1F] flex pb-24 md:pb-0">
      {/* Left Panel - Conversations List */}
      <div className={`${selectedConversation && isMobile ? 'hidden' : 'flex'} flex-col w-full md:w-80 lg:w-96 bg-[#2A2A2A] border-r border-gray-700`}>
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
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[#1F1F1F] border border-gray-700 rounded-lg text-[#EAEAEA] placeholder-[#A0A0A0] focus:outline-none focus:border-[#FF6B00] transition-colors"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-[#A0A0A0]">Loading conversations...</div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-[#A0A0A0]">
              {searchTerm ? 'No conversations found' : 'No conversations yet'}
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedConversationId(conversation.id)}
                className={`p-4 hover:bg-[#1F1F1F] transition-colors cursor-pointer border-b border-gray-800 ${
                  selectedConversationId === conversation.id ? 'bg-[#FF6B00]/10 border-l-4 border-l-[#FF6B00]' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img 
                      src={conversation.avatar || 'https://i.pravatar.cc/100'} 
                      alt={conversation.name} 
                      className="w-12 h-12 rounded-full object-cover" 
                    />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#2A2A2A]"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-[#EAEAEA] truncate">{conversation.name}</h3>
                      <span className="text-xs text-[#A0A0A0] flex-shrink-0">
                        {conversation.lastMessageAt ? new Date(conversation.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>
                    <p className="text-sm text-[#A0A0A0] truncate">
                      {conversation.lastMessage || 'No messages yet'}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Right Panel - Chat Area */}
      <div className={`${!selectedConversation && isMobile ? 'hidden' : 'flex'} flex-1 flex-col bg-[#1F1F1F] relative`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-[#2A2A2A]">
              <div className="flex items-center gap-3">
                {isMobile && (
                  <button
                    onClick={() => setSelectedConversationId(null)}
                    className="p-2 hover:bg-gray-700 rounded-lg transition-colors mr-2"
                  >
                    <ArrowLeft className="w-5 h-5 text-[#EAEAEA]" />
                  </button>
                )}
                <div className="relative">
                  <img 
                    src={selectedConversation.avatar || 'https://i.pravatar.cc/100'} 
                    alt={selectedConversation.name} 
                    className="w-10 h-10 rounded-full object-cover" 
                  />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#2A2A2A]"></div>
                </div>
                <div>
                  <h3 className="font-semibold text-[#EAEAEA]">{selectedConversation.name}</h3>
                  <p className="text-xs text-[#A0A0A0]">Online</p>
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
            <div className="flex-1 p-4 overflow-y-auto space-y-4 pb-28 md:pb-6">
              {conversationMessages.length === 0 ? (
                <div className="text-center text-[#A0A0A0] text-sm">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <div className="h-px bg-gray-700 flex-1"></div>
                    <span>Start of conversation</span>
                    <div className="h-px bg-gray-700 flex-1"></div>
                  </div>
                </div>
              ) : (
                conversationMessages.map((message: any) => (
                  <div
                    key={message.id}
                    className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                        message.senderId === user?.id 
                          ? 'bg-[#FF6B00] text-white' 
                          : 'bg-[#2A2A2A] text-[#EAEAEA]'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 ${
                        message.senderId === user?.id ? 'text-white/70' : 'text-[#A0A0A0]'
                      }`}>
                        <span className="text-xs">
                          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="sticky bottom-0 z-20 p-3 md:p-4 border-t border-gray-700 bg-[#2A2A2A] pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_8px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-3">
                <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                  <Paperclip className="w-5 h-5 text-[#A0A0A0]" />
                </button>
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="w-full px-4 py-2 bg-[#1F1F1F] border border-gray-700 rounded-full text-[#EAEAEA] placeholder-[#A0A0A0] focus:outline-none focus:border-[#FF6B00] transition-colors"
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
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
              <MessageCircle className="w-16 h-16 text-[#A0A0A0] mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-[#EAEAEA] mb-2">Select a conversation</h2>
              <p className="text-[#A0A0A0]">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
