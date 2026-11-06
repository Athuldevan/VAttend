import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, Fonts } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import TodayScreen from '../screens/TodayScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ClassesScreen from '../screens/ClassesScreen';
import DepartmentsScreen from '../screens/DepartmentsScreen';
import MarkAttendanceScreen from '../screens/MarkAttendanceScreen';
import TeachersScreen from '../screens/TeachersScreen';
import SubjectsScreen from '../screens/SubjectsScreen';

export type TabKey = 'today' | 'dashboard' | 'classes' | 'departments' | 'teachers' | 'subjects';

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
      case 'departments':
        return <DepartmentsScreen />;
      case 'teachers':
        return <TeachersScreen />;
      case 'subjects':
        return <SubjectsScreen />;
      default:
        return <TodayScreen />;
    }
  };

  const tabs: Array<{
    key: TabKey;
    label: string;
    icon: keyof typeof Ionicons.glyphMap;
    activeIcon: keyof typeof Ionicons.glyphMap;
    accentColor: string;
    accentBg: string;
  }> = [
    { key: 'today', label: 'Today', icon: 'calendar-outline', activeIcon: 'calendar', accentColor: Colors.primary, accentBg: Colors.primaryMuted },
    { key: 'dashboard', label: 'Overview', icon: 'pie-chart-outline', activeIcon: 'pie-chart', accentColor: Colors.blue, accentBg: Colors.blueBg },
    { key: 'classes', label: 'Classes', icon: 'people-outline', activeIcon: 'people', accentColor: Colors.salmon, accentBg: Colors.salmonBg },
    { key: 'subjects', label: 'Subjects', icon: 'book-outline', activeIcon: 'book', accentColor: Colors.purple, accentBg: Colors.purpleBg },
    ...(user?.role === 'ADMIN'
      ? [
          { key: 'departments' as TabKey, label: 'Dept', icon: 'business-outline' as keyof typeof Ionicons.glyphMap, activeIcon: 'business' as keyof typeof Ionicons.glyphMap, accentColor: Colors.success, accentBg: Colors.greenBg },
          { key: 'teachers' as TabKey, label: 'Teachers', icon: 'person-add-outline' as keyof typeof Ionicons.glyphMap, activeIcon: 'person-add' as keyof typeof Ionicons.glyphMap, accentColor: Colors.primaryDark, accentBg: Colors.primaryBg },
        ]
      : []),
  ];

  const activeTabInfo = tabs.find(t => t.key === activeTab);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* Top App Header */}
      <View style={styles.topHeader}>
        <View style={styles.brandRow}>
          <View style={[styles.brandBadge, { backgroundColor: activeTabInfo?.accentColor || Colors.primary }]}>
            <Ionicons name="school" size={15} color="#fff" />
          </View>
          <View>
            <Text style={styles.brandTitle}>AMS Portal</Text>
            <Text style={styles.brandRole}>
              {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'Faculty'} · {user?.name || user?.email || 'Logged in'}
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

      {/* Floating Rounded Bottom Navigation Bar */}
      <View style={styles.tabBarWrapper}>
        <View style={styles.tabBar}>
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={styles.tabItem}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.75}
              >
                <View style={[styles.tabIconWrapper, isActive && { backgroundColor: tab.accentBg }]}>
                  <Ionicons
                    name={isActive ? tab.activeIcon : tab.icon}
                    size={21}
                    color={isActive ? tab.accentColor : Colors.textTertiary}
                  />
                </View>
                <Text style={[styles.tabLabel, isActive && { color: tab.accentColor, fontFamily: Fonts.bold }]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  brandBadge: {
    width: 34,
    height: 34,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTitle: {
    fontSize: FontSize.base,
    fontFamily: Fonts.bold,
    color: Colors.text,
    letterSpacing: 0.3,
  },
  brandRole: {
    fontSize: 11,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.full,
    backgroundColor: Colors.backgroundAlt,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  screenContainer: {
    flex: 1,
  },
  tabBarWrapper: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? Spacing.lg : Spacing.md,
    paddingTop: Spacing.xs,
    backgroundColor: Colors.background,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: Radius['2xl'],
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  tabIconWrapper: {
    width: 40,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.lg,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: Fonts.medium,
    color: Colors.textTertiary,
    marginTop: 1,
    letterSpacing: 0.2,
  },
});
