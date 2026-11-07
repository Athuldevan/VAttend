import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, Radius, FontSize, Fonts } from '../constants/theme';

export interface SegmentOption<T extends string | number> {
  value: T;
  label: string;
  selectedBg?: string;
  selectedColor?: string;
}

interface SegmentedControlProps<T extends string | number> {
  options: SegmentOption<T>[];
  value?: T | null;
  onChange: (val: T) => void;
  style?: ViewStyle;
  itemHeight?: number;
}

export default function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
  style,
  itemHeight = 44,
}: SegmentedControlProps<T>) {
  return (
    <View style={[styles.container, style]}>
      {options.map((opt, index) => {
        const isSelected = value === opt.value;
        const activeBg = opt.selectedBg || Colors.brand;
        const activeColor = opt.selectedColor || '#FFFFFF';

        return (
          <TouchableOpacity
            key={String(opt.value)}
            style={[
              styles.segment,
              { minHeight: itemHeight },
              isSelected && { backgroundColor: activeBg },
              index > 0 && !isSelected && styles.borderLeft,
            ]}
            onPress={() => onChange(opt.value)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentText,
                isSelected && { color: activeColor, fontFamily: Fonts.bodySemiBold },
              ]}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.base,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  borderLeft: {
    borderLeftWidth: 1,
    borderLeftColor: Colors.line,
  },
  segmentText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.ink,
    letterSpacing: 0.2,
  },
});

