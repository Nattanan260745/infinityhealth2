import { MetricType } from '@/app/interface/infinityhealth.interface';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';

interface FilterProps {
    filterTabs: MetricType[]
    selectedTab: MetricType
    setSelectedTab: (tab: MetricType) => void
}

const Filter: React.FC<FilterProps> = (props) => {
    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
                paddingHorizontal: 20,
                alignItems: 'center',
                gap: 8, // Add gap between items
            }}
            style={{
                marginTop: 8,
                marginBottom: 20,
            }}
        >
            {props.filterTabs.map((tab) => (
                <TouchableOpacity
                    key={tab}
                    onPress={() => props.setSelectedTab(tab)}
                    style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                        backgroundColor: props.selectedTab === tab ? '#7DD1E0' : '#F3F4F6',
                        marginRight: 8, // Fallback for no gap support
                    }}
                >
                    <Text
                        style={{
                            fontSize: 14,
                            fontWeight: '500',
                            color: props.selectedTab === tab ? '#FFFFFF' : '#6B7280',
                        }}
                    >
                        {tab}
                    </Text>
                </TouchableOpacity>
            ))}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default Filter;