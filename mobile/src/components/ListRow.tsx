import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, Fonts } from '../constants/theme';

interface ListRowProps {
  title: string;
  subtitle?: string | React.ReactNode;
  leftElement?: React.ReactNode;
  rightElement?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
  showDivider?: boolean;
  style?: ViewStyle;
}

export default function ListRow({
  title,
  subtitle,
  leftElement,
  rightElement,
  onPress,
  showChevron = false,
  showDivider = true,
  style,
}: ListRowProps) {
  const Component = onPress ? TouchableOpacity : View;

  return (
    <View style={styles.wrapper}>
      <Component
        activeOpacity={0.7}
        onPress={onPress}
        style={[styles.container, style]}
      >
        {leftElement ? <View style={styles.leftWrap}>{leftElement}</View> : null}
        <View style={styles.centerWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          {typeof subtitle === 'string' ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {subtitle}
            </Text>
          ) : (
            subtitle
          )}
        </View>
        <View style={styles.rightWrap}>
          {rightElement}
          {showChevron ? (
            <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
          ) : null}
        </View>
      </Component>
      {showDivider ? <View style={styles.divider} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    backgroundColor: Colors.surface,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  leftWrap: {
    marginRight: Spacing.md,
  },
  centerWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  title: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.base,
    color: Colors.ink,
    lineHeight: 20,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.muted,
    marginTop: 2,
    lineHeight: 16,
  },
  rightWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginLeft: Spacing.sm,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.line,
    marginLeft: Spacing.lg,
  },
});

