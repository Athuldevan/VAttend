import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors, Spacing, Radius, FontSize, Fonts } from '../constants/theme';

export type TagVariant = 'done' | 'pending' | 'present' | 'late' | 'absent' | 'neutral' | 'brand';

interface TagProps {
  label: string;
  variant?: TagVariant;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export default function Tag({ label, variant = 'neutral', style, textStyle }: TagProps) {
  let bg = Colors.tintNeutral;
  let textColor = Colors.muted;
  let border = Colors.line;

  switch (variant) {
    case 'done':
    case 'present':
      bg = Colors.tintOk;
      textColor = Colors.present;
      border = '#BBDCC7';
      break;
    case 'pending':
    case 'late':
      bg = Colors.tintPending;
      textColor = Colors.late;
      border = '#E8D4A8';
      break;
    case 'absent':
      bg = Colors.tintError;
      textColor = Colors.absent;
      border = '#ECC0BD';
      break;
    case 'brand':
      bg = '#E5EBF2';
      textColor = Colors.brand;
      border = '#C4D2E2';
      break;
    case 'neutral':
    default:
      bg = Colors.tintNeutral;
      textColor = Colors.muted;
      border = Colors.line;
      break;
  }

  return (
    <View style={[styles.base, { backgroundColor: bg, borderColor: border }, style]}>
      <Text style={[styles.text, { color: textColor }, textStyle]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    letterSpacing: 0.3,
  },
});

