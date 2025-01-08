export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
  };
  session?: {
    access_token: string;
    refresh_token: string;
  };
  accessToken?: string; // For refresh token response
} 