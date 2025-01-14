import { AxiosResponse } from 'axios';
import axiosInstance from './axiosConfig';

export interface CreateCloneDto {
    name: string;
    description?: string;
    base_prompt: string;
    visibility: 'global' | 'private';
    workspace_id?: string;
}

export interface ChatMessageDto {
    text: string;
    history: Array<{
        role: string;
        content: string;
    }>;
}

export interface ChatRequestDto {
    message: ChatMessageDto;
    workspace_id?: string;
    channel_id?: string;
}

export interface ChatResponseDto {
    response: string;
    context?: Record<string, any>;
}

export interface HealthCheckResponse {
    status: 'healthy' | 'unhealthy';
    message: string;
}

const API_PREFIX = '/api';

const cloneApi = {
    // Clone Management
    createClone: (data: CreateCloneDto) => 
        axiosInstance.post(`${API_PREFIX}/clones`, data),

    listClones: (workspaceId?: string) => 
        axiosInstance.get(`${API_PREFIX}/clones`, {
            params: { workspace_id: workspaceId }
        }),

    getClone: (id: string) => 
        axiosInstance.get(`${API_PREFIX}/clones/${id}`),

    updateClone: (id: string, data: Partial<CreateCloneDto>) => 
        axiosInstance.put(`${API_PREFIX}/clones/${id}`, data),

    deleteClone: (id: string) => 
        axiosInstance.delete(`${API_PREFIX}/clones/${id}`),

    // Document Management
    uploadDocument: (cloneId: string, file: File): Promise<AxiosResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        
        return axiosInstance.post(`${API_PREFIX}/clones/${cloneId}/documents`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
    },

    // Chat
    chat: (cloneId: string, data: ChatRequestDto): Promise<AxiosResponse<ChatResponseDto>> => 
        axiosInstance.post(`${API_PREFIX}/clones/${cloneId}/chat`, data),

    // Health Check
    checkHealth: (): Promise<AxiosResponse<HealthCheckResponse>> => 
        axiosInstance.get(`${API_PREFIX}/clones/health`)
};

export default cloneApi; 