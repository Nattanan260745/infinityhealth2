export type MetricType = 'Weight' | 'Height' | 'BMI' | 'Water' | 'Sleep' | 'Steps';

export interface StatCard {
  id: MetricType;
  icon: string;
  iconColor: string;
  value: string;
  unit: string;
  bgColor: string;
}

//-----------------------------------------------
// Health Check
export interface HealthCheckResponse {
  status: string;
  message: string;
  timestamp: string;
  uptime: number;
  environment: string;
}

//-----------------------------------------------
// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {

  success: boolean;
  message: string;
  token?: string;
  user?: UserProfile;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: UserProfile;

}

//-----------------------------------------------
// User
export interface UserProfile {
  userId: string;
  fullName: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileRequest {
  fullName?: string;
  avatar?: string;
}

//-----------------------------------------------
// API Response Wrapper
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}