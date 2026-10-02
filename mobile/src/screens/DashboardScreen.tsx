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
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';

// Mock data — matches web TeacherDashboard
const stats = [
  { label: "Today's Classes", value: '5', icon: 'calendar-outline', color: Colors.textSecondary, bg: Colors.background },
  { label: 'Completed', value: '3', icon: 'checkmark-circle-outline', color: Colors.success, bg: Colors.successBg },
  { label: 'Attendance', value: '88.5%', icon: 'stats-chart-outline', color: Colors.primary, bg: Colors.primaryBg },
  { label: 'Low Alert', value: '3', icon: 'warning-outline', color: Colors.error, bg: Colors.errorBg },
];

const attendanceData = [
  { label: 'Present', value: '82%', icon: 'checkmark-circle', color: Colors.success, bg: Colors.successBg },
  { label: 'Absent', value: '10%', icon: 'close-circle', color: Colors.error, bg: Colors.errorBg },
  { label: 'Half Day', value: '3%', icon: 'time', color: Colors.warning, bg: Colors.warningBg },
  { label: 'Leave', value: '5%', icon: 'document-text', color: Colors.info, bg: Colors.infoBg },
];

const lowAttendanceStudents = [
  { id: '1', name: 'Rahul Kumar', className: '2nd Year B.Sc Statistics', attendance: 68 },
  { id: '2', name: 'Anjali S', className: '2nd Year B.Sc Statistics', attendance: 71 },
  { id: '3', name: 'Muhammed Rafi', className: '3rd Year BCA', attendance: 73 },
];

const pendingLeaves = [
  { id: '1', name: 'Akhil Raj', className: '2nd Year B.Sc Statistics', dates: '20–21 Sep', reason: 'Medical' },
  { id: '2', name: 'Fathima N', className: '3rd Year BCA', dates: '22 Sep', reason: 'Sports Duty' },
];

export default function DashboardScreen() {
  const [refreshing, setRefreshing] = React.useState(false);

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
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
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />
      }
    >
      {/* Welcome Header */}
      <View style={styles.welcomeHeader}>
        <View>
          <Text style={styles.welcomeTitle}>Welcome back</Text>
          <Text style={styles.welcomeDate}>{todayFormatted}</Text>
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {stats.map((s) => (
          <View key={s.label} style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: s.bg }]}>
              <Ionicons name={s.icon as any} size={18} color={s.color} />
            </View>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Attendance Distribution */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionCardTitle}>Attendance Distribution</Text>
        <Text style={styles.sectionCardSub}>Today's summary</Text>
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
        </View>
      </View>

      {/* Low Attendance */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionCardHeader}>
          <View>
            <Text style={styles.sectionCardTitle}>Defaulter Warning</Text>
            <Text style={styles.sectionCardSub}>Below 75% attendance</Text>
          </View>
          <View style={styles.alertBadge}>
            <Text style={styles.alertBadgeText}>{lowAttendanceStudents.length}</Text>
          </View>
        </View>

        {lowAttendanceStudents.map((s, i) => (
          <View
            key={s.id}
            style={[styles.listItem, i === lowAttendanceStudents.length - 1 && styles.listItemLast]}
          >
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
          <View style={[styles.alertBadge, { backgroundColor: Colors.infoBg }]}>
            <Text style={[styles.alertBadgeText, { color: Colors.info }]}>{pendingLeaves.length}</Text>
          </View>
        </View>

        {pendingLeaves.map((l, i) => (
          <View key={l.id} style={[styles.listItem, i === pendingLeaves.length - 1 && styles.listItemLast]}>
            <View style={styles.listItemLeft}>
              <Text style={styles.listItemName}>{l.name}</Text>
              <Text style={styles.listItemSub}>{l.className} · {l.reason}</Text>
            </View>
            <View style={[styles.percentBadge, { backgroundColor: Colors.infoBg }]}>
              <Text style={[styles.percentText, { color: Colors.info }]}>{l.dates}</Text>
            </View>
          </View>
        ))}
      </View>

      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg },
  welcomeHeader: {
    marginBottom: Spacing.xl,
  },
  welcomeTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  welcomeDate: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  statCard: {
    width: '48%' as any,
    flexGrow: 1,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    fontWeight: FontWeight.medium,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
  },
  sectionCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  sectionCardTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  sectionCardSub: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    paddingHorizontal: Spacing.lg,
    marginTop: 2,
    marginBottom: Spacing.md,
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
    fontWeight: FontWeight.bold,
  },
  distValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginTop: Spacing.sm,
  },
  alertBadge: {
    backgroundColor: Colors.errorBg,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
  },
  alertBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.error,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  listItemLast: {
    borderBottomWidth: 0,
  },
  listItemLeft: {
    flex: 1,
    marginRight: Spacing.md,
  },
  listItemName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  listItemSub: {
    fontSize: FontSize.xs,
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
    fontWeight: FontWeight.bold,
  },
});
