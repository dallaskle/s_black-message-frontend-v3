import React, { createContext, useContext, useReducer, useCallback, useMemo } from 'react';
import { 
    Clone, 
    CloneState, 
    CloneContextType, 
    CreateCloneData, 
    ChatMessage 
} from '../../types/clone';
import cloneApi from '../../api/clone';
import { useWorkspace } from '../WorkspaceContext';

const initialState: CloneState = {
    clones: [],
    selectedClone: null,
    chatHistories: {},
    isLoading: false,
    error: null
};

type CloneAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_CLONES'; payload: Clone[] }
    | { type: 'ADD_CLONE'; payload: Clone }
    | { type: 'UPDATE_CLONE'; payload: Clone }
    | { type: 'REMOVE_CLONE'; payload: string }
    | { type: 'SELECT_CLONE'; payload: Clone | null }
    | { type: 'ADD_MESSAGE'; payload: { cloneId: string; message: ChatMessage } };

const cloneReducer = (state: CloneState, action: CloneAction): CloneState => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'SET_ERROR':
            return { ...state, error: action.payload };
        case 'SET_CLONES':
            return { ...state, clones: action.payload };
        case 'ADD_CLONE':
            return { ...state, clones: [...state.clones, action.payload] };
        case 'UPDATE_CLONE':
            return {
                ...state,
                clones: state.clones.map(clone => 
                    clone.id === action.payload.id ? action.payload : clone
                )
            };
        case 'REMOVE_CLONE':
            return {
                ...state,
                clones: state.clones.filter(clone => clone.id !== action.payload)
            };
        case 'SELECT_CLONE':
            return { ...state, selectedClone: action.payload };
        case 'ADD_MESSAGE':
            const { cloneId, message } = action.payload;
            const history = state.chatHistories[cloneId] || { messages: [], cloneId };
            return {
                ...state,
                chatHistories: {
                    ...state.chatHistories,
                    [cloneId]: {
                        ...history,
                        messages: [...history.messages, message]
                    }
                }
            };
        default:
            return state;
    }
};

const CloneContext = createContext<CloneContextType | undefined>(undefined);

export const CloneProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(cloneReducer, initialState);
    const { currentWorkspace } = useWorkspace();

    const createClone = useCallback(async (data: CreateCloneData) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const response = await cloneApi.createClone(data);
            const newClone = response.data;
            dispatch({ type: 'ADD_CLONE', payload: newClone });
            return newClone;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to create clone';
            dispatch({ type: 'SET_ERROR', payload: message });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, []);

    const updateClone = useCallback(async (id: string, data: Partial<CreateCloneData>) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            const response = await cloneApi.updateClone(id, data);
            const updatedClone = response.data;
            dispatch({ type: 'UPDATE_CLONE', payload: updatedClone });
            return updatedClone;
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to update clone';
            dispatch({ type: 'SET_ERROR', payload: message });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, []);

    const deleteClone = useCallback(async (id: string) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            await cloneApi.deleteClone(id);
            dispatch({ type: 'REMOVE_CLONE', payload: id });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to delete clone';
            dispatch({ type: 'SET_ERROR', payload: message });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, []);

    const selectClone = useCallback((clone: Clone | null) => {
        dispatch({ type: 'SELECT_CLONE', payload: clone });
    }, []);

    const uploadDocument = useCallback(async (cloneId: string, file: File) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            await cloneApi.uploadDocument(cloneId, file);
            // Refresh clone data to get updated documents
            const response = await cloneApi.getClone(cloneId);
            dispatch({ type: 'UPDATE_CLONE', payload: response.data });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to upload document';
            dispatch({ type: 'SET_ERROR', payload: message });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, []);

    const sendMessage = useCallback(async (cloneId: string, message: string, channelId?: string) => {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
            // Add user message to history
            const userMessage: ChatMessage = {
                role: 'user',
                content: message,
                timestamp: new Date().toISOString()
            };
            dispatch({ 
                type: 'ADD_MESSAGE', 
                payload: { cloneId, message: userMessage }
            });

            // Get chat history
            const history = state.chatHistories[cloneId]?.messages || [];
            
            // Send chat request
            const response = await cloneApi.chat(cloneId, {
                message: {
                    text: message,
                    history: history.map(msg => ({
                        role: msg.role,
                        content: msg.content
                    }))
                },
                workspace_id: currentWorkspace?.id,
                channel_id: channelId
            });

            // Add assistant response to history
            const assistantMessage: ChatMessage = {
                role: 'assistant',
                content: response.data.response,
                timestamp: new Date().toISOString()
            };
            dispatch({ 
                type: 'ADD_MESSAGE', 
                payload: { cloneId, message: assistantMessage }
            });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to send message';
            dispatch({ type: 'SET_ERROR', payload: message });
            throw error;
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false });
        }
    }, [currentWorkspace?.id, state.chatHistories]);

    const clearError = useCallback(() => {
        dispatch({ type: 'SET_ERROR', payload: null });
    }, []);

    const setClones = useCallback((clones: Clone[]) => {
        dispatch({ type: 'SET_CLONES', payload: clones });
    }, []);

    const value = useMemo(() => ({
        state,
        actions: {
            createClone,
            updateClone,
            deleteClone,
            selectClone,
            uploadDocument,
            sendMessage,
            clearError,
            setClones
        }
    }), [
        state,
        createClone,
        updateClone,
        deleteClone,
        selectClone,
        uploadDocument,
        sendMessage,
        clearError,
        setClones
    ]);

    return (
        <CloneContext.Provider value={value}>
            {children}
        </CloneContext.Provider>
    );
};

export const useClone = () => {
    const context = useContext(CloneContext);
    if (context === undefined) {
        throw new Error('useClone must be used within a CloneProvider');
    }
    return context;
}; 