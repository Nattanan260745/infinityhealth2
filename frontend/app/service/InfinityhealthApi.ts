import axios from 'axios';
import {
  HealthCheckResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UserProfile,
  UpdateProfileRequest,
  ApiResponse,
  Mission,
  MissionWithStatus,
  CompleteMissionResponse,
  Exercise,
  Level,
  HealthTrack,
} from '../interface/infinityhealth.interface';

const API_BASE_URL = 'http://localhost:3000';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================
// Health Check
// ============================================
export const getHealthCheck = async (): Promise<HealthCheckResponse> => {
  const response = await api.get<HealthCheckResponse>('/health');
  return response.data;
};

// ============================================
// Auth
// ============================================
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', data);
  return response.data;
};

export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>('/auth/register', data);
  return response.data;
};

export const logout = async (): Promise<ApiResponse<null>> => {
  const response = await api.post<ApiResponse<null>>('/auth/logout');
  return response.data;
};

// ============================================
// User Profile
// ============================================
export const getUserProfile = async (): Promise<ApiResponse<UserProfile>> => {
  const response = await api.get<ApiResponse<UserProfile>>('/user/profile');
  return response.data;
};

export const updateUserProfile = async (data: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> => {
  const response = await api.put<ApiResponse<UserProfile>>('/user/profile', data);
  return response.data;
};

// ============================================
// Set Auth Token (for authenticated requests)
// ============================================
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// ============================================
// Missions
// ============================================
export const getAllMissions = async (): Promise<ApiResponse<Mission[]>> => {
  const response = await api.get<ApiResponse<Mission[]>>('/mission');
  return response.data;
};

export const getMissionsByType = async (type: string): Promise<ApiResponse<Mission[]>> => {
  const response = await api.get<ApiResponse<Mission[]>>(`/mission/type/${type}`);
  return response.data;
};

export const getUserMissions = async (userId: string): Promise<ApiResponse<MissionWithStatus[]>> => {
  const response = await api.get<ApiResponse<MissionWithStatus[]>>(`/mission/user/${userId}`);
  return response.data;
};

export const startMission = async (userId: string, missionId: string): Promise<ApiResponse<any>> => {
  const response = await api.post<ApiResponse<any>>(`/mission/user/${userId}/start/${missionId}`);
  return response.data;
};

export const completeMission = async (userId: string, missionId: string): Promise<ApiResponse<CompleteMissionResponse>> => {
  const response = await api.patch<ApiResponse<CompleteMissionResponse>>(`/mission/user/${userId}/complete/${missionId}`);
  return response.data;
};

export const updateMissionProgress = async (
  userId: string,
  missionId: string,
  progress: string,
  mission_status?: string
): Promise<ApiResponse<any>> => {
  const response = await api.patch<ApiResponse<any>>(`/mission/user/${userId}/progress/${missionId}`, {
    progress,
    mission_status,
  });
  return response.data;
};

// ============================================
// Exercises
// ============================================
export const getAllExercises = async (): Promise<ApiResponse<Exercise[]>> => {
  const response = await api.get<ApiResponse<Exercise[]>>('/exercise');
  return response.data;
};

export const getExercisesByType = async (type: string): Promise<ApiResponse<Exercise[]>> => {
  const response = await api.get<ApiResponse<Exercise[]>>(`/exercise/type/${type}`);
  return response.data;
};

export const getExercisesByDifficulty = async (difficulty: string): Promise<ApiResponse<Exercise[]>> => {
  const response = await api.get<ApiResponse<Exercise[]>>(`/exercise/difficulty/${difficulty}`);
  return response.data;
};

export const filterExercises = async (type?: string, difficulty?: string): Promise<ApiResponse<Exercise[]>> => {
  const params = new URLSearchParams();
  if (type) params.append('type', type);
  if (difficulty) params.append('difficulty', difficulty);
  const response = await api.get<ApiResponse<Exercise[]>>(`/exercise/filter?${params.toString()}`);
  return response.data;
};

// ============================================
// Levels
// ============================================
export const getAllLevels = async (): Promise<ApiResponse<Level[]>> => {
  const response = await api.get<ApiResponse<Level[]>>('/level');
  return response.data;
};

export const getLevelByExp = async (exp: number): Promise<ApiResponse<Level>> => {
  const response = await api.get<ApiResponse<Level>>(`/level/exp/${exp}`);
  return response.data;
};

// ============================================
// Health Track
// ============================================
export const getHealthTrackToday = async (userId: string): Promise<ApiResponse<HealthTrack>> => {
  const response = await api.get<ApiResponse<HealthTrack>>(`/health-track/user/${userId}/today`);
  return response.data;
};

export const getHealthTrackRange = async (userId: string, startDate: string, endDate: string): Promise<ApiResponse<HealthTrack[]>> => {
  const response = await api.get<ApiResponse<HealthTrack[]>>(`/health-track/user/${userId}/range?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

export default api;
