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
  user: {
    id: string;
    email: string;
    name: string;
  };
}

export interface LoginAuthResponse extends BaseAuthResponse {
  session: {
    access_token: string;
    refresh_token: string;
  };
}

export interface RefreshAuthResponse extends BaseAuthResponse {
  accessToken: string;
} 