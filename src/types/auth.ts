import { User } from "./User";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

interface BaseAuthResponse {
  user: User;
}

export interface LoginAuthResponse extends BaseAuthResponse {
  session: {
    access_token: string;
    refresh_token: string;
  };
}

export interface RefreshAuthResponse {
  accessToken: string;
  user: User | null;
} 