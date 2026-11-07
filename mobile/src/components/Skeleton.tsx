import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, ViewStyle } from 'react-native';
import { Colors, Spacing, Radius } from '../constants/theme';

interface SkeletonRowProps {
  delay?: number;
  height?: number;
  style?: ViewStyle;
}

export function SkeletonRow({ delay = 0, height = 56, style }: SkeletonRowProps) {
  const opacityAnim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 700,
          delay,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.3,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [opacityAnim, delay]);

  return (
    <Animated.View
      style={[
        styles.skeletonContainer,
        { minHeight: height, opacity: opacityAnim },
        style,
      ]}
    >
      <View style={styles.leftPill} />
      <View style={styles.contentWrap}>
        <View style={styles.titleLine} />
        <View style={styles.subtitleLine} />
      </View>
      <View style={styles.rightPill} />
    </Animated.View>
  );
}

export default function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonRow key={i} delay={i * 40} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.base,
    overflow: 'hidden',
  },
  skeletonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    backgroundColor: Colors.surface,
  },
  leftPill: {
    width: 32,
    height: 32,
    borderRadius: Radius.base,
    backgroundColor: Colors.tintNeutral,
    marginRight: Spacing.md,
  },
  contentWrap: {
    flex: 1,
    gap: 6,
  },
  titleLine: {
    width: '60%',
    height: 14,
    borderRadius: 3,
    backgroundColor: Colors.tintNeutral,
  },
  subtitleLine: {
    width: '40%',
    height: 10,
    borderRadius: 2,
    backgroundColor: Colors.tintNeutral,
  },
  rightPill: {
    width: 50,
    height: 22,
    borderRadius: Radius.base,
    backgroundColor: Colors.tintNeutral,
  },
});

