import React from 'react';
import { ChatMessage } from '../../../../types/clone';
import { Avatar } from '../../../ui/avatar';

interface ChatHistoryProps {
    messages: ChatMessage[];
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ messages }) => {
    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (messages.length === 0) {
        return (
            <div className="h-full flex items-center justify-center text-gray-500">
                No messages yet. Start a conversation!
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {messages.map((message, index) => (
                <div
                    key={`${message.timestamp}-${index}`}
                    className={`flex ${
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                >
                    <div
                        className={`flex items-start space-x-2 max-w-[80%] ${
                            message.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                        }`}
                    >
                        <Avatar
                            className="w-8 h-8"
                            //fallback={message.role === 'user' ? 'U' : 'A'}
                        />
                        <div
                            className={`rounded-lg p-3 ${
                                message.role === 'user'
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-900'
                            }`}
                        >
                            <p className="whitespace-pre-wrap break-words">
                                {message.content}
                            </p>
                            {message.timestamp && (
                                <span className="text-xs opacity-70 mt-1 block">
                                    {new Date(message.timestamp).toLocaleTimeString()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            ))}
            <div ref={messagesEndRef} />
        </div>
    );
}; 