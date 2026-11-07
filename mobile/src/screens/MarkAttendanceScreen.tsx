import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, Fonts } from '../constants/theme';
import { getSlotAttendance, markAttendance } from '../api/attendance';
import Button from '../components/Button';
import Input from '../components/Input';
import Sheet from '../components/Sheet';
import Tag from '../components/Tag';
import SkeletonList from '../components/Skeleton';

type AttendanceStatus = 'present' | 'absent' | 'late';

interface StudentRecord {
  id: string;
  rollNumber: string;
  name: string;
  status: AttendanceStatus | null; // null represents unmarked
}

interface Props {
  route?: {
    params?: {
      period?: {
        periodNumber: number;
        subjectName: string;
        className: string;
        room: string;
        startTime: string;
        endTime: string;
        timetableSlotId?: string;
        classId?: string;
      };
    };
  };
  navigation?: any;
}

export default function MarkAttendanceScreen({ route, navigation }: Props) {
  const period = route?.params?.period || {
    periodNumber: 1,
    subjectName: 'General Subject',
    className: 'Class',
    room: 'Room',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
  };

  const timetableSlotId = period.timetableSlotId;
  const todayYMD = new Date().toISOString().split('T')[0];

  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmSheetVisible, setConfirmSheetVisible] = useState(false);

  // Undo snackbar state
  const [undoSnapshot, setUndoSnapshot] = useState<StudentRecord[] | null>(null);
  const [showUndoSnackbar, setShowUndoSnackbar] = useState(false);
  const undoTimeoutRef = useRef<any>(null);

  const fetchAttendance = () => {
    if (!timetableSlotId) {
      setError('Timetable slot information is missing.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    getSlotAttendance(timetableSlotId, todayYMD)
      .then((res) => {
        if (res.data?.isMarked && res.data.records?.length > 0) {
          const mapped: StudentRecord[] = res.data.records.map((r: any, idx: number) => ({
            id: r.studentId?._id || r.studentId?.id || r.studentId || String(idx),
            rollNumber: String(r.studentId?.rollNumber ?? idx + 1).padStart(2, '0'),
            name: r.studentId?.name || `Student ${idx + 1}`,
            status: (r.status === 'half_day' || r.status === 'late' ? 'late' : r.status) as AttendanceStatus,
          }));
          setStudents(mapped);
        } else if (res.data?.enrolledStudents && res.data.enrolledStudents.length > 0) {
          const mapped: StudentRecord[] = res.data.enrolledStudents.map((s: any, idx: number) => ({
            id: s._id || s.id || String(idx),
            rollNumber: String(s.rollNumber ?? idx + 1).padStart(2, '0'),
            name: s.name || `Student ${idx + 1}`,
            status: null, // Unmarked initially
          }));
          setStudents(mapped);
        } else {
          // No students enrolled
          setStudents([]);
        }
      })
      .catch((err) => {
        const msg = err?.response?.data?.message || 'Could not load student roster.';
        setError(msg);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAttendance();
  }, [timetableSlotId, todayYMD]);

  // Clean up timer
  useEffect(() => {
    return () => {
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    };
  }, []);

  const totalCount = students.length;
  const presentCount = students.filter((s) => s.status === 'present').length;
  const absentCount = students.filter((s) => s.status === 'absent').length;
  const lateCount = students.filter((s) => s.status === 'late').length;
  const markedCount = students.filter((s) => s.status !== null).length;
  const unmarkedCount = totalCount - markedCount;
  const isAllMarked = totalCount > 0 && unmarkedCount === 0;

  const setStatus = (id: string, status: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  // Tapping a student row cycles: unmarked (null) -> present -> late -> absent -> present
  const cycleStatus = (id: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        if (s.status === null) return { ...s, status: 'present' };
        if (s.status === 'present') return { ...s, status: 'late' };
        if (s.status === 'late') return { ...s, status: 'absent' };
        return { ...s, status: 'present' };
      })
    );
  };

  const handleAllPresent = () => {
    setUndoSnapshot([...students]);
    setStudents((prev) => prev.map((s) => ({ ...s, status: 'present' })));
    setShowUndoSnackbar(true);

    if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    undoTimeoutRef.current = setTimeout(() => {
      setShowUndoSnackbar(false);
      setUndoSnapshot(null);
    }, 5000);
  };

  const handleUndo = () => {
    if (undoSnapshot) {
      setStudents(undoSnapshot);
      setShowUndoSnackbar(false);
      setUndoSnapshot(null);
      if (undoTimeoutRef.current) clearTimeout(undoTimeoutRef.current);
    }
  };

  const handleOpenConfirm = () => {
    if (!isAllMarked) return;
    setConfirmSheetVisible(true);
  };

  const handleFinalSubmit = async () => {
    if (!timetableSlotId) return;
    setSubmitting(true);
    try {
      const recordsPayload = students.map((s) => ({
        studentId: s.id,
        status: (s.status === 'late' ? 'half_day' : s.status || 'absent') as any,
      }));

      await markAttendance({
        timetableSlotId,
        date: todayYMD,
        remarks: remarks.trim() || undefined,
        records: recordsPayload,
      });

      setConfirmSheetVisible(false);
      Alert.alert(
        'Attendance Recorded',
        `Attendance saved: ${presentCount} present, ${absentCount} absent, ${lateCount} late.`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (navigation?.goBack) navigation.goBack();
            },
          },
        ]
      );
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to submit attendance.';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.includes(searchQuery)
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation?.goBack?.()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={20} color={Colors.ink} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Mark Attendance</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              P{period.periodNumber} · {period.startTime}–{period.endTime} · {period.subjectName}
            </Text>
            <Text style={styles.headerClassSubtitle} numberOfLines={1}>
              {period.className} · {period.room}
            </Text>
          </View>
          <View style={{ width: 36 }} />
        </View>

        {/* Live Progress Banner */}
        <View style={styles.progressBanner}>
          <View style={styles.progressTopRow}>
            <Text style={styles.progressCountText}>
              {markedCount} of {totalCount} marked
            </Text>
            <View style={styles.liveBadgesRow}>
              <Tag label={`${presentCount} P`} variant="present" />
              <Tag label={`${lateCount} L`} variant="late" />
              <Tag label={`${absentCount} A`} variant="absent" />
            </View>
          </View>

          {/* Action Row: Search & All Present */}
          <View style={styles.filterRow}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={16} color={Colors.muted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search name or roll no..."
                placeholderTextColor={Colors.muted}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery ? (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={16} color={Colors.muted} />
                </TouchableOpacity>
              ) : null}
            </View>

            <TouchableOpacity
              style={styles.allPresentBtn}
              onPress={handleAllPresent}
              activeOpacity={0.7}
            >
              <Text style={styles.allPresentText}>All present</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Undo Snackbar */}
        {showUndoSnackbar ? (
          <View style={styles.snackbar}>
            <Text style={styles.snackbarText}>All marked present</Text>
            <TouchableOpacity onPress={handleUndo} style={styles.undoBtn}>
              <Text style={styles.undoText}>UNDO</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Content list / Skeleton / Error */}
        {loading ? (
          <View style={styles.padded}>
            <SkeletonList count={6} />
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={36} color={Colors.absent} />
            <Text style={styles.errorTitle}>Unable to load students</Text>
            <Text style={styles.errorSub}>{error}</Text>
            <Button
              title="Retry"
              onPress={fetchAttendance}
              variant="outline"
              size="sm"
              style={styles.retryBtn}
            />
          </View>
        ) : students.length === 0 ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>No students enrolled</Text>
            <Text style={styles.errorSub}>
              There are no students assigned to this class.
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.studentList}
            contentContainerStyle={styles.studentListContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.rosterCard}>
              {filteredStudents.map((student, index) => {
                const isLast = index === filteredStudents.length - 1;
                const isP = student.status === 'present';
                const isL = student.status === 'late';
                const isA = student.status === 'absent';

                return (
                  <View key={student.id}>
                    <TouchableOpacity
                      style={styles.studentRow}
                      activeOpacity={0.7}
                      onPress={() => cycleStatus(student.id)}
                    >
                      {/* Left: Roll and Name */}
                      <View style={styles.studentInfo}>
                        <Text style={styles.rollNumber}>{student.rollNumber}</Text>
                        <Text style={styles.studentName} numberOfLines={1}>
                          {student.name}
                        </Text>
                      </View>

                      {/* Right: 44px P / L / A segmented buttons */}
                      <View style={styles.statusButtonsGroup}>
                        <TouchableOpacity
                          style={[
                            styles.statusBtn,
                            isP && styles.statusBtnPresent,
                          ]}
                          onPress={() => setStatus(student.id, 'present')}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.statusBtnText,
                              isP && styles.statusBtnTextActive,
                            ]}
                          >
                            P
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.statusBtn,
                            isL && styles.statusBtnLate,
                          ]}
                          onPress={() => setStatus(student.id, 'late')}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.statusBtnText,
                              isL && styles.statusBtnTextActive,
                            ]}
                          >
                            L
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={[
                            styles.statusBtn,
                            isA && styles.statusBtnAbsent,
                          ]}
                          onPress={() => setStatus(student.id, 'absent')}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.statusBtnText,
                              isA && styles.statusBtnTextActive,
                            ]}
                          >
                            A
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>

                    {!isLast ? <View style={styles.rowDivider} /> : null}
                  </View>
                );
              })}
            </View>
            <View style={{ height: 120 }} />
          </ScrollView>
        )}

        {/* Sticky Bottom Bar */}
        <View style={styles.stickyFooter}>
          <Button
            title={
              isAllMarked
                ? 'Review & Submit'
                : `Mark ${unmarkedCount} more to submit`
            }
            onPress={handleOpenConfirm}
            disabled={!isAllMarked}
            disabledReason={
              !isAllMarked
                ? `Every student must be marked (${unmarkedCount} remaining)`
                : undefined
            }
          />
        </View>

        {/* Confirm Bottom Sheet with remarks */}
        <Sheet
          visible={confirmSheetVisible}
          onClose={() => setConfirmSheetVisible(false)}
          title="Confirm Attendance"
          subtitle={`P${period.periodNumber} · ${period.subjectName}`}
        >
          <View style={styles.confirmContent}>
            {/* Counts summary */}
            <View style={styles.confirmStatsRow}>
              <View style={styles.confirmStatItem}>
                <Text style={styles.confirmStatValue}>{totalCount}</Text>
                <Text style={styles.confirmStatLabel}>TOTAL</Text>
              </View>
              <View style={styles.confirmStatItem}>
                <Text style={[styles.confirmStatValue, { color: Colors.present }]}>
                  {presentCount}
                </Text>
                <Text style={styles.confirmStatLabel}>PRESENT</Text>
              </View>
              <View style={styles.confirmStatItem}>
                <Text style={[styles.confirmStatValue, { color: Colors.late }]}>
                  {lateCount}
                </Text>
                <Text style={styles.confirmStatLabel}>LATE</Text>
              </View>
              <View style={styles.confirmStatItem}>
                <Text style={[styles.confirmStatValue, { color: Colors.absent }]}>
                  {absentCount}
                </Text>
                <Text style={styles.confirmStatLabel}>ABSENT</Text>
              </View>
            </View>

            {/* Remarks field */}
            <Input
              label="Lecture notes / remarks (optional)"
              placeholder="e.g. Covered Binary Search Trees Chapter 3"
              value={remarks}
              onChangeText={setRemarks}
              multiline
              numberOfLines={3}
              inputStyle={{ minHeight: 70, textAlignVertical: 'top' }}
            />

            <Button
              title="Confirm and Save"
              onPress={handleFinalSubmit}
              loading={submitting}
            />
          </View>
        </Sheet>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: Radius.base,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    marginHorizontal: Spacing.md,
  },
  headerTitle: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.lg,
    color: Colors.ink,
  },
  headerSubtitle: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.muted,
    marginTop: 1,
  },
  headerClassSubtitle: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.muted,
  },
  progressBanner: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  progressTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressCountText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.sm,
    color: Colors.ink,
  },
  liveBadgesRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: Radius.base,
    borderWidth: 1,
    borderColor: Colors.line,
    paddingHorizontal: Spacing.sm,
    height: 38,
    gap: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.ink,
    paddingVertical: 0,
  },
  allPresentBtn: {
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.base,
    paddingHorizontal: Spacing.md,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  allPresentText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.brand,
  },
  snackbar: {
    backgroundColor: Colors.ink,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
  },
  snackbarText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: '#FFFFFF',
  },
  undoBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
  },
  undoText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: '#FAD98D',
  },
  padded: {
    padding: Spacing.xl,
  },
  studentList: {
    flex: 1,
  },
  studentListContent: {
    padding: Spacing.xl,
  },
  rosterCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.base,
    overflow: 'hidden',
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    minHeight: 52,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
    gap: Spacing.md,
  },
  rollNumber: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.muted,
    width: 24,
  },
  studentName: {
    fontFamily: Fonts.body,
    fontSize: FontSize.base,
    color: Colors.ink,
    flex: 1,
  },
  statusButtonsGroup: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.base,
    overflow: 'hidden',
  },
  statusBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderLeftWidth: 1,
    borderLeftColor: Colors.line,
  },
  statusBtnPresent: {
    backgroundColor: Colors.present,
    borderColor: Colors.present,
  },
  statusBtnLate: {
    backgroundColor: Colors.late,
    borderColor: Colors.late,
  },
  statusBtnAbsent: {
    backgroundColor: Colors.absent,
    borderColor: Colors.absent,
  },
  statusBtnText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.sm,
    color: Colors.muted,
  },
  statusBtnTextActive: {
    color: '#FFFFFF',
  },
  rowDivider: {
    height: 1,
    backgroundColor: Colors.line,
    marginLeft: Spacing.lg,
  },
  errorContainer: {
    padding: Spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorTitle: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.lg,
    color: Colors.ink,
    marginTop: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  errorSub: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.muted,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  retryBtn: {
    minWidth: 120,
  },
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.line,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 24 : Spacing.md,
  },
  confirmContent: {
    gap: Spacing.md,
  },
  confirmStatsRow: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.base,
    paddingVertical: Spacing.md,
  },
  confirmStatItem: {
    flex: 1,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: Colors.line,
  },
  confirmStatValue: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.xl,
    color: Colors.ink,
  },
  confirmStatLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: 10,
    color: Colors.muted,
    marginTop: 2,
    letterSpacing: 0.5,
  },
});
