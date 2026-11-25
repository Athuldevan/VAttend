import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, Fonts } from '../constants/theme';
import {
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  type ClassItem,
  type CreateClassPayload,
} from '../api/classes';
import { getDepartments, type Department } from '../api/departments';
import { getPrograms, type Program } from '../api/programs';
import {
  getClassTimetable,
  createTimetable,
  deleteTimetable,
  updateTimetable,
  type TimetableSlot,
} from '../api/timetable';
import { getTeachers, type TeacherOption } from '../api/users';
import { getSubjects, type SubjectOption } from '../api/subjects';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import TimeField from '../components/TimeField';
import Sheet from '../components/Sheet';
import Tag from '../components/Tag';
import SkeletonList from '../components/Skeleton';

const currentAcademicYear = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const start = m >= 5 ? y : y - 1;
  return `${start}-${String(start + 1).slice(-2)}`;
};

const DAYS_OF_WEEK = [
  { day: 1, label: 'Mon', full: 'Monday' },
  { day: 2, label: 'Tue', full: 'Tuesday' },
  { day: 3, label: 'Wed', full: 'Wednesday' },
  { day: 4, label: 'Thu', full: 'Thursday' },
  { day: 5, label: 'Fri', full: 'Friday' },
];

const timeToMinutes = (time: string): number | null => {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
};

const minutesToTime = (minutes: number): string => {
  const normalized = ((minutes % 1440) + 1440) % 1440;
  return `${String(Math.floor(normalized / 60)).padStart(2, '0')}:${String(normalized % 60).padStart(2, '0')}`;
};

const suggestedPeriodTimes = (period: number, slots: TimetableSlot[]) => {
  const previousSlot = slots.find((slot) => slot.period === period - 1);
  const previousStart = previousSlot ? timeToMinutes(previousSlot.startTime) : null;
  const previousEnd = previousSlot ? timeToMinutes(previousSlot.endTime) : null;

  if (previousStart !== null && previousEnd !== null && previousEnd > previousStart) {
    const duration = previousEnd - previousStart;
    return {
      startTime: minutesToTime(previousEnd),
      endTime: minutesToTime(previousEnd + duration),
    };
  }

  const start = 9 * 60 + (period - 1) * 60;
  return { startTime: minutesToTime(start), endTime: minutesToTime(start + 60) };
};

