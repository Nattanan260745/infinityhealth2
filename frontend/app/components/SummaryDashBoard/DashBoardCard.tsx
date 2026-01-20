import { StatCard } from '@/app/interface/infinityhealth.interface';
import React from 'react';
import { TouchableOpacity, Dimensions, Image, ImageSourcePropType, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MetricType } from '@/app/interface/infinityhealth.interface';

interface DashBoardCardProps {
    statCards: StatCard[];
    onCardPress?: (id: MetricType) => void;
    selectedId?: string;
    onEdit?: (id: MetricType) => void;
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
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', paddingHorizontal: 20, }}>
            {props.statCards.map((card) => {
                const isSelected = props.selectedId === card.id;
                return (
                    <TouchableOpacity
                        key={card.id}
                        onPress={() => props.onCardPress && props.onCardPress(card.id as MetricType)}
                        activeOpacity={0.7}
                        style={{
                            width: CARD_WIDTH,
                            backgroundColor: card.bgColor,
                            borderRadius: 16,
                            padding: 16,
                            marginBottom: 16,
                            borderWidth: 0,
                            // borderColor: '#1F2937', // Removed highlight border
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
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
                            {card.unit ? (
                                <Text style={{ fontSize: 12, color: '#6B7280' }}>{card.unit}</Text>
                            ) : <View />}

                            {/* Edit Icon Button */}
                            {props.onEdit && card.id !== 'BMI' && (
                                <TouchableOpacity
                                    onPress={() => props.onEdit && props.onEdit(card.id)}
                                    style={{
                                        padding: 4,
                                        borderRadius: 8,
                                        backgroundColor: 'rgba(255,255,255,0.5)'
                                    }}
                                >
                                    <View>
                                        <Ionicons name="create-outline" size={16} color="#4B5563" />
                                    </View>
                                </TouchableOpacity>
                            )}
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

export default DashBoardCard;