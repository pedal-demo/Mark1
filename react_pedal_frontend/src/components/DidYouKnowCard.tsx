import React, { useState } from 'react';
import { ArrowUp, ArrowDown, MessageCircle, Share2, Bookmark, MoreHorizontal, Hash } from 'lucide-react';
import { motion } from 'framer-motion';

interface DidYouKnowFact {
  id: string;
  text: string;
  hashtags: string[];
  upvotes: number;
  downvotes: number;
  comments: number;
  saved: boolean;
}

interface DidYouKnowCardProps {
  fact: DidYouKnowFact;
  onUpvote: (id: string) => void;
  onDownvote: (id: string) => void;
  onComment: (id: string) => void;
  onShare: (id: string) => void;
  onSave: (id: string) => void;
}

const DidYouKnowCard: React.FC<DidYouKnowCardProps> = ({ fact, onUpvote, onDownvote, onComment, onShare, onSave }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-xl mx-auto mb-6 rounded-2xl bg-app-card-surface/95 border border-app-borders shadow-lg backdrop-blur-xl px-6 py-5"
    >
      <div className="flex items-start gap-4">
        {/* Upvote/Downvote */}
        <div className="flex flex-col items-center gap-1 mt-1">
          <button
            className={`p-1 rounded-full hover:bg-app-primary-accent/20 transition-colors ${fact.upvotes > fact.downvotes ? 'text-app-primary-accent' : 'text-app-text-muted'}`}
            onClick={() => onUpvote(fact.id)}
            aria-label="Upvote"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
          <span className="font-semibold text-app-text-primary text-sm">{fact.upvotes - fact.downvotes}</span>
          <button
            className={`p-1 rounded-full hover:bg-red-500/20 transition-colors ${fact.downvotes > fact.upvotes ? 'text-red-500' : 'text-app-text-muted'}`}
            onClick={() => onDownvote(fact.id)}
            aria-label="Downvote"
          >
            <ArrowDown className="w-5 h-5" />
          </button>
        </div>

        {/* Fact Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase text-app-primary-accent tracking-wider bg-app-primary-accent/10 px-2 py-0.5 rounded">Did You Know?</span>
            <button className="ml-auto p-1 rounded hover:bg-app-background transition-colors">
              <MoreHorizontal className="w-4 h-4 text-app-text-muted" />
            </button>
          </div>
          <div className="text-app-text-primary text-base font-medium mb-2">
            {fact.text}
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {fact.hashtags.map((tag) => (
              <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded bg-app-background text-app-primary-accent text-xs font-semibold">
                <Hash className="w-3 h-3" />{tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-5">
            <button
              className="flex items-center gap-1 text-app-text-muted hover:text-app-primary-accent transition-colors"
              onClick={() => onComment(fact.id)}
              aria-label="Comment"
            >
              <MessageCircle className="w-4 h-4" />
              <span className="text-xs font-semibold">{fact.comments}</span>
            </button>
            <button
              className="flex items-center gap-1 text-app-text-muted hover:text-app-primary-accent transition-colors"
              onClick={() => onShare(fact.id)}
              aria-label="Share"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-xs font-semibold">Share</span>
            </button>
            <button
              className={`flex items-center gap-1 text-app-text-muted hover:text-app-primary-accent transition-colors ${fact.saved ? 'text-app-primary-accent' : ''}`}
              onClick={() => onSave(fact.id)}
              aria-label="Save"
            >
              <Bookmark className="w-4 h-4" />
              <span className="text-xs font-semibold">{fact.saved ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DidYouKnowCard;
