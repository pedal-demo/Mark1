import React, { useState } from 'react';
import { MessageCircle, CornerDownRight } from 'lucide-react';

import { Comment, Author } from '../contexts/PostContext';

interface ThreadedCommentsProps {
  postId: number;
  comments: Comment[];
  onAddComment: (postId: number, parentId: number | null, content: string) => void;
}

const ThreadedComments: React.FC<ThreadedCommentsProps> = ({ postId, comments, onAddComment }) => {
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');

  const handleSubmit = (parentId: number | null) => {
    if (commentText.trim()) {
      onAddComment(postId, parentId, commentText.trim());
      setCommentText('');
      setReplyTo(null);
    }
  };

  const renderComments = (comments: Comment[], parentId: number | null = null, level = 0) => (
    <ul className={`pl-${level * 4} space-y-2`}>
      {comments.map(comment => (
        <li key={comment.id} className={`bg-gray-800 rounded-lg p-2 ${level > 0 ? 'ml-4 border-l-4 border-orange-500/30' : ''}`}>
          <div className="flex gap-2 items-start">
            <img src={comment.author.avatar} alt={comment.author.name} className="w-7 h-7 rounded-full mt-1" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-app-text-primary text-xs">{comment.author.name}</span>
                <span className="text-xs text-app-text-muted">{comment.timestamp}</span>
              </div>
              <div className="text-app-text-primary text-sm mt-1">{comment.content}</div>
              <button
                className="text-xs text-orange-400 hover:underline mt-1"
                onClick={() => setReplyTo(comment.id)}
              >
                Reply
              </button>
              {replyTo === comment.id && (
                <div className="flex gap-2 mt-2">
                  <input
                    type="text"
                    className="flex-1 px-2 py-1 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-orange-500 text-xs"
                    placeholder="Write a reply..."
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleSubmit(comment.id); }}
                  />
                  <button
                    className="px-2 py-1 bg-orange-500 text-white rounded text-xs hover:bg-orange-600"
                    onClick={() => handleSubmit(comment.id)}
                  >
                    <CornerDownRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-8 mt-2">
              {renderComments(comment.replies, comment.id, level + 1)}
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
      <div className="mb-2 font-semibold text-app-text-primary text-sm flex items-center gap-2">
        <MessageCircle className="w-4 h-4 text-orange-500" /> Comments
      </div>
      {renderComments(comments)}
      <div className="flex gap-2 mt-4">
        <input
          type="text"
          className="flex-1 px-3 py-2 rounded bg-gray-700 text-white border border-gray-600 focus:outline-none focus:border-orange-500 text-sm"
          placeholder="Add a comment..."
          value={replyTo === null ? commentText : ''}
          onChange={e => { setCommentText(e.target.value); setReplyTo(null); }}
          onKeyDown={e => { if (e.key === 'Enter') handleSubmit(null); }}
        />
        <button
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 text-sm"
          onClick={() => handleSubmit(null)}
        >
          Post
        </button>
      </div>
    </div>
  );
};

export default ThreadedComments;
