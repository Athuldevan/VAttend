import React, { useState, useEffect, useCallback } from 'react';
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
import { getMyTimetable, TimetableSlot } from '../api/timetable';
import { getSlotAttendance } from '../api/attendance';
import { useAuth } from '../context/AuthContext';
import ProgressBar from '../components/ProgressBar';
import Tag from '../components/Tag';
import Button from '../components/Button';
import SkeletonList from '../components/Skeleton';

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

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good afternoon,';
  return 'Good evening,';
}

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

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const currentDayInfo = DAYS.find((d) => d.day === selectedDay);
  const greeting = getGreeting();

  // Find the first pending period to feature "Mark attendance" button
  let firstPendingFound = false;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={Colors.brand}
          colors={[Colors.brand]}
        />
      }
    >
      {/* Date label */}
      <Text style={styles.dateLabel}>{todayFormatted.toUpperCase()}</Text>

      {/* Greeting (no emoji) */}
      <Text style={styles.heading}>
        {greeting} {user?.name ? user.name : 'Faculty'}
      </Text>

      {/* Progress bar */}
      <ProgressBar
        current={markedClasses}
        total={totalClasses}
        label={`${markedClasses} of ${totalClasses} periods marked`}
      />

      {/* Day Selector (Mon-Fri) */}
      <View style={styles.daySelector}>
        {DAYS.map((item) => {
          const isSelected = selectedDay === item.day;
          const isToday = todayActualDay === item.day;

          return (
            <TouchableOpacity
              key={item.day}
              style={[
                styles.dayPill,
                isSelected && styles.dayPillSelected,
              ]}
              onPress={() => setSelectedDay(item.day)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.dayLabel,
                  isSelected && styles.dayLabelSelected,
                ]}
              >
                {item.label}
              </Text>
              {isToday ? (
                <View
                  style={[
                    styles.todayDot,
                    isSelected && styles.todayDotSelected,
                  ]}
                />
              ) : null}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* ONE bordered list of periods separated by dividers */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          {currentDayInfo?.full || 'Daily'} Schedule
        </Text>
        <Text style={styles.sectionCount}>
          {totalClasses} {totalClasses === 1 ? 'period' : 'periods'}
        </Text>
      </View>

      {loading ? (
        <SkeletonList count={4} />
      ) : daySlots.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>
            No classes on {currentDayInfo?.full || 'this day'}
          </Text>
          <Text style={styles.emptySubtext}>
            There are no timetable periods scheduled for {currentDayInfo?.full}.
          </Text>
          <Button
            title="Reload schedule"
            onPress={fetchTimetable}
            variant="outline"
            size="sm"
            style={styles.reloadBtn}
          />
        </View>
      ) : (
        <View style={styles.periodListCard}>
          {daySlots.map((period, index) => {
            const isLast = index === daySlots.length - 1;
            const isDone = period.isMarked;
            const isNextPending = !isDone && !firstPendingFound;
            if (isNextPending) firstPendingFound = true;

            return (
              <View key={period.timetableSlotId} style={styles.periodRowWrapper}>
                <TouchableOpacity
                  activeOpacity={isDone ? 0.7 : 1}
                  onPress={() => {
                    if (isDone) onSelectPeriod?.(period);
                  }}
                  style={styles.periodRow}
                >
                  {/* Left: Period Number + Time */}
                  <View style={styles.leftCol}>
                    <Text style={styles.periodNumText}>P{period.periodNumber}</Text>
                    <Text style={styles.periodTimeText}>{period.startTime}</Text>
                  </View>

                  {/* Middle: Subject, Class, Room */}
                  <View style={styles.middleCol}>
                    <Text style={styles.subjectText} numberOfLines={1}>
                      {period.subjectName}
                    </Text>
                    <Text style={styles.classRoomText} numberOfLines={1}>
                      {period.className} · {period.room}
                    </Text>
                    {isDone ? (
                      <Text style={styles.countsText}>
                        {period.presentCount ?? 0} present, {period.absentCount ?? 0} absent
                      </Text>
                    ) : null}
                  </View>

                  {/* Right: Status Tag */}
                  <View style={styles.rightCol}>
                    <Tag
                      label={isDone ? 'Done' : 'Pending'}
                      variant={isDone ? 'done' : 'pending'}
                    />
                    {isDone ? (
                      <Text style={styles.tapToEditText}>Tap to edit</Text>
                    ) : null}
                  </View>
                </TouchableOpacity>

                {/* If next pending period, show full-width button inside row */}
                {isNextPending ? (
                  <View style={styles.markBtnWrap}>
                    <Button
                      title="Mark attendance"
                      onPress={() => onSelectPeriod?.(period)}
                      size="sm"
                    />
                  </View>
                ) : null}

                {!isLast ? <View style={styles.divider} /> : null}
              </View>
            );
          })}
        </View>
      )}

      <View style={{ height: Spacing['2xl'] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  dateLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.muted,
    letterSpacing: 1,
    marginBottom: 2,
  },
  heading: {
    fontFamily: Fonts.heading,
    fontSize: FontSize['3xl'],
    color: Colors.ink,
    lineHeight: 38,
    marginBottom: Spacing.lg,
  },
  daySelector: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.xl,
  },
  dayPill: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.base,
    minHeight: 44,
  },
  dayPillSelected: {
    backgroundColor: Colors.brand,
    borderColor: Colors.brand,
  },
  dayLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.muted,
  },
  dayLabelSelected: {
    color: '#FFFFFF',
  },
  todayDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.brand,
    marginTop: 3,
  },
  todayDotSelected: {
    backgroundColor: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.xl,
    color: Colors.ink,
  },
  sectionCount: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.muted,
  },
  periodListCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.base,
    overflow: 'hidden',
  },
  periodRowWrapper: {
    backgroundColor: Colors.surface,
  },
  periodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 64,
  },
  leftCol: {
    width: 68,
  },
  periodNumText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.base,
    color: Colors.ink,
  },
  periodTimeText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.muted,
    marginTop: 2,
  },
  middleCol: {
    flex: 1,
    marginHorizontal: Spacing.sm,
  },
  subjectText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.base,
    color: Colors.ink,
    lineHeight: 20,
  },
  classRoomText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.muted,
    marginTop: 2,
  },
  countsText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.present,
    marginTop: 3,
  },
  rightCol: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  tapToEditText: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: Colors.muted,
    marginTop: 4,
  },
  markBtnWrap: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.line,
    marginLeft: Spacing.lg,
  },
  emptyContainer: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.base,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyTitle: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.lg,
    color: Colors.ink,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.muted,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  reloadBtn: {
    minWidth: 160,
  },
});
