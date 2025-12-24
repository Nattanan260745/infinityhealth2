import { StatCard } from '@/app/interface/infinityhealth.interface';
import React from 'react';
import { View, Text, StyleSheet, Dimensions, Image, ImageSourcePropType } from 'react-native';

interface DashBoardCardProps {
    statCards: StatCard[]
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

const cardIcons: Record<string, ImageSourcePropType> = {
    Weight: require('@/assets/images/weight.png'),
    Height: require('@/assets/images/height.png'),
    BMI: require('@/assets/images/bmi.png'),
    Water: require('@/assets/images/water.png'),
    Sleep: require('@/assets/images/sleep.png'),
    Steps: require('@/assets/images/step.png'),
};

const DashBoardCard: React.FC<DashBoardCardProps> = (props) => {
    
    return (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20,  }}>
            {props.statCards.map((card) => (
                <View
                    key={card.id}
                    style={{
                        width: CARD_WIDTH,
                        backgroundColor: card.bgColor,
                        borderRadius: 16,
                        padding: 16,
                        marginBottom: 16,
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                        <View style={{ 
                            width: 28, 
                            height: 28, 
                            borderRadius: 14, 
                            backgroundColor: '#FFFFFF', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                        }}>
                            <Image 
                                source={cardIcons[card.id]} 
                                style={{ width: 16, height: 16 }} 
                                resizeMode="contain"
                            />
                        </View>
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