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

//-----------------------------------------------
// Mission
export interface Mission {
  _id: string;
  title: string;
  type: 'daily' | 'challenge';
  reward_exp: number;
  reward_points: number;
  start_time: string;
  end_time: string;
  description: string;
  min_level: number;        // Level ขั้นต่ำที่ปลดล็อค (challenge)
  target_value: number;     // เป้าหมายของภารกิจ
  target_unit: string;      // หน่วย (ml, steps, minutes, etc.)
  is_active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UserMissionStatus {
  mission_status: 'in_progress' | 'completed' | 'failed' | null;
  progress: string;
  completed_at: string | null;
}

export interface MissionWithStatus extends Mission {
  user_status: UserMissionStatus;
}

// For display in frontend
export interface MissionDisplay {
  id: string;
  title: string;
  icon: string;
  progress: number;
  total: number;
  xp: number;
  gems: number;
  completed: boolean;
  type: 'daily' | 'challenge';
  description: string;
  missionId: string;
  minLevel: number;
  targetValue: number;
  targetUnit: string;
  isLocked: boolean;
}

export interface MissionRewards {
  exp: number;
  points: number;
}

export interface CompleteMissionResponse {
  userMission: {
    _id: string;
    user_id: string;
    mission_id: string;
    mission_status: string;
    progress: string;
    completed_at: string;
  };
  rewards: MissionRewards;
}

//-----------------------------------------------
// Exercise
export interface Exercise {
  _id: string;
  type: 'cardio' | 'weight';
  difficulty: 'easy' | 'medium' | 'hard';
  title: string;
  description: string;
  video_url?: string;
  createdAt: string;
  updatedAt: string;
}

//-----------------------------------------------
// Level
export interface Level {
  _id: string;
  level_id: number;
  name: string;
  title: string;
  title_th: string;
  color: string;
  hex_code: string;
  min_exp: number;
  max_exp: number;
  required_exp: number;
  createdAt: string;
  updatedAt: string;
}

//-----------------------------------------------
// Health Track
export interface HealthTrack {
  _id: string;
  user_id: string;
  date: string;
  weight: number;
  height: number;
  water_glass: number;
  mood: number;
  sleep_hours: number;
  steps: number;
  createdAt: string;
  updatedAt: string;
}
