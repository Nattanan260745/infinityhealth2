export const Colors = {
  light: {
    primary: '#F97316',
    background: '#FFFFFF',
    card: '#FFFFFF',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#F3F4F6',
    missionCard: '#FECACA',
    missionCardLight: '#FEE2E2',
    success: '#10B981',
    successLight: '#D1FAE5',
    danger: '#EF4444',
    dangerLight: '#FEE2E2',
    notification: '#F5A623',
    calendarSelected: '#374151',
  },
  dark: {
    primary: '#F97316',
    background: '#111827',
    card: '#1F2937',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#374151',
    missionCard: '#991B1B',
    missionCardLight: '#7F1D1D',
    success: '#10B981',
    successLight: '#064E3B',
    danger: '#EF4444',
    dangerLight: '#7F1D1D',
    notification: '#F5A623',
    calendarSelected: '#E5E7EB',
  },
};

export type ColorScheme = keyof typeof Colors;

