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
  export interface HealthCheckResponse {
    status: string;
    message: string;
    timestamp: string;
    uptime: number;
    environment: string;
  }