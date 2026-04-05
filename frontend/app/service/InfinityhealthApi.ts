import axios from 'axios';
import {
  HealthCheckResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  UserProfile,
  UserProfileData,
  UpdateProfileRequest,
  ApiResponse,
  Mission,
  MissionWithStatus,
  CompleteMissionResponse,
  Exercise,
  Level,
  HealthTrack,
  Notification,
} from '../interface/infinityhealth.interface';

// const API_BASE_URL = 'http://147.50.228.99:3000'; // YOUR STABLE VPS IP
// const API_BASE_URL = 'https://infinityhealth2.onrender.com'; // Production URL on Render
// const API_BASE_URL = 'https://cc53-202-44-32-253.ngrok-free.app'; // Public Ngrok Tunnel
// const API_BASE_URL = 'http://192.168.1.33:3000'; // Local LAN IP (For Physical Device)
const API_BASE_URL = 'https://detection-orders-mouth-analysts.trycloudflare.com'; // Cloudflare Quick Tunnel URL


console.log('[API] Target URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
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

export const syncClerkUser = async (email: string, firstName?: string, lastName?: string, image?: string, pushToken?: string): Promise<ApiResponse<any>> => {
  const response = await api.post<ApiResponse<any>>('/auth/clerk-sync', {
    email,
    firstName,
    lastName,
    image,
    pushToken
  });
  return response.data;
};

// ============================================
// User Profile
// ============================================
// ============================================
// User Profile
// ============================================
export const getUserProfile = async (userId: string): Promise<ApiResponse<UserProfileData>> => {
  const response = await api.get<ApiResponse<UserProfileData>>(`/profile/${userId}`);
  return response.data;
};

export const updateUserProfile = async (userId: string, data: UpdateProfileRequest): Promise<ApiResponse<UserProfile>> => {
  const response = await api.put<ApiResponse<UserProfile>>(`/profile/${userId}`, data);
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

export const getLevelById = async (id: number): Promise<ApiResponse<Level>> => {
  const response = await api.get<ApiResponse<Level>>(`/level/${id}`);
  return response.data;
};

export const getLevelByExp = async (exp: number): Promise<ApiResponse<Level>> => {
  const response = await api.get<ApiResponse<Level>>(`/level/exp/${exp}`);
  return response.data;
};

// ============================================
// Health Track
// ============================================
export const getHealthTrackToday = async (userId: string, date?: string): Promise<ApiResponse<HealthTrack>> => {
  const query = date ? `?date=${date}` : '';
  const response = await api.get<ApiResponse<HealthTrack>>(`/health-track/user/${userId}/today${query}`);
  return response.data;
};

export const getHealthTrackRange = async (userId: string, startDate: string, endDate: string): Promise<ApiResponse<HealthTrack[]>> => {
  const response = await api.get<ApiResponse<HealthTrack[]>>(`/health-track/user/${userId}/range?startDate=${startDate}&endDate=${endDate}`);
  return response.data;
};

export const saveHealthData = async (userId: string, data: any): Promise<ApiResponse<HealthTrack>> => {
  const response = await api.post<ApiResponse<HealthTrack>>(`/health-track/user/${userId}`, data);
  return response.data;
};

// ============================================
// Routine
// ============================================
export const getUserRoutines = async (userId: string): Promise<ApiResponse<any[]>> => {
  const response = await api.get<ApiResponse<any[]>>(`/routine/user/${userId}`);
  return response.data;
};

export const getUserRoutinesByDate = async (userId: string, date: string): Promise<ApiResponse<any[]>> => {
  const response = await api.get<ApiResponse<any[]>>(`/routine/user/${userId}/date/${date}`);
  return response.data;
};

export const createRoutine = async (data: any): Promise<ApiResponse<any>> => {
  const response = await api.post<ApiResponse<any>>('/routine', data);
  return response.data;
};

export const updateRoutine = async (routineId: number, data: any): Promise<ApiResponse<any>> => {
  const response = await api.put<ApiResponse<any>>(`/routine/${routineId}`, data);
  return response.data;
};

export const completeRoutine = async (routineId: number): Promise<ApiResponse<any>> => {
  const response = await api.patch<ApiResponse<any>>(`/routine/${routineId}/complete`);
  return response.data;
};

export const deleteRoutine = async (routineId: number): Promise<ApiResponse<any>> => {
  const response = await api.delete<ApiResponse<any>>(`/routine/${routineId}`);
  return response.data;
};

// ============================================
// Daily Goal
// ============================================
export const getUserGoals = async (userId: string): Promise<ApiResponse<any[]>> => {
  const response = await api.get<ApiResponse<any[]>>(`/daily-goal/user/${userId}`);
  return response.data;
};

export const getUserGoalsByDate = async (userId: string, date: string): Promise<ApiResponse<any[]>> => {
  const response = await api.get<ApiResponse<any[]>>(`/daily-goal/user/${userId}/date/${date}`);
  return response.data;
};

export const createGoal = async (data: any): Promise<ApiResponse<any>> => {
  const response = await api.post<ApiResponse<any>>('/daily-goal', data);
  return response.data;
};

export const updateGoal = async (goalId: number, data: any): Promise<ApiResponse<any>> => {
  const response = await api.put<ApiResponse<any>>(`/daily-goal/${goalId}`, data);
  return response.data;
};

export const deleteGoal = async (goalId: number): Promise<ApiResponse<any>> => {
  const response = await api.delete<ApiResponse<any>>(`/daily-goal/${goalId}`);
  return response.data;
};

// Rank Up
export const rankUpUser = async (userId: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/profile/rank-up/${userId}`);
    return response.data;
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || error.message || 'Rank up failed',
    };
  }
};

// ============================================
// Notifications
// ============================================
export const getUserNotifications = async (userId: string): Promise<ApiResponse<Notification[]>> => {
  const response = await api.get<ApiResponse<Notification[]>>(`/notification/user/${userId}`);
  return response.data;
};

export const markNotificationAsRead = async (notificationId: number): Promise<ApiResponse<Notification>> => {
  const response = await api.patch<ApiResponse<Notification>>(`/notification/${notificationId}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async (userId: string): Promise<ApiResponse<any>> => {
  const response = await api.patch<ApiResponse<any>>(`/notification/user/${userId}/read-all`);
  return response.data;
};

export const deleteNotification = async (notificationId: number): Promise<ApiResponse<any>> => {
  const response = await api.delete<ApiResponse<any>>(`/notification/${notificationId}`);
  return response.data;
};

export const deleteAllNotifications = async (userId: string): Promise<ApiResponse<any>> => {
  const response = await api.delete<ApiResponse<any>>(`/notification/user/${userId}/all`);
  return response.data;
};

export default api;
