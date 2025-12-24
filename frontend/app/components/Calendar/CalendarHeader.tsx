import React from 'react';
import { Text } from 'react-native';

interface CalendarHeaderProps {
    title?: string;
}

export const CalendarHeader: React.FC<CalendarHeaderProps> = ({ title = 'Calendar' }) => {
    return (
        <Text style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: '#1F2937',
            textAlign: 'center',
            marginBottom: 24,
            fontStyle: 'italic',
        }}>
            {title}
        </Text>
    );
};

