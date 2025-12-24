export interface Routine {
  id: number;
  title: string;
  time: string;
  status: 'pending' | 'completed' | 'cancelled';
}

export interface Mission {
  id: number;
  title: string;
  subtitle: string;
  icon: string;
}

export interface CalendarDay {
  day: string;
  date: number;
}

export interface User {
  name: string;
  avatar: string;
}

