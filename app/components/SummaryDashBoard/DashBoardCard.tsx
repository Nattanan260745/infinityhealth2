import { StatCard } from '@/app/interface/infinityhealth.interface';
import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DashBoardCardProps {
    statCards: StatCard[]
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

const DashBoardCard: React.FC<DashBoardCardProps> = (props) => {
    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between',paddingHorizontal: 20, borderWidth: 1, borderColor: 'red' }}>
            {props.statCards.map((card) => (
                <View
                    key={card.id}
                    style={{
                        width: CARD_WIDTH,
                        borderWidth:1,
                        borderColor:'blue',
                        backgroundColor: card.bgColor,
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 16,
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <Ionicons name={card.icon as any} size={18} color={card.iconColor} />
                        <Text style={{ marginLeft: 6, fontSize: 14, color: '#4B5563' }}>{card.id}</Text>
                    </View>
                    <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1F2937' }}>
                        {card.value}
                    </Text>
                    {card.unit && (
                        <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{card.unit}</Text>
                    )}
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default DashBoardCard;