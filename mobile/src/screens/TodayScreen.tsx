import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';

interface PeriodItem {
  timetableSlotId: string;
  periodNumber: number;
  startTime: string;
  endTime: string;
  subjectName: string;
  className: string;
  room: string;
  isMarked: boolean;
  presentCount?: number;
  absentCount?: number;
  totalStudents?: number;
}

const mockPeriods: PeriodItem[] = [
  {
    timetableSlotId: 'slot-001',
    periodNumber: 1,
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    subjectName: 'Probability Theory',
    className: '2nd Year B.Sc Statistics',
    room: 'Room 304',
    isMarked: true,
    presentCount: 28,
    absentCount: 2,
    totalStudents: 30,
  },
  {
    timetableSlotId: 'slot-002',
    periodNumber: 2,
    startTime: '10:00 AM',
    endTime: '11:00 AM',
    subjectName: 'Data Structures & Algorithms',
    className: '1st Year B.Sc CS',
    room: 'Lab 2',
    isMarked: false,
  },
  {
    timetableSlotId: 'slot-003',
    periodNumber: 3,
    startTime: '11:15 AM',
    endTime: '12:15 PM',
    subjectName: 'Database Management',
    className: '3rd Year BCA',
    room: 'Room 108',
    isMarked: true,
    presentCount: 25,
    absentCount: 3,
    totalStudents: 28,
  },
  {
    timetableSlotId: 'slot-004',
    periodNumber: 4,
    startTime: '01:30 PM',
    endTime: '02:30 PM',
    subjectName: 'Web Development Lab',
    className: '2nd Year B.Sc CS',
    room: 'Software Lab A',
    isMarked: false,
  },
  {
    timetableSlotId: 'slot-005',
    periodNumber: 5,
    startTime: '02:30 PM',
    endTime: '03:30 PM',
    subjectName: 'Operating Systems',
    className: '3rd Year B.Sc CS',
    room: 'Room 202',
    isMarked: true,
    presentCount: 27,
    absentCount: 3,
    totalStudents: 30,
  },
];

interface TodayScreenProps {
  onSelectPeriod?: (period: PeriodItem) => void;
}

export default function TodayScreen({ onSelectPeriod }: TodayScreenProps) {
  const [refreshing, setRefreshing] = React.useState(false);
  const periods = mockPeriods;

  const totalClasses = periods.length;
  const markedClasses = periods.filter((p) => p.isMarked).length;
  const unmarkedClasses = totalClasses - markedClasses;

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
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
      contentContainerStyle={styles.contentContainer}
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
      {/* Header Banner */}
      <View style={styles.banner}>
        <Text style={styles.bannerDate}>{todayFormatted}</Text>
        <Text style={styles.bannerSubtext}>Your classes & attendance today</Text>
      </View>

      {/* Stat Row */}
      <View style={styles.statsRow}>
        <StatBadge
          icon="calendar-outline"
          label="Total"
          value={totalClasses}
          color={Colors.textSecondary}
          bgColor={Colors.background}
        />
        <StatBadge
          icon="checkmark-circle-outline"
          label="Done"
          value={markedClasses}
          color={Colors.success}
          bgColor={Colors.successBg}
        />
        <StatBadge
          icon="time-outline"
          label="Pending"
          value={unmarkedClasses}
          color={Colors.warning}
          bgColor={Colors.warningBg}
        />
      </View>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Period Schedule</Text>
        <Text style={styles.sectionCount}>{periods.length} sessions</Text>
      </View>

      {/* Period Cards */}
      {periods.map((period) => (
        <View key={period.timetableSlotId} style={styles.periodCard}>
          {/* Time Badge */}
          <View style={styles.periodTop}>
            <View style={styles.timeBadge}>
              <Text style={styles.periodLabel}>P{period.periodNumber}</Text>
              <Text style={styles.timeText}>
                {period.startTime} – {period.endTime}
              </Text>
            </View>

            {/* Status Chip */}
            {period.isMarked ? (
              <View style={[styles.statusChip, styles.statusDone]}>
                <Ionicons name="checkmark" size={12} color={Colors.success} />
                <Text style={[styles.statusText, { color: Colors.success }]}>Done</Text>
              </View>
            ) : (
              <View style={[styles.statusChip, styles.statusPending]}>
                <Ionicons name="time-outline" size={12} color={Colors.warning} />
                <Text style={[styles.statusText, { color: Colors.warning }]}>Pending</Text>
              </View>
            )}
          </View>

          {/* Details */}
          <Text style={styles.subjectName}>{period.subjectName}</Text>
          <View style={styles.detailRow}>
            <Ionicons name="people-outline" size={14} color={Colors.textTertiary} />
            <Text style={styles.detailText}>{period.className}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location-outline" size={14} color={Colors.textTertiary} />
            <Text style={styles.detailText}>{period.room}</Text>
          </View>

          {/* Attendance Info / Action */}
          {period.isMarked ? (
            <View style={styles.attendanceInfo}>
              <Text style={styles.attendanceText}>
                {period.presentCount} present · {period.absentCount} absent
              </Text>
              <TouchableOpacity
                style={styles.editBtn}
                activeOpacity={0.7}
                onPress={() => onSelectPeriod?.(period)}
              >
                <Ionicons name="create-outline" size={14} color={Colors.primary} />
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.markBtn}
              activeOpacity={0.8}
              onPress={() => onSelectPeriod?.(period)}
            >
              <Ionicons name="checkmark-done-outline" size={16} color={Colors.textInverse} />
              <Text style={styles.markBtnText}>Mark Attendance</Text>
            </TouchableOpacity>
          )}
        </View>
      ))}

      <View style={{ height: Spacing['3xl'] }} />
    </ScrollView>
  );
}

function StatBadge({
  icon,
  label,
  value,
  color,
  bgColor,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}) {
  return (
    <View style={[styles.statBadge, { backgroundColor: bgColor }]}>
      <Ionicons name={icon as any} size={18} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: Spacing.lg,
  },
  banner: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.xl,
    padding: Spacing['2xl'],
    marginBottom: Spacing.lg,
  },
  bannerDate: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
  },
  bannerSubtext: {
    fontSize: FontSize.sm,
    color: Colors.primaryMuted,
    marginTop: Spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  statBadge: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    fontWeight: FontWeight.medium,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  sectionCount: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    fontWeight: FontWeight.medium,
  },
  periodCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  periodTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  periodLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
    backgroundColor: Colors.primaryBg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    overflow: 'hidden',
  },
  timeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusDone: {
    backgroundColor: Colors.successBg,
  },
  statusPending: {
    backgroundColor: Colors.warningBg,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
  },
  subjectName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: 4,
  },
  detailText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  attendanceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  attendanceText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.success,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  editBtnText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.primary,
  },
  markBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
  },
  markBtnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.textInverse,
  },
});
