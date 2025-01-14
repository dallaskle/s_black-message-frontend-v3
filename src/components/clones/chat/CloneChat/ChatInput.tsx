import React, { useState, KeyboardEvent } from 'react';
import { Button } from '../../../ui/Button';
import Spinner from '../../../ui/Spinner';

interface ChatInputProps {
    onSendMessage: (message: string) => void;
    isLoading?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
    onSendMessage,
    isLoading = false,
}) => {
    const [message, setMessage] = useState('');

    const handleSend = () => {
        if (message.trim() && !isLoading) {
            onSendMessage(message.trim());
            setMessage('');
        }
    };

    const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex space-x-2">
            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 min-h-[40px] max-h-[200px] p-2 border rounded-md resize-y"
                disabled={isLoading}
            />
            <Button
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                className="self-end"
            >
                {isLoading ? <Spinner /> : 'Send'}
            </Button>
        </div>
    );
}; 