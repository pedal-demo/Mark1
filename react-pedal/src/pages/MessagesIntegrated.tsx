import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  MessageCircle,
  Send,
  Phone,
  Video,
  MoreVertical,
  Plus,
  ArrowLeft,
  Check,
  CheckCheck,
} from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';
import { useMessages } from '../contexts/MessageContext';
import { Tables } from '../lib/supabase';

const Messages: React.FC = () => {
  const { user } = useAuth();
  const { 
    conversations, 
    messages: messageList, 
    sendMessage, 
    setActiveConversation, 
    activeConversation,
    loading 
  } = useMessages();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [composerText, setComposerText] = useState('');

  // Handle conversation selection
  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversationId(conversationId);
    setActiveConversation(conversationId);
  };

  // Handle sending message
  const handleSendMessage = async () => {
    if (!composerText.trim() || !selectedConversationId) return;
    
    await sendMessage(composerText, undefined, selectedConversationId);
    setComposerText('');
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter((conv: any) => 
    conv.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.participants?.some((p: any) => p.name?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-app-text-muted">Please sign in to view messages</p>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-app-background">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-app-borders flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-app-borders">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-app-text-primary">Messages</h1>
            <button className="p-2 hover:bg-app-card-surface rounded-lg transition-colors">
              <Plus className="w-5 h-5 text-app-text-muted" />
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-app-text-muted" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-app-card-surface border border-app-borders rounded-lg text-app-text-primary placeholder-app-text-muted focus:border-app-primary-accent focus:outline-none"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center">
              <div className="animate-spin w-6 h-6 border-2 border-app-primary-accent border-t-transparent rounded-full mx-auto"></div>
              <p className="text-app-text-muted mt-2">Loading conversations...</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-4 text-center">
              <MessageCircle className="w-12 h-12 text-app-text-muted mx-auto mb-2" />
              <p className="text-app-text-muted">No conversations yet</p>
              <p className="text-sm text-app-text-muted mt-1">Start a new conversation</p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                whileHover={{ backgroundColor: 'rgba(255, 107, 0, 0.05)' }}
                onClick={() => handleConversationSelect(conversation.id)}
                className={`p-4 cursor-pointer border-b border-app-borders/50 ${
                  selectedConversationId === conversation.id ? 'bg-app-primary-accent/10' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={conversation.avatar || '/default-avatar.png'}
                      alt={conversation.name}
                      className="w-12 h-12 rounded-full"
                    />
                    {conversation.online && (
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-app-background"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-app-text-primary truncate">
                        {conversation.name}
                      </h3>
                      <span className="text-xs text-app-text-muted">
                        {conversation.lastMessageTime}
                      </span>
                    </div>
                    <p className="text-sm text-app-text-muted truncate">
                      {conversation.lastMessage}
                    </p>
                  </div>
                  {conversation.unreadCount > 0 && (
                    <div className="w-5 h-5 bg-app-primary-accent rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">
                        {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversationId ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-app-borders flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={filteredConversations.find(c => c.id === selectedConversationId)?.avatar || '/default-avatar.png'}
                  alt="User"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h2 className="font-semibold text-app-text-primary">
                    {filteredConversations.find(c => c.id === selectedConversationId)?.name}
                  </h2>
                  <p className="text-sm text-app-text-muted">
                    {filteredConversations.find(c => c.id === selectedConversationId)?.online ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 hover:bg-app-card-surface rounded-lg transition-colors">
                  <Phone className="w-5 h-5 text-app-text-muted" />
                </button>
                <button className="p-2 hover:bg-app-card-surface rounded-lg transition-colors">
                  <Video className="w-5 h-5 text-app-text-muted" />
                </button>
                <button className="p-2 hover:bg-app-card-surface rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5 text-app-text-muted" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messageList.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-app-text-muted mx-auto mb-2" />
                  <p className="text-app-text-muted">No messages yet</p>
                  <p className="text-sm text-app-text-muted mt-1">Start the conversation!</p>
                </div>
              ) : (
                messageList.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender_id === user.id
                        ? 'bg-app-primary-accent text-white'
                        : 'bg-app-card-surface text-app-text-primary'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center justify-end gap-1 mt-1">
                        <span className="text-xs opacity-70">
                          {new Date(message.created_at).toLocaleTimeString()}
                        </span>
                        {message.sender_id === user.id && (
                          <CheckCheck className="w-3 h-3 opacity-70" />
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Message Composer */}
            <div className="p-4 border-t border-app-borders">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={composerText}
                  onChange={(e) => setComposerText(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 px-4 py-2 bg-app-card-surface border border-app-borders rounded-lg text-app-text-primary placeholder-app-text-muted focus:border-app-primary-accent focus:outline-none"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!composerText.trim()}
                  className="p-2 bg-app-primary-accent text-white rounded-lg hover:bg-app-primary-accent/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageCircle className="w-16 h-16 text-app-text-muted mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-app-text-primary mb-2">Select a conversation</h2>
              <p className="text-app-text-muted">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
