import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import TodayScreen from '../screens/TodayScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ClassesScreen from '../screens/ClassesScreen';
import ProgramsScreen from '../screens/ProgramsScreen';
import DepartmentsScreen from '../screens/DepartmentsScreen';
import MarkAttendanceScreen from '../screens/MarkAttendanceScreen';

export type TabKey = 'today' | 'dashboard' | 'classes' | 'programs' | 'departments';

interface ModalState {
  type: 'mark-attendance';
  period: any;
}

export default function MainNavigator() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>('today');
  const [activeModal, setActiveModal] = useState<ModalState | null>(null);

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of AMS?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ]
    );
  };

  // If a modal screen is open, display it over the tabs
  if (activeModal?.type === 'mark-attendance') {
    return (
      <MarkAttendanceScreen
        route={{ params: { period: activeModal.period } }}
        navigation={{ goBack: () => setActiveModal(null) }}
      />
    );
  }

  const renderScreen = () => {
    switch (activeTab) {
      case 'today':
        return (
          <TodayScreen
            onSelectPeriod={(period: any) =>
              setActiveModal({ type: 'mark-attendance', period })
            }
          />
        );
      case 'dashboard':
        return <DashboardScreen />;
      case 'classes':
        return <ClassesScreen />;
      case 'programs':
        return <ProgramsScreen />;
      case 'departments':
        return <DepartmentsScreen />;
      default:
        return <TodayScreen />;
    }
  };

  const tabs: Array<{
    key: TabKey;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    activeIcon: keyof typeof Ionicons.glyphMap;
  }> = [
    { key: 'today', label: 'Today', icon: 'calendar-outline', activeIcon: 'calendar' },
    { key: 'dashboard', label: 'Overview', icon: 'pie-chart-outline', activeIcon: 'pie-chart' },
    { key: 'classes', label: 'Classes', icon: 'people-outline', activeIcon: 'people' },
    { key: 'programs', label: 'Programs', icon: 'school-outline', activeIcon: 'school' },
    { key: 'departments', label: 'Dept', icon: 'business-outline', activeIcon: 'business' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Top App Header */}
      <View style={styles.topHeader}>
        <View style={styles.brandRow}>
          <View style={styles.brandBadge}>
            <Ionicons name="school" size={16} color={Colors.textInverse} />
          </View>
          <View>
            <Text style={styles.brandTitle}>AMS Portal</Text>
            <Text style={styles.brandRole}>
              {user?.role ? user.role.toUpperCase() : 'FACULTY'} · {user?.email || 'Logged in'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="log-out-outline" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Main Body */}
      <View style={styles.screenContainer}>{renderScreen()}</View>

      {/* Minimal Curved Bottom Navigation Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.7}
            >
              <View style={[styles.tabIconWrapper, isActive && styles.tabIconActive]}>
                <Ionicons
                  name={isActive ? tab.activeIcon : tab.icon}
                  size={20}
                  color={isActive ? Colors.primary : Colors.textTertiary}
                />
              </View>
              <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  brandBadge: {
    width: 32,
    height: 32,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    letterSpacing: 0.3,
  },
  brandRole: {
    fontSize: FontSize.xs - 1,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  logoutBtn: {
    padding: Spacing.xs,
    borderRadius: Radius.full,
  },
  screenContainer: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs,
    paddingBottom: Platform.OS === 'ios' ? Spacing.sm : Spacing.xs,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  tabIconWrapper: {
    width: 36,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
  },
  tabIconActive: {
    backgroundColor: Colors.primaryBg,
  },
  tabLabel: {
    fontSize: FontSize.xs - 1,
    color: Colors.textTertiary,
    marginTop: 2,
    fontWeight: FontWeight.medium,
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: FontWeight.bold,
  },
});
