export interface RegisterRequest {
  accountName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  provider?: string;
}

export interface VerifyOtpRequest {
  email: string;
  otpCode: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
  user: UserInfo;
}

export interface UserInfo {
  accountId: number;
  accountName: string;
  email: string;
  phoneNumber?: string;
  image?: string;
  roleName: string;
}

export interface ApiResponse<T> {
  status: number;
  statusMessage: string;
  message: string;
  data: T | null;
}
