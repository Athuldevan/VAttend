import React, { useState, useEffect, useCallback } from 'react';
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
import { Colors, Spacing, Radius, FontSize, Fonts } from '../constants/theme';
import { getMyTimetable, TimetableSlot } from '../api/timetable';
import { getSlotAttendance } from '../api/attendance';
import { useAuth } from '../context/AuthContext';

export interface PeriodItem {
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
  classId?: string;
  semester?: number;
}

const DAYS = [
  { day: 1, label: 'Mon', full: 'Monday' },
  { day: 2, label: 'Tue', full: 'Tuesday' },
  { day: 3, label: 'Wed', full: 'Wednesday' },
  { day: 4, label: 'Thu', full: 'Thursday' },
  { day: 5, label: 'Fri', full: 'Friday' },
];

const getTodayDayOfWeek = (): number => {
  const d = new Date().getDay();
  if (d >= 1 && d <= 5) return d;
  return 1;
};

const formatTime = (timeStr?: string): string => {
  if (!timeStr) return '';
  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;
  let h = parseInt(parts[0], 10);
  const m = parts[1];
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
};

const getSubjectName = (subj: any): string => {
  if (!subj) return 'General Subject';
  if (typeof subj === 'string') return subj;
  if (subj.name) {
    return subj.code ? `${subj.name} (${subj.code})` : subj.name;
  }
  return 'General Subject';
};

const getClassName = (cls: any, sem: number): string => {
  if (!cls) return `Semester ${sem}`;
  if (typeof cls === 'string') return `Class · Sem ${sem}`;
  const progName =
    cls.programId?.name ||
    (cls.academicYear ? `AY ${cls.academicYear}` : 'Class');
  const yearText = cls.year ? ` · Year ${cls.year}` : '';
  return `${progName}${yearText} · Sem ${sem}`;
};

const getRoom = (slot: TimetableSlot): string => {
  const dept =
    typeof slot.department === 'object'
      ? slot.department?.code || slot.department?.name
      : '';
  return dept ? `${dept} Dept` : `Room ${100 + slot.period}`;
};

// Period card accent colors cycling
const PERIOD_ACCENTS = [
  { left: Colors.primary, bg: Colors.primaryMuted },
  { left: Colors.blue, bg: Colors.blueBg },
  { left: Colors.salmon, bg: Colors.salmonBg },
  { left: Colors.purple, bg: Colors.purpleBg },
  { left: Colors.success, bg: Colors.greenBg },
];

interface TodayScreenProps {
  onSelectPeriod?: (period: PeriodItem) => void;
}