export default function ClassesScreen() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sheet states
  const [classSheetVisible, setClassSheetVisible] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);

  const [timetableSheetVisible, setTimetableSheetVisible] = useState(false);
  const [selectedClassForTimetable, setSelectedClassForTimetable] = useState<ClassItem | null>(null);

  const [addPeriodSheetVisible, setAddPeriodSheetVisible] = useState(false);

  // Form states for class
  const [formDepartmentId, setFormDepartmentId] = useState('');
  const [formProgramId, setFormProgramId] = useState('');
  const [formYear, setFormYear] = useState(1);
  const [formSemester, setFormSemester] = useState(1);
  const [formAcademicYear, setFormAcademicYear] = useState(currentAcademicYear());
  const [classFormSubmitting, setClassFormSubmitting] = useState(false);
  const [classFormError, setClassFormError] = useState<string | null>(null);

  // Timetable slot states
  const [selectedDay, setSelectedDay] = useState(1);
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [timetableLoading, setTimetableLoading] = useState(false);
  const [timetableError, setTimetableError] = useState<string | null>(null);

  // Add period form states
  const [addPeriod, setAddPeriod] = useState(1);
  const [addStartTime, setAddStartTime] = useState('09:00');
  const [addEndTime, setAddEndTime] = useState('10:00');
  const [addSubject, setAddSubject] = useState('');
  const [addTeacher, setAddTeacher] = useState('');
  const [availableTeachers, setAvailableTeachers] = useState<TeacherOption[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<SubjectOption[]>([]);
  const [savingSlot, setSavingSlot] = useState(false);
  const [addSlotError, setAddSlotError] = useState<string | null>(null);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);

  const isHOD = user?.role === 'ADMIN' || user?.role === 'TEACHER';

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const [classesRes, programsRes, deptsRes] = await Promise.all([
        getClasses(),
        getPrograms().catch(() => ({ data: [] })),
        getDepartments().catch(() => ({ data: [] })),
      ]);
      setClasses(classesRes.data || []);
      setPrograms(programsRes.data || []);
      setDepartments(deptsRes.data || []);
    } catch (err: any) {
      setError(err?.message || 'Failed to load classes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  const programNameMap = new Map<string, string>();
  programs.forEach((p) => programNameMap.set(p.id, p.name));

  // Open New / Edit Class Sheet
  const handleOpenNewClass = () => {
    setEditingClass(null);
    setFormDepartmentId(user?.departmentId || (departments[0]?.id ?? ''));
    setFormYear(1);
    setFormSemester(1);
    setFormAcademicYear(currentAcademicYear());
    setClassFormError(null);
    setClassSheetVisible(true);
  };

  const handleOpenEditClass = (cls: ClassItem) => {
    setEditingClass(cls);
    setFormDepartmentId(cls.departmentId || user?.departmentId || '');
    setFormYear(cls.year);
    setFormSemester(cls.currentSemester);
    setFormAcademicYear(cls.academicYear);
    setClassFormError(null);
    setClassSheetVisible(true);
  };

  const handleSaveClass = async () => {
    if (!formDepartmentId) {
      setClassFormError('Please select a department.');
      return;
    }
    if (!formAcademicYear.trim()) {
      setClassFormError('Academic year is required.');
      return;
    }
    setClassFormSubmitting(true);
    setClassFormError(null);
    try {
      const payload: CreateClassPayload = {
        departmentId: formDepartmentId.trim(),
        year: formYear,
        academicYear: formAcademicYear.trim(),
        currentSemester: formSemester,
      };

      if (editingClass) {
        await updateClass(editingClass.id, payload);
      } else {
        await createClass(payload);
      }
      setClassSheetVisible(false);
      fetchData();
    } catch (err: any) {
      setClassFormError(
        err?.response?.data?.message || 'Failed to save class. Please try again.'
      );
    } finally {
      setClassFormSubmitting(false);
    }
  };

  const handleDeleteClass = () => {
    if (!editingClass) return;
    Alert.alert(
      'Delete Class',
      `Are you sure you want to delete this class? This will also remove its timetable.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteClass(editingClass.id);
              setClassSheetVisible(false);
              fetchData();
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || 'Could not delete class');
            }
          },
        },
      ]
    );
  };

  // Timetable
  const loadTimetableForClass = useCallback(async (cls: ClassItem) => {
    setTimetableLoading(true);
    setTimetableError(null);
    try {
      const res = await getClassTimetable(cls.id, cls.currentSemester);
      setSlots(res.data || []);
    } catch (err: any) {
      // Never fall through silently: an empty list here would show free periods
      // that are actually taken, and saving them fails on the server.
      setSlots([]);
      setTimetableError(
        err?.response?.data?.message || 'Could not load this timetable. Pull to retry.',
      );
    } finally {
      setTimetableLoading(false);
    }
  }, []);

  const handleOpenTimetable = (cls: ClassItem) => {
    setSelectedClassForTimetable(cls);
    setSelectedDay(1);
    setTimetableSheetVisible(true);
    loadTimetableForClass(cls);

    // Fetch teachers & subjects for Add Period
    Promise.all([
      getTeachers().catch(() => ({ data: [] })),
      getSubjects(cls.currentSemester).catch(() => ({ data: [] })),
    ]).then(([tRes, sRes]) => {
      setAvailableTeachers(tRes.data || []);
      setAvailableSubjects(sRes.data || []);
    });
  };

  const handleOpenAddPeriod = () => {
    setEditingSlot(null);
    const firstAvailablePeriod = [1, 2, 3, 4, 5, 6, 7, 8].find(
      (period) => !daySlots.some((slot) => slot.period === period),
    );
    const period = firstAvailablePeriod ?? 1;
    const { startTime, endTime } = suggestedPeriodTimes(period, daySlots);
    setAddPeriod(period);
    setAddStartTime(startTime);
    setAddEndTime(endTime);
    setAddSubject(availableSubjects[0]?.id || '');
    setAddTeacher(availableTeachers[0]?.id || '');
    setAddSlotError(null);
    setAddPeriodSheetVisible(true);
  };

  const handleOpenEditPeriod = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setAddPeriod(slot.period);
    setAddStartTime(slot.startTime);
    setAddEndTime(slot.endTime);
    setAddSubject(typeof slot.subject === 'object' ? (slot.subject.id || slot.subject._id || '') : slot.subject);
    setAddTeacher(typeof slot.teacher === 'object' ? (slot.teacher.id || slot.teacher._id || '') : slot.teacher);
    setAddSlotError(null);
    setAddPeriodSheetVisible(true);
  };

  const handleSavePeriod = async () => {
    if (!selectedClassForTimetable) return;
    if (!addSubject) {
      setAddSlotError('Please choose a subject.');
      return;
    }
    if (!addTeacher) {
      setAddSlotError('Please choose a teacher.');
      return;
    }
    const startMinutes = timeToMinutes(addStartTime);
    const endMinutes = timeToMinutes(addEndTime);
    if (startMinutes === null || endMinutes === null) {
      setAddSlotError('Please set a valid start and end time.');
      return;
    }
    if (endMinutes <= startMinutes) {
      setAddSlotError('End time must be after the start time.');
      return;
    }

    setSavingSlot(true);
    setAddSlotError(null);
    try {
      const payload = {
        class: selectedClassForTimetable.id,
        semester: selectedClassForTimetable.currentSemester,
        dayOfWeek: selectedDay,
        period: addPeriod,
        startTime: minutesToTime(startMinutes),
        endTime: minutesToTime(endMinutes),
        subject: addSubject,
        teacher: addTeacher,
        department: selectedClassForTimetable.departmentId,
      };
      if (editingSlot) await updateTimetable(editingSlot.id, payload);
      else await createTimetable(payload);
      setAddPeriodSheetVisible(false);
      setEditingSlot(null);
      loadTimetableForClass(selectedClassForTimetable);
    } catch (err: any) {
      setAddSlotError(
        err?.response?.data?.message || 'Could not save slot. Check for timing conflicts.'
      );
    } finally {
      setSavingSlot(false);
    }
  };

  const handleDeleteSlot = (slot: TimetableSlot) => {
    Alert.alert('Remove Period', `Remove Period ${slot.period} from timetable?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTimetable(slot.id);
            // Remove locally first so the row disappears immediately, then
            // reload to keep the client in sync with the server.
            setSlots((current) => current.filter((item) => item.id !== slot.id));
            if (selectedClassForTimetable) {
              await loadTimetableForClass(selectedClassForTimetable);
            }
          } catch (err: any) {
            Alert.alert('Error', err?.response?.data?.message || 'Could not remove period');
          }
        },
      },
    ]);
  };

  const daySlots = slots
    .filter((s) => s.dayOfWeek === selectedDay)
    .sort((a, b) => a.period - b.period);
  const occupiedPeriods = new Set(daySlots.filter((slot) => slot.id !== editingSlot?.id).map((slot) => slot.period));

  const addStartMinutes = timeToMinutes(addStartTime);
  const addEndMinutes = timeToMinutes(addEndTime);
  const periodDurationLabel =
    addStartMinutes !== null && addEndMinutes !== null && addEndMinutes > addStartMinutes
      ? `${addEndMinutes - addStartMinutes} min`
      : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
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
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Classes</Text>
          <Text style={styles.countText}>{classes.length} registered classes</Text>
        </View>
        <Button
          title="New class"
          onPress={handleOpenNewClass}
          size="sm"
          style={styles.newClassBtn}
          icon={<Ionicons name="add" size={18} color="#FFFFFF" />}
          fullWidth={false}
        />
      </View>

      {/* Class List */}
      {loading ? (
        <SkeletonList count={5} />
      ) : error ? (
        <View style={styles.errorCard}>
          <Ionicons name="alert-circle-outline" size={32} color={Colors.absent} />
          <Text style={styles.errorTitle}>Could not load classes</Text>
          <Text style={styles.errorSub}>{error}</Text>
          <Button title="Retry" onPress={fetchData} variant="outline" size="sm" />
        </View>
      ) : classes.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No classes registered</Text>
          <Text style={styles.emptySub}>
            Classes created by the HOD will appear here.
          </Text>
          <Button
            title="Create first class"
            onPress={handleOpenNewClass}
            size="sm"
            style={styles.firstBtn}
          />
        </View>
      ) : (
        <View style={styles.listCard}>
          {classes.map((cls, idx) => {
            const isLast = idx === classes.length - 1;
            const programName =
              programNameMap.get(cls.programId) ||
              (cls.departmentName ? `${cls.departmentName} Dept` : 'General Program');

            return (
              <View key={cls.id}>
                <View style={styles.classRow}>
                  <View style={styles.classInfo}>
                    <Text style={styles.programName} numberOfLines={1}>
                      {programName}
                    </Text>
                    <Text style={styles.classMeta}>
                      Y{cls.year} · Sem {cls.currentSemester} · {cls.academicYear}
                    </Text>
                  </View>

                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={styles.timetableBtn}
                      onPress={() => handleOpenTimetable(cls)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.timetableBtnText}>Timetable</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.editBtn}
                      onPress={() => handleOpenEditClass(cls)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {!isLast ? <View style={styles.divider} /> : null}
              </View>
            );
          })}
        </View>
      )}

      {/* ─── 1. New/Edit Class Sheet ─── */}
      <Sheet
        visible={classSheetVisible}
        onClose={() => setClassSheetVisible(false)}
        title={editingClass ? 'Edit Class' : 'New Class'}
        subtitle="Manage academic class record"
      >
        <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
          {classFormError ? (
            <View style={styles.sheetErrorBox}>
              <Ionicons name="alert-circle" size={16} color={Colors.absent} />
              <Text style={styles.sheetErrorText}>{classFormError}</Text>
            </View>
          ) : null}

          <Text style={styles.fieldLabel}>DEPARTMENT</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>
            {departments.map((department) => {
              const selected = formDepartmentId === department.id;
              return <TouchableOpacity key={department.id} style={[styles.chip, selected && styles.chipActive]} onPress={() => setFormDepartmentId(department.id)}><Text style={[styles.chipText, selected && styles.chipTextActive]}>{department.code || department.name}</Text></TouchableOpacity>;
            })}
          </ScrollView>
          {user?.departmentId && formDepartmentId && formDepartmentId !== user.departmentId ? (
            <Text style={styles.selectorHint}>
              This class will belong to another department, so it will not appear in your
              classes list.
            </Text>
          ) : null}

          {/* Year selector */}
          <Text style={styles.fieldLabel}>YEAR</Text>
          <Text style={styles.selectorHint}>Choose the current year of this class.</Text>
          <View style={styles.yearGrid}>
            {[1, 2, 3, 4, 5].map((y) => {
              const selected = formYear === y;
              return (
                <TouchableOpacity
                  key={y}
                  style={[styles.yearOption, selected && styles.pillActive]}
                  onPress={() => setFormYear(y)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.yearNumber, selected && styles.pillTextActive]}>
                    {y}
                  </Text>
                  <Text style={[styles.yearLabel, selected && styles.pillTextActive]}>
                    {y === 1 ? '1st year' : y === 2 ? '2nd year' : y === 3 ? '3rd year' : `${y}th year`}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Semester selector */}
          <Text style={styles.fieldLabel}>SEMESTER</Text>
          <Text style={styles.selectorHint}>Current selection: Semester {formSemester}</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipScroll}
          >
            {Array.from({ length: 8 }, (_, i) => i + 1).map((s) => {
              const selected = formSemester === s;
              return (
                <TouchableOpacity
                  key={s}
                  style={[styles.semesterOption, selected && styles.pillActive]}
                  onPress={() => setFormSemester(s)}
                  activeOpacity={0.75}
                >
                  <Text style={[styles.pillText, selected && styles.pillTextActive]}>
                    Sem {s}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Academic Year */}
          <Input
            label="Academic year"
            value={formAcademicYear}
            onChangeText={setFormAcademicYear}
            placeholder="e.g. 2026-27"
          />

          <View style={styles.sheetActionRow}>
            <Button
              title={editingClass ? 'Save Changes' : 'Create Class'}
              onPress={handleSaveClass}
              loading={classFormSubmitting}
            />

            {editingClass ? (
              <TouchableOpacity
                style={styles.deleteLink}
                onPress={handleDeleteClass}
                activeOpacity={0.7}
              >
                <Text style={styles.deleteLinkText}>Delete Class</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </ScrollView>
      </Sheet>

      {/* ─── 2. Class Timetable Sheet ─── */}
      <Sheet
        visible={timetableSheetVisible}
        onClose={() => setTimetableSheetVisible(false)}
        title="Class Timetable"
        subtitle={
          selectedClassForTimetable
            ? `${programNameMap.get(selectedClassForTimetable.programId) || 'Class'} · Sem ${selectedClassForTimetable.currentSemester}`
            : ''
        }
      >
        <View style={styles.timetableSheetBody}>
          {/* Day Tabs Mon-Fri */}
          <View style={styles.dayTabs}>
            {DAYS_OF_WEEK.map((d) => {
              const active = selectedDay === d.day;
              return (
                <TouchableOpacity
                  key={d.day}
                  style={[styles.dayTab, active && styles.dayTabActive]}
                  onPress={() => setSelectedDay(d.day)}
                >
                  <Text style={[styles.dayTabText, active && styles.dayTabTextActive]}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.dayStatsRow}>
            <Text style={styles.periodsCountLabel}>
              {daySlots.length} periods on{' '}
              {DAYS_OF_WEEK.find((d) => d.day === selectedDay)?.full}
            </Text>
            <TouchableOpacity
              style={[styles.addPeriodOutlineBtn, Boolean(timetableError) && styles.pillUnavailable]}
              onPress={handleOpenAddPeriod}
              activeOpacity={0.7}
              disabled={timetableLoading || Boolean(timetableError)}
            >
              <Ionicons
                name="add"
                size={16}
                color={timetableError ? Colors.muted : Colors.brand}
              />
              <Text
                style={[
                  styles.addPeriodOutlineText,
                  Boolean(timetableError) && styles.pillTextUnavailable,
                ]}
              >
                Add period
              </Text>
            </TouchableOpacity>
          </View>

          {/* Slots list */}
          {timetableLoading ? (
            <ActivityIndicator size="small" color={Colors.brand} style={{ margin: 20 }} />
          ) : timetableError ? (
            <View style={styles.sheetErrorBox}>
              <Ionicons name="alert-circle" size={16} color={Colors.absent} />
              <Text style={styles.sheetErrorText}>{timetableError}</Text>
              <TouchableOpacity
                onPress={() =>
                  selectedClassForTimetable &&
                  loadTimetableForClass(selectedClassForTimetable)
                }
                activeOpacity={0.7}
              >
                <Text style={styles.addPeriodOutlineText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : daySlots.length === 0 ? (
            <View style={styles.emptyDayBox}>
              <Text style={styles.emptyDayText}>
                No periods scheduled on this day.
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.slotsScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.slotsCard}>
                {daySlots.map((slot, sIdx) => {
                  const isLastSlot = sIdx === daySlots.length - 1;
                  const subjectName =
                    typeof slot.subject === 'object'
                      ? slot.subject?.name
                      : 'Subject';
                  const teacherName =
                    typeof slot.teacher === 'object'
                      ? slot.teacher?.name
                      : 'Teacher';

                  return (
                    <View key={slot.id}>
                      <View style={styles.slotRow}>
                        <View style={styles.slotLeft}>
                          <Text style={styles.slotPeriod}>P{slot.period}</Text>
                          <Text style={styles.slotTime}>
                            {slot.startTime}–{slot.endTime}
                          </Text>
                        </View>
                        <View style={styles.slotMiddle}>
                          <Text style={styles.slotSubject}>{subjectName}</Text>
                          <Text style={styles.slotTeacher}>{teacherName}</Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleOpenEditPeriod(slot)}
                          style={styles.editSlotBtn}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Text style={styles.editSlotText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteSlot(slot)}
                          style={styles.removeSlotBtn}
                          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                          <Text style={styles.removeSlotText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                      {!isLastSlot ? <View style={styles.divider} /> : null}
                    </View>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </View>
      </Sheet>

      {/* ─── 3. Add Period Sheet ─── */}
      <Sheet
        visible={addPeriodSheetVisible}
        onClose={() => { setAddPeriodSheetVisible(false); setEditingSlot(null); }}
        title={editingSlot ? "Edit Period" : "Add Period"}
        subtitle={`Schedule on ${DAYS_OF_WEEK.find((d) => d.day === selectedDay)?.full}`}
      >
        <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
          {addSlotError ? (
            <View style={styles.sheetErrorBox}>
              <Ionicons name="alert-circle" size={16} color={Colors.absent} />
              <Text style={styles.sheetErrorText}>{addSlotError}</Text>
            </View>
          ) : null}

          {/* Period Pills P1 - P8 */}
          <Text style={styles.fieldLabel}>PERIOD NUMBER (P1 – P8)</Text>
          <View style={styles.pillRow}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => {
              const selected = addPeriod === p;
              const occupied = occupiedPeriods.has(p);
              return (
                <TouchableOpacity
                  key={p}
                  disabled={occupied}
                  style={[
                    styles.pill,
                    selected && styles.pillActive,
                    occupied && styles.pillUnavailable,
                  ]}
                  onPress={() => {
                    const { startTime, endTime } = suggestedPeriodTimes(p, daySlots);
                    setAddPeriod(p);
                    setAddStartTime(startTime);
                    setAddEndTime(endTime);
                  }}
                >
                  <Text
                    style={[
                      styles.pillText,
                      selected && styles.pillTextActive,
                      occupied && styles.pillTextUnavailable,
                    ]}
                  >
                    P{p}{occupied ? ' ✓' : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Times */}
          <TimeField
            label="Start time"
            value={addStartTime}
            onChange={(next) => {
              setAddStartTime(next);
              // Keep the end time after the start time, preserving the chosen duration.
              const startMinutes = timeToMinutes(addStartTime);
              const endMinutes = timeToMinutes(addEndTime);
              const nextStart = timeToMinutes(next);
              if (nextStart === null) return;
              const duration =
                startMinutes !== null && endMinutes !== null && endMinutes > startMinutes
                  ? endMinutes - startMinutes
                  : 60;
              setAddEndTime(minutesToTime(nextStart + duration));
            }}
          />
          <TimeField
            label="End time"
            value={addEndTime}
            onChange={setAddEndTime}
          />
          <Text style={styles.timeHint}>
            {periodDurationLabel
              ? `Suggested from the preceding period · ${periodDurationLabel}`
              : 'End time must be after the start time.'}
          </Text>

          {/* Subject selection */}
          <Text style={styles.fieldLabel}>SUBJECT</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipScroll}
          >
            {availableSubjects.map((s) => {
              const selected = addSubject === s.id;
              return (
                <TouchableOpacity
                  key={s.id}
                  style={[styles.chip, selected && styles.chipActive]}
                  onPress={() => setAddSubject(s.id)}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                    {s.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Teacher selection */}
          <Text style={styles.fieldLabel}>FACULTY / TEACHER</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.chipScroll}
          >
            {availableTeachers.map((t) => {
              const selected = addTeacher === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.chip, selected && styles.chipActive]}
                  onPress={() => setAddTeacher(t.id)}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextActive]}>
                    {t.name}{t.primaryDepartment?.code ? ` · ${t.primaryDepartment.code}` : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.sheetActionRow}>
            <Button
              title={editingSlot ? "Save Changes" : "Save Period"}
              onPress={handleSavePeriod}
              loading={savingSlot}
            />
          </View>
        </ScrollView>
      </Sheet>

      <View style={{ height: Spacing['2xl'] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: FontSize['3xl'],
    color: Colors.ink,
  },
  countText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.muted,
    marginTop: 2,
  },
  newClassBtn: {
    paddingHorizontal: Spacing.md,
  },
  listCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.base,
    overflow: 'hidden',
  },
  classRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 64,
  },
  classInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  programName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.base,
    color: Colors.ink,
  },
  classMeta: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.muted,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  timetableBtn: {
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.base,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    backgroundColor: Colors.surface,
  },
  timetableBtnText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.brand,
  },
  editBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
  },
  editBtnText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.muted,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.line,
    marginLeft: Spacing.lg,
  },
  emptyCard: {
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
  emptySub: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.muted,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  firstBtn: {
    minWidth: 160,
  },
  errorCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.base,
    padding: Spacing.xl,
    alignItems: 'center',
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
  sheetScroll: {
    maxHeight: 480,
  },
  fieldLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.muted,
    letterSpacing: 0.6,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  chipScroll: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  chip: {
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.base,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    marginRight: Spacing.xs,
    backgroundColor: Colors.surface,
  },
  chipActive: {
    backgroundColor: Colors.brand,
    borderColor: Colors.brand,
  },
  chipText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.ink,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontFamily: Fonts.bodySemiBold,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  pillRow: { flexDirection: 'row', gap: Spacing.xs, marginBottom: Spacing.md },
  pill: {
    flex: 1,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.base,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: Colors.surface,
  },
  yearOption: {
    width: '31%',
    minHeight: 58,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.base,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  semesterOption: { minWidth: 70,
    borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.base,
    paddingHorizontal: Spacing.md, paddingVertical: 8, alignItems: 'center', backgroundColor: Colors.surface },
  pillActive: {
    backgroundColor: Colors.brand,
    borderColor: Colors.brand,
  },
  pillUnavailable: {
    backgroundColor: Colors.tintNeutral,
    borderColor: Colors.line,
  },
  pillText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.ink,
  },
  yearNumber: { fontFamily: Fonts.bodySemiBold, fontSize: FontSize.lg, color: Colors.ink, lineHeight: 20 },
  yearLabel: { fontFamily: Fonts.body, fontSize: FontSize.xs, color: Colors.muted, marginTop: 1 },
  selectorHint: { fontFamily: Fonts.body, fontSize: FontSize.xs, color: Colors.muted, marginTop: -2, marginBottom: Spacing.sm },
  pillTextActive: {
    color: '#FFFFFF',
    fontFamily: Fonts.bodySemiBold,
  },
  pillTextUnavailable: {
    color: Colors.muted,
  },
  sheetActionRow: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  deleteLink: {
    paddingVertical: Spacing.sm,
    alignItems: 'center',
  },
  deleteLinkText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.sm,
    color: Colors.absent,
  },
  sheetErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.tintError,
    borderWidth: 1,
    borderColor: '#ECC0BD',
    borderRadius: Radius.base,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  sheetErrorText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.absent,
    flex: 1,
  },
  timetableSheetBody: {
    paddingBottom: Spacing.lg,
  },
  dayTabs: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  dayTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.base,
    backgroundColor: Colors.surface,
  },
  dayTabActive: {
    backgroundColor: Colors.brand,
    borderColor: Colors.brand,
  },
  dayTabText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.muted,
  },
  dayTabTextActive: {
    color: '#FFFFFF',
  },
  dayStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  periodsCountLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.muted,
  },
  addPeriodOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.base,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  addPeriodOutlineText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.brand,
  },
  emptyDayBox: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyDayText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.muted,
  },
  slotsScroll: {
    maxHeight: 280,
  },
  slotsCard: {
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.base,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  slotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  slotLeft: {
    width: 72,
  },
  slotPeriod: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.sm,
    color: Colors.ink,
  },
  slotTime: {
    fontFamily: Fonts.body,
    fontSize: 10,
    color: Colors.muted,
  },
  slotMiddle: {
    flex: 1,
    marginHorizontal: Spacing.sm,
  },
  slotSubject: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.sm,
    color: Colors.ink,
  },
  slotTeacher: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.muted,
  },
  removeSlotBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  editSlotBtn: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
  },
  editSlotText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.brand,
  },
  removeSlotText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.absent,
  },
  timeInputsRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  timeHint: {
    color: Colors.muted,
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    marginTop: Spacing.xs,
  },
});
