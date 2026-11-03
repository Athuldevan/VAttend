import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, Fonts } from '../constants/theme';
import { getSlotAttendance, markAttendance } from '../api/attendance';

type AttendanceStatus = 'present' | 'absent' | 'late';

interface StudentRecord {
  id: string;
  rollNumber: string;
  name: string;
  status: AttendanceStatus;
}

const initialStudents: StudentRecord[] = [
  { id: '1', rollNumber: '01', name: 'Aadhya Sharma', status: 'present' },
  { id: '2', rollNumber: '02', name: 'Akhil Raj', status: 'present' },
  { id: '3', rollNumber: '03', name: 'Anjali S', status: 'present' },
  { id: '4', rollNumber: '04', name: 'Devanathan K', status: 'absent' },
  { id: '5', rollNumber: '05', name: 'Fathima N', status: 'present' },
  { id: '6', rollNumber: '06', name: 'Gautham M', status: 'present' },
  { id: '7', rollNumber: '07', name: 'Haritha V', status: 'late' },
  { id: '8', rollNumber: '08', name: 'Karthik Menon', status: 'present' },
  { id: '9', rollNumber: '09', name: 'Muhammed Rafi', status: 'absent' },
  { id: '10', rollNumber: '10', name: 'Nandana P', status: 'present' },
  { id: '11', rollNumber: '11', name: 'Rahul Kumar', status: 'present' },
  { id: '12', rollNumber: '12', name: 'Sneha Mohan', status: 'present' },
];

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
    periodNumber: 2,
    subjectName: 'Data Structures & Algorithms',
    className: '1st Year B.Sc CS',
    room: 'Lab 2',
    startTime: '10:00 AM',
    endTime: '11:00 AM',
  };

  const timetableSlotId = period.timetableSlotId;
  const todayYMD = new Date().toISOString().split('T')[0];

  const [students, setStudents] = useState<StudentRecord[]>(initialStudents);
  const [loading, setLoading] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (timetableSlotId && !timetableSlotId.startsWith('slot-mock')) {
      setLoading(true);
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
          } else if (res.data?.enrolledStudents?.length > 0) {
            const mapped: StudentRecord[] = res.data.enrolledStudents.map((s: any, idx: number) => ({
              id: s._id || s.id || String(idx),
              rollNumber: String(s.rollNumber ?? idx + 1).padStart(2, '0'),
              name: s.name || `Student ${idx + 1}`,
              status: 'present' as AttendanceStatus,
            }));
            setStudents(mapped);
          }
        })
        .catch(() => {
          // Keep default mock students if offline or error
        })
        .finally(() => setLoading(false));
    }
  }, [timetableSlotId, todayYMD]);

  const presentCount = students.filter((s) => s.status === 'present').length;
  const absentCount = students.filter((s) => s.status === 'absent').length;
  const lateCount = students.filter((s) => s.status === 'late').length;
  const totalCount = students.length;

  const setStatus = (id: string, status: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status } : s))
    );
  };

  const markAll = (status: AttendanceStatus) => {
    setStudents((prev) => prev.map((s) => ({ ...s, status })));
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      if (timetableSlotId && !timetableSlotId.startsWith('slot-mock')) {
        const recordsPayload = students.map((s) => ({
          studentId: s.id,
          status: (s.status === 'late' ? 'half_day' : s.status) as any,
        }));
        await markAttendance({
          timetableSlotId,
          date: todayYMD,
          records: recordsPayload,
        });
      }
      Alert.alert(
        'Attendance Recorded',
        `Successfully marked attendance for Period ${period.periodNumber}: ${presentCount} Present, ${absentCount} Absent, ${lateCount} Late.`,
        [
          {
            text: 'OK',
            onPress: () => {
              if (navigation?.goBack) {
                navigation.goBack();
              }
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
        {/* Header Bar */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation?.goBack?.()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Mark Attendance</Text>
            <Text style={styles.headerSubtitle}>
              Period {period.periodNumber} · {period.startTime} - {period.endTime}
            </Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        {/* Period Details Card */}
        <View style={styles.periodBanner}>
          <View style={styles.periodHeaderRow}>
            <Text style={styles.periodSubject}>{period.subjectName}</Text>
            <View style={styles.roomBadge}>
              <Ionicons name="location-outline" size={13} color={Colors.primary} />
              <Text style={styles.roomText}>{period.room}</Text>
            </View>
          </View>
          <Text style={styles.periodClass}>{period.className}</Text>

          {/* Quick Stats Summary */}
          <View style={styles.statsSummaryRow}>
            <View style={[styles.statChip, { backgroundColor: Colors.surface }]}>
              <Text style={styles.statChipLabel}>Total</Text>
              <Text style={styles.statChipVal}>{totalCount}</Text>
            </View>
            <View style={[styles.statChip, { backgroundColor: Colors.successBg }]}>
              <Text style={[styles.statChipLabel, { color: Colors.success }]}>Present</Text>
              <Text style={[styles.statChipVal, { color: Colors.success }]}>{presentCount}</Text>
            </View>
            <View style={[styles.statChip, { backgroundColor: Colors.errorBg }]}>
              <Text style={[styles.statChipLabel, { color: Colors.error }]}>Absent</Text>
              <Text style={[styles.statChipVal, { color: Colors.error }]}>{absentCount}</Text>
            </View>
            <View style={[styles.statChip, { backgroundColor: Colors.warningBg }]}>
              <Text style={[styles.statChipLabel, { color: Colors.warning }]}>Late</Text>
              <Text style={[styles.statChipVal, { color: Colors.warning }]}>{lateCount}</Text>
            </View>
          </View>
        </View>

        {/* Action Bar: Quick Mark + Search */}
        <View style={styles.actionBar}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={16} color={Colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search student or roll no..."
              placeholderTextColor={Colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={16} color={Colors.textTertiary} />
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.quickMarkGroup}>
            <TouchableOpacity
              style={[styles.quickMarkBtn, { borderColor: Colors.success }]}
              onPress={() => markAll('present')}
            >
              <Ionicons name="checkmark-done" size={14} color={Colors.success} />
              <Text style={[styles.quickMarkText, { color: Colors.success }]}>All Present</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.quickMarkBtn, { borderColor: Colors.error }]}
              onPress={() => markAll('absent')}
            >
              <Ionicons name="close" size={14} color={Colors.error} />
              <Text style={[styles.quickMarkText, { color: Colors.error }]}>All Absent</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Students List */}
        <ScrollView
          style={styles.studentList}
          contentContainerStyle={styles.studentListContent}
          showsVerticalScrollIndicator={false}
        >
          {loading && (
            <View style={{ paddingVertical: Spacing.lg, alignItems: 'center' }}>
              <ActivityIndicator size="small" color={Colors.primary} />
              <Text style={{ fontSize: FontSize.xs, color: Colors.textSecondary, marginTop: 4 }}>
                Loading attendance & students...
              </Text>
            </View>
          )}
          {filteredStudents.map((student) => {
            const isPresent = student.status === 'present';
            const isAbsent = student.status === 'absent';
            const isLate = student.status === 'late';

            return (
              <View key={student.id} style={styles.studentRow}>
                <View style={styles.studentInfo}>
                  <View style={styles.rollCircle}>
                    <Text style={styles.rollText}>{student.rollNumber}</Text>
                  </View>
                  <Text style={styles.studentName} numberOfLines={1}>
                    {student.name}
                  </Text>
                </View>

                {/* Status Toggle Buttons */}
                <View style={styles.toggleGroup}>
                  <TouchableOpacity
                    style={[
                      styles.toggleBtn,
                      isPresent && styles.togglePresentActive,
                    ]}
                    onPress={() => setStatus(student.id, 'present')}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        isPresent && styles.toggleTextActive,
                      ]}
                    >
                      P
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.toggleBtn,
                      isLate && styles.toggleLateActive,
                    ]}
                    onPress={() => setStatus(student.id, 'late')}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        isLate && styles.toggleTextActive,
                      ]}
                    >
                      L
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.toggleBtn,
                      isAbsent && styles.toggleAbsentActive,
                    ]}
                    onPress={() => setStatus(student.id, 'absent')}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.toggleText,
                        isAbsent && styles.toggleTextActive,
                      ]}
                    >
                      A
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}

          {/* Remarks Section */}
          <View style={styles.remarksSection}>
            <Text style={styles.remarksLabel}>Lecture Notes / Remarks (Optional)</Text>
            <TextInput
              style={styles.remarksInput}
              placeholder="e.g. Covered Chapter 4 Binary Search Trees..."
              placeholderTextColor={Colors.textTertiary}
              value={remarks}
              onChangeText={setRemarks}
              multiline
              numberOfLines={2}
            />
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Floating Submit Bottom Bar */}
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={[styles.saveButton, submitting && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={submitting}
            activeOpacity={0.85}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.textInverse} size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-done" size={20} color={Colors.textInverse} />
                <Text style={styles.saveButtonText}>Submit Attendance</Text>
              </>
            )}
          </TouchableOpacity>
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
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    backgroundColor: Colors.backgroundAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FontSize.lg,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  periodBanner: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  periodHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  periodSubject: {
    fontSize: FontSize.base,
    fontFamily: Fonts.bold,
    color: Colors.text,
    flex: 1,
  },
  roomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryMuted,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    gap: 4,
  },
  roomText: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.semibold,
    color: Colors.primaryDark,
  },
  periodClass: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statsSummaryRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  statChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  statChipLabel: {
    fontSize: FontSize.xs - 1,
    fontFamily: Fonts.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
  },
  statChipVal: {
    fontSize: FontSize.base,
    fontFamily: Fonts.extrabold,
    color: Colors.text,
    marginTop: 2,
  },
  actionBar: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    gap: Spacing.sm,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? Spacing.sm : 2,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.sm,
    fontFamily: Fonts.regular,
    color: Colors.text,
  },
  quickMarkGroup: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  quickMarkBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  quickMarkText: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.semibold,
  },
  studentList: {
    flex: 1,
    marginTop: Spacing.md,
  },
  studentListContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing['3xl'],
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.md,
  },
  rollCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  rollText: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.bold,
    color: Colors.primaryDark,
  },
  studentName: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.semibold,
    color: Colors.text,
    flex: 1,
  },
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundAlt,
    borderRadius: Radius.md,
    padding: 3,
    gap: 3,
  },
  toggleBtn: {
    width: 34,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.sm,
  },
  toggleText: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.bold,
    color: Colors.textSecondary,
  },
  togglePresentActive: {
    backgroundColor: Colors.success,
  },
  toggleAbsentActive: {
    backgroundColor: Colors.error,
  },
  toggleLateActive: {
    backgroundColor: Colors.warning,
  },
  toggleTextActive: {
    color: Colors.textInverse,
  },
  remarksSection: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.md,
  },
  remarksLabel: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  remarksInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: FontSize.sm,
    fontFamily: Fonts.regular,
    color: Colors.text,
    minHeight: 60,
    textAlignVertical: 'top',
    backgroundColor: Colors.backgroundAlt,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.full,
    gap: Spacing.sm,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: FontSize.base,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
});

