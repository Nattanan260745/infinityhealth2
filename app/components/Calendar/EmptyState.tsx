import React from 'react';
import { View, Text } from 'react-native';

interface EmptyStateProps {
    title?: string;
    subtitle?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    title = 'No activities yet',
    subtitle = "Let's create your activities",
}) => {
    return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 }}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
                {title}
            </Text>
            <Text style={{ fontSize: 14, color: '#D1D5DB' }}>
                {subtitle}
            </Text>
        </View>
    );
};

