import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, Fonts } from '../constants/theme';

export interface TabItem {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
}

interface TabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onSelectTab: (key: string) => void;
}

export default function TabBar({ tabs, activeTab, onSelectTab }: TabBarProps) {
  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onSelectTab(tab.key)}
            activeOpacity={0.7}
          >
            {/* Top 3px indicator line */}
            <View
              style={[
                styles.topLine,
                isActive ? styles.topLineActive : styles.topLineInactive,
              ]}
            />
            <View style={styles.iconContainer}>
              <Ionicons
                name={isActive ? tab.activeIcon : tab.icon}
                size={20}
                color={isActive ? Colors.brand : Colors.muted}
              />
            </View>
            <Text
              style={[
                styles.label,
                isActive ? styles.labelActive : styles.labelInactive,
              ]}
              numberOfLines={1}
            >
              {tab.label}
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
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    paddingBottom: Platform.OS === 'ios' ? 24 : Spacing.xs,
    height: Platform.OS === 'ios' ? 76 : 58,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingTop: Spacing.xs,
  },
  topLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  topLineActive: {
    backgroundColor: Colors.brand,
  },
  topLineInactive: {
    backgroundColor: 'transparent',
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 24,
  },
  label: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    marginTop: 2,
  },
  labelActive: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.brand,
  },
  labelInactive: {
    color: Colors.muted,
  },
});

