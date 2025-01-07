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
  session: {
    access_token: string;
    refresh_token: string;
  };
  user: {
    name: string;
    id: string;
    email: string;
    created_at: string;
  };
} 