import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  TextStyle,
  ViewStyle,
} from 'react-native';

interface WheelPickerProps {
  data: number[];
  selectedValue: number;
  onValueChange: (value: number) => void;
  itemHeight?: number;
  containerHeight?: number;
  label?: string;
}

const ITEM_HEIGHT = 44;
const VISIBLE_ITEMS = 5;

export const WheelPicker: React.FC<WheelPickerProps> = ({
  data,
  selectedValue,
  onValueChange,
  itemHeight = ITEM_HEIGHT,
  containerHeight = ITEM_HEIGHT * VISIBLE_ITEMS,
  label,
}) => {
  const flatListRef = useRef<FlatList>(null);
  
  // Add padding items to center the first and last elements
  const paddingCount = Math.floor(VISIBLE_ITEMS / 2);
  const paddedData = [
    ...Array(paddingCount).fill(-1),
    ...data,
    ...Array(paddingCount).fill(-1),
  ];

  const onMomentumScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = event.nativeEvent.contentOffset.y;
    const index = Math.round(y / itemHeight);
    if (index >= 0 && index < data.length) {
      onValueChange(data[index]);
    }
  };

  useEffect(() => {
    const index = data.indexOf(selectedValue);
    if (index !== -1 && flatListRef.current) {
        // Delay scroll to ensure list is rendered
        setTimeout(() => {
            flatListRef.current?.scrollToOffset({
                offset: index * itemHeight,
                animated: false,
            });
        }, 100);
    }
  }, []);

  const renderItem = ({ item, index }: { item: number; index: number }) => {
    if (item === -1) {
      return <View style={{ height: itemHeight }} />;
    }

    const isSelected = item === selectedValue;

    return (
      <View style={[styles.itemContainer, { height: itemHeight }]}>
        <Text style={[
          styles.itemText, 
          isSelected ? styles.itemTextSelected : styles.itemTextUnselected
        ]}>
          {item < 10 ? `0${item}` : item}
        </Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { height: containerHeight }]}>
      {/* Selection Overlay */}
      <View style={[styles.selectionOverlay, { height: itemHeight, top: (containerHeight - itemHeight) / 2 }]} />
      
      <FlatList
        ref={flatListRef}
        data={paddedData}
        renderItem={renderItem}
        keyExtractor={(_, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        snapToInterval={itemHeight}
        decelerationRate="fast"
        onMomentumScrollEnd={onMomentumScrollEnd}
        // Use initialScrollIndex if possible, but offsets are more reliable for padding
        getItemLayout={(_, index) => ({
          length: itemHeight,
          offset: itemHeight * index,
          index,
        })}
      />

      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.labelText}>{label}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  itemContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  itemText: {
    fontSize: 20,
    fontWeight: '500',
  },
  itemTextSelected: {
    color: '#1F2937',
    fontSize: 24,
    fontWeight: 'bold',
  },
  itemTextUnselected: {
    color: '#9CA3AF',
    fontSize: 18,
  },
  selectionOverlay: {
    position: 'absolute',
    left: 10,
    right: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: 'rgba(125, 209, 224, 0.05)',
    zIndex: -1,
  },
  labelContainer: {
    position: 'absolute',
    right: 5,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  labelText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#7DD1E0',
    backgroundColor: 'transparent',
  }
});
