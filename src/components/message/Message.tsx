import { useState, useMemo, useEffect } from 'react';
import { useMessage } from '../../contexts/MessageContext';
import type { Message as MessageType } from '../../types/message';
import { FileData } from '../../types/file';

// Common emojis for quick reactions
const QUICK_REACTIONS = ['👍', '❤️', '😂', '🎉', '🤔', '👀'];

interface MessageProps {
  message: MessageType;
  onThreadClick?: (messageId: string) => void;
  isInThread?: boolean;
}

export function Message({ message, onThreadClick, isInThread }: MessageProps) {
  const { updateMessage, deleteMessage, toggleReaction, messages } = useMessage();
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
      // Close emoji picker immediately
      setShowReactionPicker(false);
      await toggleReaction(message.id, emoji);
    } catch (err) {
      console.error('Failed to toggle reaction:', err);
    }
  };

  // Calculate thread info
  const threadInfo = useMemo(() => {
    // Find all replies to this message
    const replies = messages.filter(m => m.parent_message_id === message.id);
    if (replies.length === 0) return null;

    // Get the latest reply
    const lastReply = replies.reduce((latest, reply) => {
      return new Date(reply.created_at) > new Date(latest.created_at) ? reply : latest;
    }, replies[0]);

    const lastReplyTime = new Date(lastReply.created_at).toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit'
    });

    return {
      count: replies.length,
      lastReplyTime
    };
  }, [messages, message.id]);

  // Add a useEffect to update reactions when they change
  useEffect(() => {
    if (showReactionPicker) {
      // Close reaction picker when clicking outside
      const handleClickOutside = (e: MouseEvent) => {
        if (!(e.target as Element).closest('.reaction-picker')) {
          setShowReactionPicker(false);
        }
      };
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showReactionPicker]);

  // Render reactions section
  const renderReactions = () => {
    // Initialize empty reactions object if it doesn't exist
    const reactions = message.reactions || {};
    const userReactions = message.userReactions || [];

    return (
      <div className="mt-2 flex flex-wrap gap-2">
        {Object.entries(reactions).length > 0 ? (
          Object.entries(reactions).map(([emoji, count]) => (
            <button
              key={emoji}
              onClick={() => handleReaction(emoji)}
              className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm
                ${userReactions.includes(emoji)
                  ? 'bg-accent-primary/20 text-text-primary'
                  : 'bg-background-secondary text-text-secondary hover:bg-background-secondary/80'
                }`}
            >
              <span>{emoji}</span>
              <span>{count}</span>
            </button>
          ))
        ) : (
          <span className="text-text-secondary text-sm">No reactions yet</span>
        )}
        
        {/* Add reaction button */}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowReactionPicker(!showReactionPicker);
            }}
            className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm
              bg-background-secondary text-text-secondary hover:bg-background-secondary/80"
          >
            <span>+</span>
          </button>
          
          {showReactionPicker && (
            <div className="absolute bottom-full left-0 mb-2 p-2 bg-background-secondary 
              rounded-lg shadow-lg flex gap-2 z-10 reaction-picker">
              {QUICK_REACTIONS.map(emoji => (
                <button
                  key={emoji}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReaction(emoji);
                  }}
                  className="hover:bg-background-primary p-1 rounded"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Add this function to render files
  const renderFiles = (files?: FileData[]) => {
    if (!files || files.length === 0) return null;

    return (
      <div className="mt-2 flex flex-wrap gap-2">
        {files.filter(file => file != null).map((file) => {
          const isImage = file?.mime_type?.startsWith('image/');
          
          return (
            <a
              key={file.id}
              href={file.file_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center p-2 bg-background-secondary rounded-lg hover:bg-background-secondary/80"
            >
              {isImage ? (
                <img 
                  src={file.thumbnail_url || file.file_url} 
                  alt={file.file_name}
                  className="max-w-[200px] max-h-[200px] rounded-lg"
                />
              ) : (
                <>
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-sm text-text-primary">{file.file_name}</span>
                </>
              )}
            </a>
          );
        })}
      </div>
    );
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
        <div className="hidden group-hover:flex gap-2">
          <button
            onClick={() => onThreadClick?.(message.id)}
            className="text-sm text-text-secondary hover:text-text-primary"
          >
            Reply
          </button>
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
      <p className="mt-1 text-text-primary whitespace-pre-wrap font-thin">{message.content}</p>
      
      {/* Add files display */}
      {renderFiles(message.files)}
      
      {/* Thread info */}
      {threadInfo && !isInThread && (
        <button
          onClick={() => onThreadClick?.(message.id)}
          className="mt-2 text-sm text-accent-primary hover:text-accent-primary/90"
        >
          {threadInfo.count} {threadInfo.count === 1 ? 'reply' : 'replies'} • Last reply at {threadInfo.lastReplyTime}
        </button>
      )}

      {/* Add reactions section */}
      {renderReactions()}
    </div>
  );
} 