import React, { useState } from 'react';
import { useClone } from '../../../../contexts/Clone/CloneContext';
import { ChatHistory } from './ChatHistory'
import { ChatInput } from './ChatInput';
import { Skeleton } from '../../../ui/skeleton';
import { Button } from '../../../ui/Button';
import { Input } from '../../../ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../ui/dialog';

interface CloneChatProps {
    cloneId: string;
    channelId?: string;
}

interface EditFormData {
    name: string;
    description: string;
    base_prompt: string;
}

const TypingIndicator = () => (
    <div className="flex items-center gap-1 text-gray-500 text-sm p-4">
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
);

export const CloneChat: React.FC<CloneChatProps> = ({ cloneId, channelId }) => {
    const { state, actions } = useClone();
    const [showSettings, setShowSettings] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editForm, setEditForm] = useState<EditFormData>({
        name: '',
        description: '',
        base_prompt: ''
    });
    const clone = state.clones.find(c => c.id === cloneId);
    const chatHistory = state.chatHistories[cloneId]?.messages || [];

    const handleSendMessage = async (message: string) => {
        try {
            await actions.sendMessage(cloneId, message, channelId);
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            await actions.uploadDocument(cloneId, file);
            setShowSettings(false);
        } catch (error) {
            console.error('Failed to upload file:', error);
        }
    };

    const handleEditClick = () => {
        if (clone) {
            setEditForm({
                name: clone.name,
                description: clone.description || '',
                base_prompt: clone.base_prompt
            });
            setShowEditModal(true);
            setShowSettings(false);
        }
    };

    const handleEditSubmit = async () => {
        try {
            await actions.updateClone(cloneId, editForm);
            setShowEditModal(false);
        } catch (error) {
            console.error('Failed to update clone:', error);
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
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="secondary" 
                            onClick={() => actions.selectClone(null as any)}
                            className="hover:bg-gray-100"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M19 12H5M12 19l-7-7 7-7"/>
                            </svg>
                        </Button>
                        <div>
                            <h2 className="text-lg font-semibold">{clone.name}</h2>
                            {clone.description && (
                                <p className="text-sm text-gray-600">{clone.description}</p>
                            )}
                        </div>
                    </div>
                    <div className="relative">
                        <Button 
                            variant="secondary" 
                            onClick={() => setShowSettings(!showSettings)}
                            className="hover:bg-gray-100"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="3"/>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
                            </svg>
                        </Button>
                        {showSettings && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                                <div className="p-2">
                                    <button
                                        onClick={handleEditClick}
                                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
                                    >
                                        Edit Clone
                                    </button>
                                    <label className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer">
                                        Upload Document
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.txt,.docx"
                                            onChange={handleFileUpload}
                                        />
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <ChatHistory messages={chatHistory} />
                {state.isLoading && chatHistory.length > 0 && <TypingIndicator />}
            </div>

            <div className="border-t p-4">
                <ChatInput 
                    onSendMessage={handleSendMessage}
                    isLoading={state.isLoading}
                />
            </div>

            <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
                <DialogContent className="bg-black">
                    <DialogHeader>
                        <DialogTitle>Edit Clone</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input
                                value={editForm.name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="Clone name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Input
                                value={editForm.description}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Clone description"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Base Prompt</label>
                            <Input
                                value={editForm.base_prompt}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditForm(prev => ({ ...prev, base_prompt: e.target.value }))}
                                placeholder="Base prompt for the clone"
                                className="h-24"
                            />
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleEditSubmit}>
                                Save Changes
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}; 