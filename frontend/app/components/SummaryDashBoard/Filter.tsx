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
        <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: 8,
            marginBottom: 20,
            paddingHorizontal: 20
        }}>
            {props.filterTabs.map((tab) => (
                <TouchableOpacity
                    key={tab}
                    onPress={() => props.setSelectedTab(tab)}
                    style={{
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        borderRadius: 20,
                        backgroundColor: props.selectedTab === tab ? '#7DD1E0' : '#F3F4F6',
                        // Remove any border if existed (none seen in previous code but ensuring clean style)
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
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default Filter;