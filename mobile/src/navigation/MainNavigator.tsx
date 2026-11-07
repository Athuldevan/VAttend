import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, Fonts } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import TodayScreen, { type PeriodItem } from '../screens/TodayScreen';
import DashboardScreen from '../screens/DashboardScreen';
import ClassesScreen from '../screens/ClassesScreen';
import ManageScreen, { type ManageSubScreen } from '../screens/ManageScreen';
import DepartmentsScreen from '../screens/DepartmentsScreen';
import ProgramsScreen from '../screens/ProgramsScreen';
import SubjectsScreen from '../screens/SubjectsScreen';
import TeachersScreen from '../screens/TeachersScreen';
import MarkAttendanceScreen from '../screens/MarkAttendanceScreen';
import TabBar, { type TabItem } from '../components/TabBar';

export type MainTabKey = 'today' | 'overview' | 'classes' | 'manage';

interface ModalState {
  type: 'mark-attendance';
  period: PeriodItem;
}

export default function MainNavigator() {
  const { user, logout } = useAuth();
  const isHOD = user?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState<MainTabKey>('today');
  const [activeSubScreen, setActiveSubScreen] = useState<ManageSubScreen | null>(null);
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

  // Full-screen attendance modal
  if (activeModal?.type === 'mark-attendance') {
    return (
      <MarkAttendanceScreen
        route={{ params: { period: activeModal.period } }}
        navigation={{ goBack: () => setActiveModal(null) }}
      />
    );
  }

  // Handle switching tabs
  const handleSelectTab = (tabKey: string) => {
    setActiveTab(tabKey as MainTabKey);
    // If clicking away from manage, reset subscreen
    if (tabKey !== 'manage') {
      setActiveSubScreen(null);
    }
  };

  const renderScreen = () => {
    switch (activeTab) {
      case 'today':
        return (
          <TodayScreen
            onSelectPeriod={(period) =>
              setActiveModal({ type: 'mark-attendance', period })
            }
          />
        );
      case 'overview':
        return <DashboardScreen />;
      case 'classes':
        return <ClassesScreen />;
      case 'manage':
        if (activeSubScreen === 'departments') {
          return <DepartmentsScreen onBack={() => setActiveSubScreen(null)} />;
        }
        if (activeSubScreen === 'programs') {
          return <ProgramsScreen onBack={() => setActiveSubScreen(null)} />;
        }
        if (activeSubScreen === 'subjects') {
          return <SubjectsScreen onBack={() => setActiveSubScreen(null)} />;
        }
        if (activeSubScreen === 'faculty') {
          return <TeachersScreen onBack={() => setActiveSubScreen(null)} />;
        }
        return (
          <ManageScreen
            onNavigateSub={(sub) => setActiveSubScreen(sub)}
          />
        );
      default:
        return <TodayScreen />;
    }
  };

  // Tabs: Teachers see only Today and Overview; HOD sees all four.
  const tabs: TabItem[] = [
    {
      key: 'today',
      label: 'Today',
      icon: 'calendar-outline',
      activeIcon: 'calendar',
    },
    {
      key: 'overview',
      label: 'Overview',
      icon: 'pie-chart-outline',
      activeIcon: 'pie-chart',
    },
    ...(isHOD
      ? [
          {
            key: 'classes',
            label: 'Classes',
            icon: 'school-outline' as keyof typeof Ionicons.glyphMap,
            activeIcon: 'school' as keyof typeof Ionicons.glyphMap,
          },
          {
            key: 'manage',
            label: 'Manage',
            icon: 'grid-outline' as keyof typeof Ionicons.glyphMap,
            activeIcon: 'grid' as keyof typeof Ionicons.glyphMap,
          },
        ]
      : []),
  ];

  const roleLabel = isHOD ? 'HOD' : 'Teacher';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />

      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.brandRow}>
          <View>
            <Text style={styles.brandTitle}>AMS · Victoria College</Text>
            <Text style={styles.brandRole}>
              {roleLabel} · {user?.name || user?.email || 'Faculty'}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={handleLogout}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="log-out-outline" size={18} color={Colors.muted} />
        </TouchableOpacity>
      </View>

      {/* Screen Container */}
      <View style={styles.screenContainer}>{renderScreen()}</View>

      {/* Bottom Tab Bar */}
      <TabBar
        tabs={tabs}
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
      />
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
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  brandTitle: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.lg,
    color: Colors.ink,
  },
  brandRole: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.muted,
    marginTop: 1,
  },
  logoutBtn: {
    width: 36,
    height: 36,
    borderRadius: Radius.base,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  screenContainer: {
    flex: 1,
  },
});
