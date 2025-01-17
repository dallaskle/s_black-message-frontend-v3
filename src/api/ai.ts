import axiosInstance from './axiosConfig';

export interface MessageSearchRequest {
  workspace_id: string;
  channel_id?: string;
  query: string;
}

export interface MessageSearchResponse {
  response: string;
  context?: string;
  ai_response?: string;
}

const aiApi = {
  searchMessages: async (params: MessageSearchRequest): Promise<MessageSearchResponse> => {
    const response = await axiosInstance.post('/api/ai/message-search', params);
    return response.data;
  }
};

export default aiApi; 