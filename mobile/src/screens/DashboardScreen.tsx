import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, Fonts } from '../constants/theme';

// Mock data — matches web TeacherDashboard
const stats: Array<{ label: string; value: string; icon: string; color: string; bg: string }> = [];

const attendanceData: Array<{ label: string; value: string; icon: string; color: string; bg: string }> = [];

const lowAttendanceStudents: Array<{ id: string; name: string; className: string; attendance: number }> = [];

const pendingLeaves: Array<{ id: string; name: string; className: string; dates: string; reason: string }> = [];

// Today's attendance mock (check-in / check-out / hours)
const todayAttendance = {
  checkIn: '09:05 AM',
  checkOut: '—',
  workingHours: '—',
  status: 'In Progress',
};

const quickStats = [
  { label: 'Total Classes', value: '24', icon: 'calendar', color: Colors.blue, bg: Colors.blueBg },
  { label: 'Marked Today', value: '6', icon: 'checkmark-circle', color: Colors.success, bg: Colors.successBg },
  { label: 'Pending', value: '2', icon: 'time', color: Colors.salmon, bg: Colors.salmonBg },
  { label: 'Students', value: '180', icon: 'people', color: Colors.purple, bg: Colors.purpleBg },
];

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = React.useState(false);

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1200);
  }, []);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.primary}
          colors={[Colors.primary]}
        />
      }
    >
      {/* Welcome Header */}
      <View style={styles.welcomeHeader}>
        <View>
          <Text style={styles.welcomeTitle}>Overview</Text>
          <Text style={styles.welcomeDate}>{todayFormatted}</Text>
        </View>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live</Text>
        </View>
      </View>

      {/* Today's Attendance Card */}
      <View style={styles.todayCard}>
        <View style={styles.todayCardHeader}>
          <View style={styles.todayCardTitleRow}>
            <View style={styles.todayIconBadge}>
              <Ionicons name="pulse" size={16} color={Colors.primary} />
            </View>
            <Text style={styles.todayCardTitle}>Today's Attendance</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: Colors.successBg }]}>
            <Text style={[styles.statusBadgeText, { color: Colors.success }]}>{todayAttendance.status}</Text>
          </View>
        </View>

        <View style={styles.todayMetrics}>
          <View style={styles.metricItem}>
            <View style={[styles.metricIcon, { backgroundColor: Colors.greenBg }]}>
              <Ionicons name="log-in-outline" size={18} color={Colors.success} />
            </View>
            <Text style={styles.metricValue}>{todayAttendance.checkIn}</Text>
            <Text style={styles.metricLabel}>Check In</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <View style={[styles.metricIcon, { backgroundColor: Colors.salmonBg }]}>
              <Ionicons name="log-out-outline" size={18} color={Colors.salmon} />
            </View>
            <Text style={styles.metricValue}>{todayAttendance.checkOut}</Text>
            <Text style={styles.metricLabel}>Check Out</Text>
          </View>

          <View style={styles.metricDivider} />

          <View style={styles.metricItem}>
            <View style={[styles.metricIcon, { backgroundColor: Colors.blueBg }]}>
              <Ionicons name="hourglass-outline" size={18} color={Colors.blue} />
            </View>
            <Text style={styles.metricValue}>{todayAttendance.workingHours}</Text>
            <Text style={styles.metricLabel}>Hours</Text>
          </View>
        </View>
      </View>

      {/* Quick Stats Grid */}
      <View style={styles.statsGrid}>
        {quickStats.map((s) => (
          <View key={s.label} style={[styles.statCard, { backgroundColor: s.bg }]}>
            <View style={styles.statCardTop}>
              <Ionicons name={s.icon as any} size={20} color={s.color} />
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            </View>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Attendance Distribution */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionCardHeaderPad}>
          <Text style={styles.sectionCardTitle}>Attendance Distribution</Text>
          <Text style={styles.sectionCardSub}>Today's summary</Text>
        </View>
        <View style={styles.distGrid}>
          {attendanceData.map((item) => (
            <View key={item.label} style={[styles.distItem, { backgroundColor: item.bg }]}>
              <View style={styles.distItemRow}>
                <Ionicons name={item.icon as any} size={16} color={item.color} />
                <Text style={[styles.distLabel, { color: item.color }]}>{item.label}</Text>
              </View>
              <Text style={[styles.distValue, { color: item.color }]}>{item.value}</Text>
            </View>
          ))}
          {attendanceData.length === 0 && (
            <Text style={styles.noDataText}>No distribution data yet</Text>
          )}
        </View>
      </View>

      {/* Defaulter Warning */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionCardHeader}>
          <View>
            <Text style={styles.sectionCardTitle}>Defaulter Warning</Text>
            <Text style={styles.sectionCardSub}>Below 75% attendance</Text>
          </View>
          <View style={[styles.countBadge, { backgroundColor: Colors.errorBg }]}>
            <Text style={[styles.countBadgeText, { color: Colors.error }]}>{lowAttendanceStudents.length}</Text>
          </View>
        </View>
        {lowAttendanceStudents.length === 0 && (
          <View style={styles.emptyRow}>
            <Ionicons name="checkmark-circle-outline" size={18} color={Colors.success} />
            <Text style={styles.emptyRowText}>All students are on track 🎉</Text>
          </View>
        )}
        {lowAttendanceStudents.map((s, i) => (
          <View key={s.id} style={[styles.listItem, i === lowAttendanceStudents.length - 1 && styles.listItemLast]}>
            <View style={styles.listAvatar}>
              <Text style={styles.listAvatarText}>{s.name.charAt(0)}</Text>
            </View>
            <View style={styles.listItemLeft}>
              <Text style={styles.listItemName}>{s.name}</Text>
              <Text style={styles.listItemSub}>{s.className}</Text>
            </View>
            <View style={[styles.percentBadge, { backgroundColor: Colors.errorBg }]}>
              <Text style={[styles.percentText, { color: Colors.error }]}>{s.attendance}%</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Pending Leaves */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionCardHeader}>
          <View>
            <Text style={styles.sectionCardTitle}>Pending Leaves</Text>
            <Text style={styles.sectionCardSub}>Requires approval</Text>
          </View>
          <View style={[styles.countBadge, { backgroundColor: Colors.blueBg }]}>
            <Text style={[styles.countBadgeText, { color: Colors.blue }]}>{pendingLeaves.length}</Text>
          </View>
        </View>
        {pendingLeaves.length === 0 && (
          <View style={styles.emptyRow}>
            <Ionicons name="checkmark-done-circle-outline" size={18} color={Colors.success} />
            <Text style={styles.emptyRowText}>No pending leaves to review</Text>
          </View>
        )}
        {pendingLeaves.map((l, i) => (
          <View key={l.id} style={[styles.listItem, i === pendingLeaves.length - 1 && styles.listItemLast]}>
            <View style={[styles.listAvatar, { backgroundColor: Colors.blueBg }]}>
              <Text style={[styles.listAvatarText, { color: Colors.blue }]}>{l.name.charAt(0)}</Text>
            </View>
            <View style={styles.listItemLeft}>
              <Text style={styles.listItemName}>{l.name}</Text>
              <Text style={styles.listItemSub}>{l.className} · {l.reason}</Text>
            </View>
            <View style={[styles.percentBadge, { backgroundColor: Colors.blueBg }]}>
              <Text style={[styles.percentText, { color: Colors.blue }]}>{l.dates}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ height: Spacing['4xl'] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg },

  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.xl,
  },
  welcomeTitle: {
    fontSize: FontSize['2xl'],
    fontFamily: Fonts.extrabold,
    color: Colors.text,
  },
  welcomeDate: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.successBg,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.success,
  },
  liveText: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.bold,
    color: Colors.success,
  },

  // Today's Attendance Card
  todayCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  todayCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  todayCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  todayIconBadge: {
    width: 28,
    height: 28,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  todayCardTitle: {
    fontSize: FontSize.base,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  statusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  statusBadgeText: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.bold,
  },
  todayMetrics: {
    flexDirection: 'row',
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricValue: {
    fontSize: FontSize.base,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  metricLabel: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.medium,
    color: Colors.textTertiary,
  },
  metricDivider: {
    width: 1,
    height: '60%',
    alignSelf: 'center',
    backgroundColor: Colors.border,
  },

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  statCard: {
    width: '47%' as any,
    flexGrow: 1,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
  },
  statCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  statValue: {
    fontSize: FontSize['2xl'],
    fontFamily: Fonts.extrabold,
  },
  statLabel: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
  },

  // Section cards
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  sectionCardHeaderPad: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  sectionCardTitle: {
    fontSize: FontSize.base,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  sectionCardSub: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.medium,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  distGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    padding: Spacing.lg,
  },
  distItem: {
    width: '47%' as any,
    flexGrow: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  distItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  distLabel: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.bold,
  },
  distValue: {
    fontSize: FontSize.xl,
    fontFamily: Fonts.extrabold,
    marginTop: Spacing.sm,
  },
  noDataText: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.medium,
    color: Colors.textTertiary,
    textAlign: 'center',
    width: '100%',
    paddingVertical: Spacing.md,
  },
  countBadge: {
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  countBadgeText: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.extrabold,
  },
  emptyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.lg,
  },
  emptyRowText: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
    gap: Spacing.md,
  },
  listItemLast: {
    borderBottomWidth: 0,
  },
  listAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listAvatarText: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.bold,
    color: Colors.primaryDark,
  },
  listItemLeft: {
    flex: 1,
  },
  listItemName: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  listItemSub: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.medium,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  percentBadge: {
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  percentText: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.bold,
  },
});
