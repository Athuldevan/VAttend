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
  TextInput,
  Modal,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight, Fonts } from '../constants/theme';
import {
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  type ClassItem,
  type CreateClassPayload,
} from '../api/classes';
import { getDepartments, type Department } from '../api/departments';
import {
  getClassTimetable,
  createTimetable,
  deleteTimetable,
  type TimetableSlot,
} from '../api/timetable';
import { getTeachers, type TeacherOption } from '../api/users';
import { getSubjects, type SubjectOption } from '../api/subjects';

// ─── Helpers ─────────────────────────────────────────
const currentAcademicYear = (): string => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const start = m >= 5 ? y : y - 1;
  return `${start}-${String(start + 1).slice(-2)}`;
};

const emptyForm = (): CreateClassPayload => ({
  programId: '',
  departmentId: '',
  year: 1,
  academicYear: currentAcademicYear(),
  currentSemester: 1,
});

// ─── Create/Edit Modal ─────────────────────────────────
interface FormModalProps {
  visible: boolean;
  onClose: () => void;
  editingClass: ClassItem | null;
  onSaved: (cls: ClassItem, isEdit: boolean) => void;
}

function FormModal({ visible, onClose, editingClass, onSaved }: FormModalProps) {
  const [form, setForm] = useState<CreateClassPayload>(emptyForm());
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setForm(
        editingClass
          ? {
              programId: editingClass.programId,
              departmentId: editingClass.departmentId,
              year: editingClass.year,
              academicYear: editingClass.academicYear,
              currentSemester: editingClass.currentSemester,
            }
          : emptyForm()
      );
      setError(null);

      setLoadingDepts(true);
      getDepartments()
        .then((res) => setDepartments(res.data))
        .catch(() => setError('Failed to load departments'))
        .finally(() => setLoadingDepts(false));
    }
  }, [visible, editingClass]);

  const handleSubmit = async () => {
    if (!form.departmentId) {
      setError('Please select a department.');
      return;
    }
    if (!form.academicYear.trim()) {
      setError('Academic year is required.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const payload: CreateClassPayload = {
        ...form,
        departmentId: form.departmentId.trim(),
        academicYear: form.academicYear.trim(),
      };
      if (form.programId?.trim()) payload.programId = form.programId.trim();
      else delete payload.programId;

      const res = editingClass
        ? await updateClass(editingClass.id, payload)
        : await createClass(payload);
      onSaved(res.data, Boolean(editingClass));
      onClose();
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) setError('A class with these details already exists.');
      else if (status === 403) setError("You don't have permission.");
      else setError(err?.response?.data?.message || 'Failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingClass ? 'Edit Class' : 'New Class'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Department Selector */}
            <Text style={styles.fieldLabel}>Department</Text>
            {loadingDepts ? (
              <ActivityIndicator size="small" color={Colors.primary} />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
                {departments.map((d) => {
                  const isSelected = form.departmentId === d.id;
                  return (
                    <TouchableOpacity
                      key={d.id}
                      style={[styles.chip, isSelected && styles.chipActive]}
                      onPress={() => setForm((p) => ({ ...p, departmentId: d.id }))}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                        {d.code || d.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {/* Year Selector */}
            <Text style={styles.fieldLabel}>Year</Text>
            <View style={styles.pillRow}>
              {[1, 2, 3, 4, 5].map((y) => {
                const isSelected = form.year === y;
                return (
                  <TouchableOpacity
                    key={y}
                    style={[styles.pill, isSelected && styles.pillActive]}
                    onPress={() => setForm((p) => ({ ...p, year: y }))}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                      Year {y}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Semester Selector */}
            <Text style={styles.fieldLabel}>Current Semester</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
              {Array.from({ length: 10 }, (_, i) => i + 1).map((s) => {
                const isSelected = form.currentSemester === s;
                return (
                  <TouchableOpacity
                    key={s}
                    style={[styles.pill, isSelected && styles.pillActive]}
                    onPress={() => setForm((p) => ({ ...p, currentSemester: s }))}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.pillText, isSelected && styles.pillTextActive]}>
                      Sem {s}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Academic Year */}
            <Text style={styles.fieldLabel}>Academic Year</Text>
            <TextInput
              style={styles.textInput}
              value={form.academicYear}
              onChangeText={(val) => setForm((p) => ({ ...p, academicYear: val }))}
              placeholder="e.g. 2026-27"
              placeholderTextColor={Colors.textTertiary}
            />

            {/* Error */}
            {error && (
              <View style={styles.formError}>
                <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
                <Text style={styles.formErrorText}>{error}</Text>
              </View>
            )}
          </ScrollView>

          {/* Actions */}
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelBtn} onPress={onClose} activeOpacity={0.7}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitBtnDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={Colors.textInverse} />
              ) : (
                <Text style={styles.submitBtnText}>
                  {editingClass ? 'Save' : 'Create'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── Class Timetable Modal ──────────────────────────────
const DAYS_OF_WEEK = [
  { day: 1, label: 'Mon', full: 'Monday' },
  { day: 2, label: 'Tue', full: 'Tuesday' },
  { day: 3, label: 'Wed', full: 'Wednesday' },
  { day: 4, label: 'Thu', full: 'Thursday' },
  { day: 5, label: 'Fri', full: 'Friday' },
];

interface ClassTimetableModalProps {
  visible: boolean;
  onClose: () => void;
  classItem: ClassItem | null;
}

function ClassTimetableModal({ visible, onClose, classItem }: ClassTimetableModalProps) {
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [error, setError] = useState<string | null>(null);

  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [addPeriod, setAddPeriod] = useState<number>(1);
  const [addStartTime, setAddStartTime] = useState<string>('09:00');
  const [addEndTime, setAddEndTime] = useState<string>('10:00');
  const [addSubject, setAddSubject] = useState<string>('');
  const [addTeacher, setAddTeacher] = useState<string>('');
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState<boolean>(false);
  const [savingSlot, setSavingSlot] = useState<boolean>(false);
  const [addError, setAddError] = useState<string | null>(null);

  const fetchTimetable = useCallback(async () => {
    if (!classItem) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getClassTimetable(classItem.id, classItem.currentSemester);
      setSlots(res.data || []);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load timetable.');
    } finally {
      setLoading(false);
    }
  }, [classItem]);

  useEffect(() => {
    if (visible && classItem) {
      fetchTimetable();
      setShowAdd(false);

      setLoadingOptions(true);
      Promise.all([getTeachers(), getSubjects(classItem.currentSemester)])
        .then(([teacherResponse, subjectResponse]) => {
          setTeachers(teacherResponse.data || []);
          setSubjects(subjectResponse.data || []);
        })
        .catch(() => setAddError('Failed to load teachers or subjects. Please try again.'))
        .finally(() => setLoadingOptions(false));
    }
  }, [visible, classItem, fetchTimetable]);

  const handleDeleteSlot = (slot: TimetableSlot) => {
    Alert.alert(
      'Delete Slot',
      `Delete Period ${slot.period} on ${DAYS_OF_WEEK.find((d) => d.day === slot.dayOfWeek)?.label || 'this day'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTimetable(slot.id);
              setSlots((prev) => prev.filter((s) => s.id !== slot.id));
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || 'Failed to delete slot.');
            }
          },
        },
      ]
    );
  };

  const handleAddSlot = async () => {
    if (!classItem) return;
    if (!addSubject.trim()) {
      setAddError('Please select a subject.');
      return;
    }
    if (!addTeacher.trim()) {
      setAddError('Please select a teacher.');
      return;
    }

    setSavingSlot(true);
    setAddError(null);
    try {
      await createTimetable({
        class: classItem.id,
        semester: classItem.currentSemester,
        dayOfWeek: selectedDay,
        period: addPeriod,
        startTime: addStartTime.trim(),
        endTime: addEndTime.trim(),
        subject: addSubject.trim(),
        teacher: addTeacher.trim(),
        department: classItem.departmentId,
      });
      setShowAdd(false);
      fetchTimetable();
    } catch (err: any) {
      setAddError(err?.response?.data?.message || 'Failed to create slot (check for schedule clashes).');
    } finally {
      setSavingSlot(false);
    }
  };

  if (!classItem) return null;

  const currentSlots = slots
    .filter((s) => s.dayOfWeek === selectedDay)
    .sort((a, b) => a.period - b.period);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { maxHeight: '85%' }]}>
          {/* Header */}
          <View style={styles.modalHeader}>
            <View>
              <Text style={styles.modalTitle}>Class Timetable</Text>
              <Text style={styles.pageSubtitle}>
                Year {classItem.year} · Sem {classItem.currentSemester} · {classItem.academicYear}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Days bar */}
          <View style={styles.daySelectorRow}>
            {DAYS_OF_WEEK.map((d) => {
              const active = selectedDay === d.day;
              return (
                <TouchableOpacity
                  key={d.day}
                  style={[styles.dayTab, active && styles.dayTabActive]}
                  onPress={() => setSelectedDay(d.day)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dayTabText, active && styles.dayTabTextActive]}>
                    {d.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Add Slot Form or Slot List */}
          {showAdd ? (
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.addSlotHeader}>
                <Text style={styles.addSlotTitle}>
                  Add Period for {DAYS_OF_WEEK.find((d) => d.day === selectedDay)?.full}
                </Text>
              </View>

              <Text style={styles.fieldLabel}>Period Number (1 - 8)</Text>
              <View style={styles.pillRow}>
                {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[styles.pill, addPeriod === p && styles.pillActive]}
                    onPress={() => setAddPeriod(p)}
                  >
                    <Text style={[styles.pillText, addPeriod === p && styles.pillTextActive]}>
                      P{p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.row}>
                <View style={styles.halfField}>
                  <Text style={styles.fieldLabel}>Start Time (HH:mm)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={addStartTime}
                    onChangeText={setAddStartTime}
                    placeholder="09:00"
                    placeholderTextColor={Colors.textTertiary}
                  />
                </View>
                <View style={styles.halfField}>
                  <Text style={styles.fieldLabel}>End Time (HH:mm)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={addEndTime}
                    onChangeText={setAddEndTime}
                    placeholder="10:00"
                    placeholderTextColor={Colors.textTertiary}
                  />
                </View>
              </View>

              <Text style={styles.fieldLabel}>Subject</Text>
              {loadingOptions ? (
                <ActivityIndicator size="small" color={Colors.primary} style={styles.optionLoader} />
              ) : subjects.length === 0 ? (
                <Text style={styles.optionEmptyText}>No subjects are available for this semester.</Text>
              ) : (
                <View style={styles.optionList}>
                  {subjects.map((subject) => {
                    const selected = addSubject === subject.id;
                    return (
                      <TouchableOpacity
                        key={subject.id}
                        style={[styles.optionChip, selected && styles.optionChipSelected]}
                        onPress={() => setAddSubject(subject.id)}
                      >
                        <Text style={[styles.optionChipText, selected && styles.optionChipTextSelected]}>
                          {subject.name}{subject.code ? ` (${subject.code})` : ''}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              <Text style={styles.fieldLabel}>Teacher</Text>
              {loadingOptions ? (
                <ActivityIndicator size="small" color={Colors.primary} style={styles.optionLoader} />
              ) : teachers.length === 0 ? (
                <Text style={styles.optionEmptyText}>No active teachers are available in your department.</Text>
              ) : (
                <View style={styles.optionList}>
                  {teachers.map((teacher) => {
                    const selected = addTeacher === teacher.id;
                    return (
                      <TouchableOpacity
                        key={teacher.id}
                        style={[styles.optionChip, selected && styles.optionChipSelected]}
                        onPress={() => setAddTeacher(teacher.id)}
                      >
                        <Text style={[styles.optionChipText, selected && styles.optionChipTextSelected]}>
                          {teacher.name}{teacher.email ? ` · ${teacher.email}` : ''}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              )}

              {addError && (
                <View style={styles.formError}>
                  <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
                  <Text style={styles.formErrorText}>{addError}</Text>
                </View>
              )}

              <View style={[styles.modalActions, { marginTop: Spacing.xl }]}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => setShowAdd(false)}
                >
                  <Text style={styles.cancelBtnText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitBtn, savingSlot && styles.submitBtnDisabled]}
                  onPress={handleAddSlot}
                  disabled={savingSlot}
                >
                  {savingSlot ? (
                    <ActivityIndicator size="small" color={Colors.textInverse} />
                  ) : (
                    <Text style={styles.submitBtnText}>Save Slot</Text>
                  )}
                </TouchableOpacity>
              </View>
            </ScrollView>
          ) : (
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.slotListHeader}>
                <Text style={styles.slotListHeaderText}>
                  {currentSlots.length} slot{currentSlots.length !== 1 ? 's' : ''} on{' '}
                  {DAYS_OF_WEEK.find((d) => d.day === selectedDay)?.full}
                </Text>
                <TouchableOpacity
                  style={styles.addSlotBtn}
                  onPress={() => {
                    setAddError(null);
                    setAddSubject('');
                    setAddTeacher('');
                    setShowAdd(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name="add" size={16} color={Colors.primary} />
                  <Text style={styles.addSlotBtnText}>Add Slot</Text>
                </TouchableOpacity>
              </View>

              {loading ? (
                <View style={{ paddingVertical: Spacing['3xl'], alignItems: 'center' }}>
                  <ActivityIndicator size="small" color={Colors.primary} />
                  <Text style={styles.loadingText}>Loading timetable...</Text>
                </View>
              ) : currentSlots.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="calendar-outline" size={36} color={Colors.textTertiary} />
                  <Text style={styles.emptyTitle}>No slots scheduled</Text>
                  <Text style={styles.emptySubtext}>
                    No classes have been set up for {DAYS_OF_WEEK.find((d) => d.day === selectedDay)?.full}.
                  </Text>
                </View>
              ) : (
                currentSlots.map((slot) => {
                  const subjectName =
                    typeof slot.subject === 'object' && slot.subject?.name
                      ? slot.subject.name
                      : String(slot.subject || 'Subject');
                  const teacherName =
                    typeof slot.teacher === 'object' && slot.teacher?.name
                      ? slot.teacher.name
                      : 'Teacher';

                  return (
                    <View key={slot.id} style={styles.slotCard}>
                      <View style={styles.slotCardLeft}>
                        <View style={styles.slotPeriodBadge}>
                          <Text style={styles.slotPeriodBadgeText}>P{slot.period}</Text>
                        </View>
                        <View>
                          <Text style={styles.slotSubjectText}>{subjectName}</Text>
                          <Text style={styles.slotSubText}>
                            {slot.startTime} – {slot.endTime} · {teacherName}
                          </Text>
                        </View>
                      </View>
                      <TouchableOpacity
                        style={styles.slotDeleteBtn}
                        onPress={() => handleDeleteSlot(slot)}
                      >
                        <Ionicons name="trash-outline" size={16} color={Colors.error} />
                      </TouchableOpacity>
                    </View>
                  );
                })
              )}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

// ─── Main Page ──────────────────────────────────────────
export default function ClassesScreen() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [timetableClass, setTimetableClass] = useState<ClassItem | null>(null);

  const fetchClasses = useCallback(async () => {
    setError(null);
    try {
      const res = await getClasses();
      setClasses(res.data);
    } catch {
      setError('Failed to load classes.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchClasses();
  };

  const handleSaved = (cls: ClassItem, isEdit: boolean) => {
    setClasses((prev) =>
      isEdit ? prev.map((c) => (c.id === cls.id ? cls : c)) : [cls, ...prev]
    );
  };

  const handleDelete = (cls: ClassItem) => {
    Alert.alert(
      'Delete Class',
      `Delete Year ${cls.year} · Sem ${cls.currentSemester} · ${cls.academicYear}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteClass(cls.id);
              setClasses((prev) => prev.filter((c) => c.id !== cls.id));
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || 'Failed to delete.');
            }
          },
        },
      ]
    );
  };

  const handleEdit = (cls: ClassItem) => {
    setEditingClass(cls);
    setShowForm(true);
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Loading classes...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FormModal
        visible={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingClass(null);
        }}
        editingClass={editingClass}
        onSaved={handleSaved}
      />

      <ClassTimetableModal
        visible={Boolean(timetableClass)}
        classItem={timetableClass}
        onClose={() => setTimetableClass(null)}
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} colors={[Colors.primary]} />
        }
      >
        {/* Header */}
        <View style={styles.pageHeader}>
          <View>
            <Text style={styles.pageTitle}>Classes</Text>
            <Text style={styles.pageSubtitle}>
              {classes.length} class{classes.length !== 1 ? 'es' : ''} total
            </Text>
          </View>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowForm(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color={Colors.textInverse} />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle" size={20} color={Colors.error} />
            <Text style={styles.errorCardText}>{error}</Text>
            <TouchableOpacity onPress={fetchClasses}>
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Empty */}
        {!error && classes.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="school-outline" size={48} color={Colors.borderLight} />
            <Text style={styles.emptyTitle}>No classes yet</Text>
            <Text style={styles.emptySubtext}>Create your first class to get started</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => setShowForm(true)} activeOpacity={0.8}>
              <Ionicons name="add" size={18} color={Colors.textInverse} />
              <Text style={styles.emptyBtnText}>Add Class</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Class Cards */}
        {classes.map((cls) => (
          <View key={cls.id} style={styles.classCard}>
            <View style={styles.classCardTop}>
              <View style={styles.yearBadge}>
                <Text style={styles.yearBadgeText}>Y{cls.year}</Text>
              </View>
              <View style={styles.semBadge}>
                <Text style={styles.semBadgeText}>Sem {cls.currentSemester}</Text>
              </View>
              <View style={styles.ayBadge}>
                <Text style={styles.ayBadgeText}>{cls.academicYear}</Text>
              </View>
            </View>

            <Text style={styles.classCardDept}>
              {cls.departmentName || cls.departmentId.slice(0, 12) + '…'}
            </Text>
            <Text style={styles.classCardDate}>Created {formatDate(cls.createdAt)}</Text>

            <View style={styles.classCardActions}>
              <TouchableOpacity
                style={[styles.actionBtn, styles.actionBtnTimetable]}
                onPress={() => setTimetableClass(cls)}
                activeOpacity={0.7}
              >
                <Ionicons name="calendar-outline" size={16} color={Colors.primary} />
                <Text style={[styles.actionText, { color: Colors.primary }]}>Timetable</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleEdit(cls)} activeOpacity={0.7}>
                <Ionicons name="create-outline" size={16} color={Colors.textSecondary} />
                <Text style={[styles.actionText, { color: Colors.textSecondary }]}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleDelete(cls)} activeOpacity={0.7}>
                <Ionicons name="trash-outline" size={16} color={Colors.error} />
                <Text style={[styles.actionText, { color: Colors.error }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
  loadingText: { fontSize: FontSize.sm, fontFamily: Fonts.medium, color: Colors.textSecondary, marginTop: Spacing.md },

  // Page header
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  pageTitle: { fontSize: FontSize['2xl'], fontFamily: Fonts.extrabold, color: Colors.text },
  pageSubtitle: { fontSize: FontSize.xs, fontFamily: Fonts.medium, color: Colors.textTertiary, marginTop: 2 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  addBtnText: { fontSize: FontSize.sm, fontFamily: Fonts.bold, color: Colors.text },

  // Error
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.errorBg,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  errorCardText: { flex: 1, fontSize: FontSize.sm, fontFamily: Fonts.medium, color: Colors.error },
  retryText: { fontSize: FontSize.sm, fontFamily: Fonts.bold, color: Colors.primaryDark },

  // Empty
  emptyContainer: { alignItems: 'center', paddingVertical: Spacing['5xl'] },
  emptyTitle: { fontSize: FontSize.base, fontFamily: Fonts.bold, color: Colors.text, marginTop: Spacing.lg },
  emptySubtext: { fontSize: FontSize.sm, fontFamily: Fonts.medium, color: Colors.textTertiary, marginTop: Spacing.xs },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    marginTop: Spacing.xl,
  },
  emptyBtnText: { fontSize: FontSize.sm, fontFamily: Fonts.bold, color: Colors.text },

  // Class Card
  classCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  classCardTop: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  yearBadge: {
    backgroundColor: Colors.primaryMuted,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
  },
  yearBadgeText: { fontSize: FontSize.xs, fontFamily: Fonts.bold, color: Colors.primaryDark },
  semBadge: {
    backgroundColor: Colors.blueBg,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
  },
  semBadgeText: { fontSize: FontSize.xs, fontFamily: Fonts.bold, color: Colors.blue },
  ayBadge: {
    backgroundColor: Colors.backgroundAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.md,
    paddingVertical: 3,
  },
  ayBadgeText: { fontSize: FontSize.xs, fontFamily: Fonts.semibold, color: Colors.text },
  classCardDept: { fontSize: FontSize.base, fontFamily: Fonts.bold, color: Colors.text, marginBottom: 2 },
  classCardDate: { fontSize: FontSize.xs, fontFamily: Fonts.medium, color: Colors.textTertiary },
  classCardActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: FontSize.sm, fontFamily: Fonts.bold },
  optionList: { gap: Spacing.xs, marginBottom: Spacing.md },
  optionChip: {
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  optionChipSelected: { borderColor: Colors.primary, backgroundColor: Colors.primaryMuted },
  optionChipText: { fontSize: FontSize.sm, fontFamily: Fonts.medium, color: Colors.textSecondary },
  optionChipTextSelected: { color: Colors.primaryDark, fontFamily: Fonts.bold },
  optionEmptyText: { fontSize: FontSize.sm, color: Colors.textTertiary, marginBottom: Spacing.md },
  optionLoader: { alignSelf: 'flex-start', marginBottom: Spacing.md },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  modalTitle: { fontSize: FontSize.lg, fontFamily: Fonts.bold, color: Colors.text },
  closeBtn: { padding: Spacing.xs },
  modalBody: { padding: Spacing.xl },
  modalActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.xl,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  cancelBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: FontSize.sm, fontFamily: Fonts.bold, color: Colors.textSecondary },
  submitBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { fontSize: FontSize.sm, fontFamily: Fonts.bold, color: Colors.text },

  // Form fields
  fieldLabel: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.backgroundAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.sm,
  },
  chipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  chipText: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.text,
    fontFamily: Fonts.bold,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.xs,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  pillText: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: Colors.text,
    fontFamily: Fonts.bold,
  },
  textInput: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.backgroundAlt,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSize.base,
    fontFamily: Fonts.regular,
    color: Colors.text,
  },
  row: { flexDirection: 'row', gap: Spacing.md },
  halfField: { flex: 1 },
  formError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.errorBg,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  formErrorText: { flex: 1, fontSize: FontSize.sm, fontFamily: Fonts.medium, color: Colors.error },
  daySelectorRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  dayTab: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.backgroundAlt,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dayTabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  dayTabText: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.semibold,
    color: Colors.textSecondary,
  },
  dayTabTextActive: {
    color: Colors.text,
    fontFamily: Fonts.bold,
  },
  slotListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  slotListHeaderText: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.semibold,
    color: Colors.textTertiary,
  },
  addSlotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryMuted,
  },
  addSlotBtnText: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.bold,
    color: Colors.primaryDark,
  },
  addSlotHeader: {
    marginBottom: Spacing.md,
  },
  addSlotTitle: {
    fontSize: FontSize.base,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  slotCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundAlt,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  slotCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    flex: 1,
  },
  slotPeriodBadge: {
    width: 34,
    height: 34,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotPeriodBadgeText: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.bold,
    color: Colors.primaryDark,
  },
  slotSubjectText: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  slotSubText: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.medium,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  slotDeleteBtn: {
    padding: Spacing.xs,
  },
  actionBtnTimetable: {
    backgroundColor: Colors.primaryBg,
  },
});
