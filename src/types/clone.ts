export type CloneVisibility = 'global' | 'private';
export type DocumentStatus = 'pending' | 'processed' | 'failed';

export interface Clone {
    id: string;
    name: string;
    description: string | null;
    base_prompt: string;
    visibility: CloneVisibility;
    workspace_id: string | null;
    created_by_user_id: string;
    created_at: string;
    updated_at: string;
    documents?: CloneDocument[];
}

export interface CloneDocument {
    id: string;
    clone_id: string;
    file_name: string;
    file_type: string;
    status: DocumentStatus;
    uploaded_at: string;
    processed_at: string | null;
    pinecone_index: string;
}

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp?: string;
}

export interface ChatHistory {
    messages: ChatMessage[];
    cloneId: string;
    channelId?: string;
}

export interface CloneState {
    clones: Clone[];
    selectedClone: Clone | null;
    chatHistories: Record<string, ChatHistory>; // key is cloneId
    isLoading: boolean;
    error: string | null;
}

export interface CloneContextType {
    state: CloneState;
    actions: {
        createClone: (data: CreateCloneData) => Promise<Clone>;
        updateClone: (id: string, data: Partial<CreateCloneData>) => Promise<Clone>;
        deleteClone: (id: string) => Promise<void>;
        selectClone: (clone: Clone) => void;
        uploadDocument: (cloneId: string, file: File) => Promise<void>;
        sendMessage: (cloneId: string, message: string, channelId?: string) => Promise<void>;
        clearError: () => void;
        setClones: (clones: Clone[]) => void;
    };
}

export interface CreateCloneData {
    name: string;
    description?: string;
    base_prompt: string;
    visibility: CloneVisibility;
    workspace_id?: string;
} 