export default function TodayScreen({ onSelectPeriod }: TodayScreenProps) {
  const { user } = useAuth();
  const [selectedDay, setSelectedDay] = useState<number>(getTodayDayOfWeek());
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [rawSlots, setRawSlots] = useState<TimetableSlot[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<
    Record<
      string,
      {
        isMarked: boolean;
        presentCount?: number;
        absentCount?: number;
        totalStudents?: number;
      }
    >
  >({});

  const todayActualDay = new Date().getDay();
  const todayYMD = new Date().toISOString().split('T')[0];

  const fetchTimetable = useCallback(async () => {
    try {
      const res = await getMyTimetable();
      const slots = res.data || [];
      setRawSlots(slots);
      if (slots.length > 0) {
        const statusMap: Record<string, any> = {};
        await Promise.all(
          slots.map(async (slot) => {
            try {
              const att = await getSlotAttendance(slot.id, todayYMD);
              if (att?.data?.isMarked) {
                const recs = att.data.records || [];
                const present = recs.filter(
                  (r: any) => r.status === 'present'
                ).length;
                const absent = recs.filter(
                  (r: any) => r.status === 'absent'
                ).length;
                statusMap[slot.id] = {
                  isMarked: true,
                  presentCount: present,
                  absentCount: absent,
                  totalStudents: recs.length,
                };
              } else {
                statusMap[slot.id] = {
                  isMarked: false,
                  totalStudents: att?.data?.enrolledStudents?.length || 0,
                };
              }
            } catch {
              statusMap[slot.id] = { isMarked: false };
            }
          })
        );
        setAttendanceMap(statusMap);
      }
    } catch {
      setRawSlots([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [todayYMD]);

  useEffect(() => {
    fetchTimetable();
  }, [fetchTimetable]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchTimetable();
  }, [fetchTimetable]);

  const daySlots: PeriodItem[] = rawSlots
    .filter((s) => s.dayOfWeek === selectedDay)
    .sort((a, b) => a.period - b.period)
    .map((slot) => {
      const att = attendanceMap[slot.id] || { isMarked: false };
      const classId =
        typeof slot.class === 'object'
          ? slot.class?.id || slot.class?._id
          : slot.class;

      return {
        timetableSlotId: slot.id,
        periodNumber: slot.period,
        startTime: formatTime(slot.startTime),
        endTime: formatTime(slot.endTime),
        subjectName: getSubjectName(slot.subject),
        className: getClassName(slot.class, slot.semester),
        room: getRoom(slot),
        isMarked: att.isMarked,
        presentCount: att.presentCount,
        absentCount: att.absentCount,
        totalStudents: att.totalStudents,
        classId,
        semester: slot.semester,
      };
    });

  const totalClasses = daySlots.length;
  const markedClasses = daySlots.filter((p) => p.isMarked).length;
  const unmarkedClasses = totalClasses - markedClasses;

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const currentDayInfo = DAYS.find((d) => d.day === selectedDay);
  const greeting = getGreeting();

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
        <Text style={styles.greeting}>{greeting}</Text>
        <Text style={styles.userName}>{user?.name || 'Teacher'} 👋</Text>
        <Text style={styles.bannerDate}>{todayFormatted}</Text>
      </View>

      {/* Stat Summary Cards */}
      <View style={styles.statsRow}>
        <StatCard
          icon="calendar"
          label="Total"
          value={totalClasses}
          color={Colors.blue}
          bg={Colors.blueBg}
        />
        <StatCard
          icon="checkmark-circle"
          label="Marked"
          value={markedClasses}
          color={Colors.success}
          bg={Colors.successBg}
        />
        <StatCard
          icon="time"
          label="Pending"
          value={unmarkedClasses}
          color={Colors.salmon}
          bg={Colors.salmonBg}
        />
      </View>

      {/* Weekday Selector */}
      <View style={styles.daySelectorContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daySelectorScroll}
        >
          {DAYS.map((item) => {
            const isSelected = selectedDay === item.day;
            const isToday = todayActualDay === item.day;

            return (
              <TouchableOpacity
                key={item.day}
                style={[styles.dayPill, isSelected && styles.dayPillActive]}
                onPress={() => setSelectedDay(item.day)}
                activeOpacity={0.75}
              >
                <Text style={[styles.dayPillText, isSelected && styles.dayPillTextActive]}>
                  {item.label}
                </Text>
                {isToday && (
                  <View style={[styles.todayDot, isSelected && styles.todayDotActive]} />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Section Header */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {currentDayInfo?.full || 'Daily'} Schedule
        </Text>
        <View style={styles.sessionCountBadge}>
          <Text style={styles.sectionCount}>{daySlots.length} sessions</Text>
        </View>
      </View>

      {/* Loading state */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Fetching your timetable...</Text>
        </View>
      ) : daySlots.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconWrap}>
            <Ionicons name="calendar-clear-outline" size={40} color={Colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>
            No Classes on {currentDayInfo?.full || 'this day'}
          </Text>
          <Text style={styles.emptySubtext}>
            You have no timetable periods for {currentDayInfo?.full}. Tap another day to view its schedule.
          </Text>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={fetchTimetable}
            activeOpacity={0.8}
          >
            <Ionicons name="refresh-outline" size={16} color={Colors.text} />
            <Text style={styles.refreshBtnText}>Reload Schedule</Text>
          </TouchableOpacity>
        </View>
      ) : (
        daySlots.map((period, idx) => {
          const accent = PERIOD_ACCENTS[idx % PERIOD_ACCENTS.length];
          return (
            <View key={period.timetableSlotId} style={styles.periodCard}>
              {/* Colored left bar */}
              <View style={[styles.periodLeftBar, { backgroundColor: accent.left }]} />

              <View style={styles.periodContent}>
                {/* Top row: period + status */}
                <View style={styles.periodTop}>
                  <View style={[styles.periodPill, { backgroundColor: accent.bg }]}>
                    <Text style={[styles.periodLabel, { color: accent.left }]}>P{period.periodNumber}</Text>
                    <Text style={[styles.timeText, { color: accent.left }]}>
                      {period.startTime} – {period.endTime}
                    </Text>
                  </View>

                  {period.isMarked ? (
                    <View style={styles.statusDone}>
                      <Ionicons name="checkmark-circle" size={14} color={Colors.success} />
                      <Text style={[styles.statusText, { color: Colors.success }]}>Done</Text>
                    </View>
                  ) : (
                    <View style={styles.statusPending}>
                      <Ionicons name="time-outline" size={14} color={Colors.warning} />
                      <Text style={[styles.statusText, { color: Colors.warning }]}>Pending</Text>
                    </View>
                  )}
                </View>

                {/* Subject name */}
                <Text style={styles.subjectName}>{period.subjectName}</Text>

                {/* Meta row */}
                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <Ionicons name="people-outline" size={13} color={Colors.textTertiary} />
                    <Text style={styles.metaText}>{period.className}</Text>
                  </View>
                  <View style={styles.metaDot} />
                  <View style={styles.metaItem}>
                    <Ionicons name="location-outline" size={13} color={Colors.textTertiary} />
                    <Text style={styles.metaText}>{period.room}</Text>
                  </View>
                </View>

                {/* Attendance Info / Action */}
                {period.isMarked ? (
                  <View style={styles.attendanceInfo}>
                    <View style={styles.attendancePill}>
                      <View style={[styles.attendanceDot, { backgroundColor: Colors.success }]} />
                      <Text style={styles.attendanceText}>
                        {period.presentCount ?? 0} present
                      </Text>
                      <View style={[styles.attendanceDot, { backgroundColor: Colors.error }]} />
                      <Text style={styles.attendanceText}>
                        {period.absentCount ?? 0} absent
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.editBtn}
                      activeOpacity={0.7}
                      onPress={() => onSelectPeriod?.(period)}
                    >
                      <Ionicons name="create-outline" size={14} color={Colors.blue} />
                      <Text style={[styles.editBtnText, { color: Colors.blue }]}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={[styles.markBtn, { backgroundColor: accent.left }]}
                    activeOpacity={0.85}
                    onPress={() => onSelectPeriod?.(period)}
                  >
                    <Ionicons name="checkmark-done-outline" size={16} color="#fff" />
                    <Text style={styles.markBtnText}>Mark Attendance</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })
      )}

      <View style={{ height: Spacing['4xl'] }} />
    </ScrollView>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good afternoon,';
  return 'Good evening,';
}

function StatCard({
  icon,
  label,
  value,
  color,
  bg,
}: {
  icon: string;
  label: string;
  value: number;
  color: string;
  bg: string;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: bg }]}>
      <Ionicons name={icon as any} size={20} color={color} />
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
  },

  // Banner
  banner: {
    marginBottom: Spacing.xl,
  },
  greeting: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
  },
  userName: {
    fontSize: FontSize['2xl'],
    fontFamily: Fonts.extrabold,
    color: Colors.text,
    marginTop: 2,
  },
  bannerDate: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.medium,
    color: Colors.textTertiary,
    marginTop: 4,
  },

  // Stats Row
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontSize: FontSize.xl,
    fontFamily: Fonts.extrabold,
  },
  statLabel: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
  },

  // Day Selector
  daySelectorContainer: {
    marginBottom: Spacing.lg,
  },
  daySelectorScroll: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingVertical: 2,
  },
  dayPill: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  dayPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayPillText: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.semibold,
    color: Colors.textSecondary,
  },
  dayPillTextActive: {
    color: Colors.text,
    fontFamily: Fonts.bold,
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.primary,
    marginTop: 3,
  },
  todayDotActive: {
    backgroundColor: Colors.text,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  sessionCountBadge: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sectionCount: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.semibold,
    color: Colors.textSecondary,
  },

  // Loading & Empty
  loadingContainer: {
    paddingVertical: Spacing['5xl'],
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['4xl'],
    paddingHorizontal: Spacing.xl,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: FontSize.base,
    fontFamily: Fonts.bold,
    color: Colors.text,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.regular,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.xl,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
  },
  refreshBtnText: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },

  // Period Cards
  periodCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    marginBottom: Spacing.md,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  periodLeftBar: {
    width: 4,
    borderRadius: 4,
    margin: 10,
    marginRight: 0,
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
  },
  periodContent: {
    flex: 1,
    padding: Spacing.lg,
  },
  periodTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  periodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  periodLabel: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.bold,
  },
  timeText: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.semibold,
  },
  statusDone: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.successBg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusPending: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.warningBg,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.bold,
  },
  subjectName: {
    fontSize: FontSize.base,
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: Spacing.xs,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: Colors.textTertiary,
  },
  metaText: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.medium,
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
  attendancePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  attendanceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  attendanceText: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.semibold,
    color: Colors.textSecondary,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.blueBg,
  },
  editBtnText: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.bold,
  },
  markBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    marginTop: Spacing.md,
  },
  markBtnText: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.bold,
    color: '#fff',
  },
});
