import { useState } from 'react';
import { useMessage } from '../../contexts/MessageContext';
import type { Message as MessageType } from '../../types/message';

// Common emojis for quick reactions
const QUICK_REACTIONS = ['👍', '❤️', '😂', '🎉', '🤔', '👀'];

interface MessageProps {
  message: MessageType;
}

export function Message({ message }: MessageProps) {
  const { updateMessage, deleteMessage, toggleReaction } = useMessage();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [showReactionPicker, setShowReactionPicker] = useState(false);

  const handleUpdate = async () => {
    try {
      await updateMessage(message.id, editContent);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update message:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMessage(message.id);
    } catch (err) {
      console.error('Failed to delete message:', err);
    }
  };

  const handleReaction = async (emoji: string) => {
    try {
      await toggleReaction(message.id, emoji);
      setShowReactionPicker(false);
    } catch (err) {
      console.error('Failed to toggle reaction:', err);
    }
  };

  if (isEditing) {
    return (
      <div className="group px-4 py-2 hover:bg-background-secondary">
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
          className="w-full bg-background-primary border border-text-secondary/20 rounded-lg px-3 py-2 text-text-primary"
          rows={3}
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleUpdate}
            className="text-sm text-accent-primary hover:text-accent-primary/90"
          >
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            className="text-sm text-text-secondary hover:text-text-primary"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group px-4 py-2 hover:bg-background-secondary">
      <div className="flex items-start justify-between">
        <div>
          <span className="font-medium text-text-primary">{message.name}</span>
          <span className="ml-2 text-sm text-text-secondary">
            {new Date(message.created_at).toLocaleTimeString()}
          </span>
        </div>
        <div className="opacity-0 group-hover:opacity-100 flex gap-2">
          <button
            onClick={() => setIsEditing(true)}
            className="text-sm text-text-secondary hover:text-text-primary"
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="text-sm text-accent-error hover:text-accent-error/90"
          >
            Delete
          </button>
        </div>
      </div>
      <p className="mt-1 text-text-primary whitespace-pre-wrap">{message.content}</p>
      
      {/* Reactions */}
      <div className="mt-2 flex flex-wrap gap-2">
        {message?.reactions ? Object.entries(message.reactions).map(([emoji, count]) => (
          <button
            key={emoji}
            onClick={() => handleReaction(emoji)}
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm
              ${message.userReactions.includes(emoji)
                ? 'bg-accent-primary/20 text-text-primary'
                : 'bg-background-secondary text-text-secondary hover:bg-background-secondary/80'
              }`}
          >
            <span>{emoji}</span>
            <span>{count}</span>
          </button>
        )) : (
          <span className="text-text-secondary">No reactions yet</span>
        )}
        
        {/* Add reaction button */}
        <div className="relative">
          <button
            onClick={() => setShowReactionPicker(!showReactionPicker)}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm
              bg-background-secondary text-text-secondary hover:bg-background-secondary/80"
          >
            <span>+</span>
          </button>
          
          {/* Quick reaction picker */}
          {showReactionPicker && (
            <div className="absolute bottom-full left-0 mb-2 p-2 bg-background-secondary 
              rounded-lg shadow-lg flex gap-2 z-10">
              {QUICK_REACTIONS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="hover:bg-background-primary p-1 rounded"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 