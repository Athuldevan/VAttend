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
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';
import {
  getClasses,
  createClass,
  updateClass,
  deleteClass,
  type ClassItem,
  type CreateClassPayload,
} from '../api/classes';
import { getDepartments, type Department } from '../api/departments';

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

// ─── Main Page ──────────────────────────────────────────
export default function ClassesScreen() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);

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
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleEdit(cls)} activeOpacity={0.7}>
                <Ionicons name="create-outline" size={16} color={Colors.primary} />
                <Text style={[styles.actionText, { color: Colors.primary }]}>Edit</Text>
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
  loadingText: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: Spacing.md },

  // Page header
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  pageTitle: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.text },
  pageSubtitle: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: 2 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  addBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textInverse },

  // Error
  errorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.errorBg,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  errorCardText: { flex: 1, fontSize: FontSize.sm, color: Colors.error, fontWeight: FontWeight.medium },
  retryText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.primary },

  // Empty
  emptyContainer: { alignItems: 'center', paddingVertical: Spacing['5xl'] },
  emptyTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text, marginTop: Spacing.lg },
  emptySubtext: { fontSize: FontSize.sm, color: Colors.textTertiary, marginTop: Spacing.xs },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    marginTop: Spacing.xl,
  },
  emptyBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textInverse },

  // Class Card
  classCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  classCardTop: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  yearBadge: {
    backgroundColor: Colors.primaryBg,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  yearBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.primary },
  semBadge: {
    backgroundColor: Colors.background,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  semBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.textSecondary },
  ayBadge: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  ayBadgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.text },
  classCardDept: { fontSize: FontSize.sm, color: Colors.textSecondary, marginBottom: 2 },
  classCardDate: { fontSize: FontSize.xs, color: Colors.textTertiary },
  classCardActions: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  actionText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold },

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
  modalTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.text },
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
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textSecondary },
  submitBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitBtnText: { fontSize: FontSize.sm, fontWeight: FontWeight.bold, color: Colors.textInverse },

  // Form fields
  fieldLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
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
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
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
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  chipTextActive: {
    color: Colors.textInverse,
    fontWeight: FontWeight.bold,
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
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  pillTextActive: {
    color: Colors.textInverse,
    fontWeight: FontWeight.bold,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    fontSize: FontSize.base,
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
  formErrorText: { flex: 1, fontSize: FontSize.sm, color: Colors.error, fontWeight: FontWeight.medium },
});
