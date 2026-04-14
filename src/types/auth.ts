export interface JWTPayload {
  sub: string;
  role: 'admin' | 'staff' | 'customer';
  phone: string;
  name: string;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: string;
  role: 'admin' | 'staff' | 'customer';
  phone: string;
  full_name: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  access_token: string;
  expires_in: number;
  user: {
    id: string;
    role: AuthUser['role'];
    full_name: string;
  };
}
