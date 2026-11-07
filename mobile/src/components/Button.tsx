import React, { useRef, useState } from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
  Animated,
  ViewStyle,
  TextStyle,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius, FontSize, Fonts } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void | Promise<void>;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'md' | 'sm';
  loading?: boolean;
  disabled?: boolean;
  disabledReason?: string;
  success?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  disabledReason,
  success = false,
  icon,
  style,
  textStyle,
  fullWidth = true,
}: ButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [btnWidth, setBtnWidth] = useState<number | undefined>(undefined);

  const handlePressIn = () => {
    if (disabled || loading) return;
    try {
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch {
      // Ignore if haptics unavailable
    }
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
      speed: 30,
      bounciness: 0,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const isOutline = variant === 'outline';
  const isGhost = variant === 'ghost';
  const isDanger = variant === 'danger';

  let bg = Colors.brand;
  let textColor = '#FFFFFF';
  let borderColor = Colors.brand;

  if (isOutline) {
    bg = 'transparent';
    textColor = Colors.ink;
    borderColor = Colors.line;
  } else if (isGhost) {
    bg = 'transparent';
    textColor = Colors.brand;
    borderColor = 'transparent';
  } else if (isDanger) {
    bg = Colors.absent;
    textColor = '#FFFFFF';
    borderColor = Colors.absent;
  }

  if (disabled) {
    bg = isOutline || isGhost ? 'transparent' : Colors.tintDisabled;
    textColor = Colors.muted;
    borderColor = Colors.line;
  }

  const height = size === 'sm' ? 40 : 48;

  return (
    <View style={[fullWidth && styles.fullWidth]}>
      <Animated.View
        style={[
          { transform: [{ scale: scaleAnim }] },
          fullWidth && styles.fullWidth,
        ]}
      >
        <TouchableOpacity
          onLayout={(e) => {
            if (!btnWidth && e.nativeEvent.layout.width > 0) {
              setBtnWidth(e.nativeEvent.layout.width);
            }
          }}
          activeOpacity={0.9}
          disabled={disabled || loading}
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={[
            styles.base,
            {
              backgroundColor: bg,
              borderColor,
              borderWidth: isGhost ? 0 : 1,
              minHeight: height,
              width: btnWidth && loading ? btnWidth : undefined,
            },
            fullWidth && styles.fullWidth,
            style,
          ]}
        >
          {loading ? (
            <ActivityIndicator
              size="small"
              color={isOutline || isGhost ? Colors.brand : '#FFFFFF'}
            />
          ) : success ? (
            <Text style={[styles.text, { color: textColor }, textStyle]}>
              Saved ✓
            </Text>
          ) : (
            <View style={styles.contentRow}>
              {icon ? <View style={styles.iconWrap}>{icon}</View> : null}
              <Text
                style={[
                  styles.text,
                  size === 'sm' && styles.textSm,
                  { color: textColor },
                  textStyle,
                ]}
              >
                {title}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
      {disabled && disabledReason ? (
        <Text style={styles.disabledReason}>{disabledReason}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    width: '100%',
  },
  base: {
    borderRadius: Radius.base,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  iconWrap: {
    marginRight: 2,
  },
  text: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.base,
    letterSpacing: 0.2,
  },
  textSm: {
    fontSize: FontSize.sm,
  },
  disabledReason: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.muted,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});

