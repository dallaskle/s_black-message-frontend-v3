import { useState, useMemo, useEffect } from 'react';
import { useMessage } from '../../contexts/MessageContext';
import type { Message as MessageType } from '../../types/message';
import { DocumentIcon, PhotoIcon, VideoCameraIcon } from '@heroicons/react/24/outline';
import { fileApi } from '../../api/file';
import { FilePreview } from '../file/FilePreview';

// Common emojis for quick reactions
const QUICK_REACTIONS = ['👍', '❤️', '😂', '🎉', '🤔', '👀'];

interface MessageProps {
  message: MessageType;
  onThreadClick?: (messageId: string) => void;
}

function getFileIcon(fileType: string) {
  if (fileType.startsWith('image/')) {
    return <PhotoIcon className="w-5 h-5" />;
  } else if (fileType.startsWith('video/')) {
    return <VideoCameraIcon className="w-5 h-5" />;
  }
  return <DocumentIcon className="w-5 h-5" />;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  const kb = bytes / 1024;
  if (kb < 1024) return kb.toFixed(1) + ' KB';
  const mb = kb / 1024;
  if (mb < 1024) return mb.toFixed(1) + ' MB';
  const gb = mb / 1024;
  return gb.toFixed(1) + ' GB';
}

export function Message({ message, onThreadClick }: MessageProps) {
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
      
      {/* Thread info */}
      {threadInfo && (
        <button
          onClick={() => onThreadClick?.(message.id)}
          className="mt-2 text-sm text-accent-primary hover:text-accent-primary/90"
        >
          {threadInfo.count} {threadInfo.count === 1 ? 'reply' : 'replies'} • Last reply at {threadInfo.lastReplyTime}
        </button>
      )}

      {/* Add reactions section */}
      {renderReactions()}

      {message.file && (
        <div className="mt-2">
          <div className="flex items-center gap-2 p-2 bg-background-secondary rounded-lg max-w-fit">
            {getFileIcon(message.file.file_type)}
            <div className="flex flex-col">
              <button
                onClick={async () => {
                  try {
                    const url = await fileApi.getFileUrl(message.file!.id);
                    window.open(url, '_blank');
                  } catch (err) {
                    console.error('Failed to get file URL:', err);
                  }
                }}
                className="text-sm font-medium text-accent-primary hover:underline text-left"
              >
                {message.file.file_name}
              </button>
              <span className="text-xs text-text-secondary">
                {formatFileSize(message.file.file_size)}
              </span>
            </div>
          </div>
          <FilePreview file={message.file} />
        </div>
      )}
    </div>
  );
}