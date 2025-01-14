import React from 'react';
import { useClone } from '../../../../contexts/Clone/CloneContext';
import { ChatHistory } from './ChatHistory'
import { ChatInput } from './ChatInput';
import { Skeleton } from '../../../ui/skeleton';

interface CloneChatProps {
    cloneId: string;
    channelId?: string;
}

export const CloneChat: React.FC<CloneChatProps> = ({ cloneId, channelId }) => {
    const { state, actions } = useClone();
    const clone = state.clones.find(c => c.id === cloneId);
    const chatHistory = state.chatHistories[cloneId]?.messages || [];

    const handleSendMessage = async (message: string) => {
        try {
            await actions.sendMessage(cloneId, message, channelId);
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    if (!clone) {
        return (
            <div className="h-full flex items-center justify-center text-gray-500">
                Clone not found
            </div>
        );
    }

    if (state.isLoading && chatHistory.length === 0) {
        return (
            <div className="space-y-4 p-4">
                <Skeleton className="h-12 w-3/4" />
                <Skeleton className="h-12 w-1/2" />
                <Skeleton className="h-12 w-2/3" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="border-b p-4">
                <h2 className="text-lg font-semibold">{clone.name}</h2>
                {clone.description && (
                    <p className="text-sm text-gray-600">{clone.description}</p>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <ChatHistory messages={chatHistory} />
            </div>

            <div className="border-t p-4">
                <ChatInput 
                    onSendMessage={handleSendMessage}
                    isLoading={state.isLoading}
                />
            </div>
        </div>
    );
}; 