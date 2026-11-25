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
import { getSubjects, createSubject, updateSubject, deleteSubject, type SubjectOption } from '../api/subjects';
import { Alert } from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import Tag from '../components/Tag';
import SkeletonList from '../components/Skeleton';
import Sheet from '../components/Sheet';
import { getDepartments, type Department } from '../api/departments';

interface SubjectsScreenProps {
  onBack?: () => void;
}

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export default function SubjectsScreen({ onBack }: SubjectsScreenProps) {
  const [subjects, setSubjects] = useState<SubjectOption[]>([]);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Form states
  const [newName, setNewName] = useState('');
  const [newSemester, setNewSemester] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [addSheetVisible, setAddSheetVisible] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectOption | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');

  useEffect(() => {
    getDepartments().then((res) => {
      const items = res.data || [];
      setDepartments(items);
      if (!selectedDepartmentId && items[0]?.id) setSelectedDepartmentId(items[0].id);
    }).catch(() => setDepartments([]));
  }, [selectedDepartmentId]);

  const fetchSubjects = useCallback(async () => {
    try {
      const res = await getSubjects(selectedSemester || undefined);
      setSubjects(res.data || []);
    } catch {
      setSubjects([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedSemester]);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSubjects();
  };

  const handleCreateSubject = async () => {
    if (!newName.trim() || newName.trim().length < 2) {
      setError('Subject name must be at least 2 characters.');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (editingSubject) await updateSubject(editingSubject.id, { name: newName.trim(), semester: newSemester });
      else {
        if (!selectedDepartmentId) { setError('Choose a department first.'); setSubmitting(false); return; }
        await createSubject({ name: newName.trim(), semester: newSemester, departmentId: selectedDepartmentId });
      }
      setSuccess(`Subject "${newName.trim()}" added to Semester ${newSemester}.`);
      setNewName('');
      fetchSubjects();
      setAddSheetVisible(false);
      setEditingSubject(null);
    } catch (err: any) {
      setError(
        err?.response?.data?.message || 'Failed to add subject. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const openAdd = () => { setEditingSubject(null); setNewName(''); setNewSemester(selectedSemester || 1); setError(null); setSuccess(null); setAddSheetVisible(true); };
  const openEdit = (subject: SubjectOption) => { setEditingSubject(subject); setNewName(subject.name); setNewSemester(subject.semester || 1); setError(null); setSuccess(null); setAddSheetVisible(true); };
  const removeSubject = (subject: SubjectOption) => Alert.alert('Delete subject?', `${subject.name} will be removed from the curriculum.`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => { try { await deleteSubject(subject.id); fetchSubjects(); } catch (err: any) { Alert.alert('Could not delete subject', err?.response?.data?.message || 'Please try again.'); } } },
  ]);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.brand}
            colors={[Colors.brand]}
          />
        }
      >
        {onBack ? (
          <TouchableOpacity
            style={styles.backLink}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={18} color={Colors.brand} />
            <Text style={styles.backLinkText}>Manage</Text>
          </TouchableOpacity>
        ) : null}

        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerText}>
            <Text style={styles.title}>Subjects</Text>
            <Text style={styles.subtitle}>Course curriculum by semester ({subjects.length} courses)</Text>
          </View>
          <Button title="Add subject" size="sm" fullWidth={false} icon={<Ionicons name="add" size={18} color="#FFFFFF" />} onPress={openAdd} />
        </View>

        {/* S1 - S8 Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedSemester === null && styles.filterChipActive,
            ]}
            onPress={() => setSelectedSemester(null)}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedSemester === null && styles.filterChipTextActive,
              ]}
            >
              All Semesters
            </Text>
          </TouchableOpacity>

          {SEMESTERS.map((sem) => {
            const isSelected = selectedSemester === sem;
            return (
              <TouchableOpacity
                key={sem}
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipActive,
                ]}
                onPress={() => setSelectedSemester(sem)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  S{sem}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Subjects List */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            {selectedSemester ? `Semester ${selectedSemester} Courses` : 'All Courses'}
          </Text>
          <Tag label={`${subjects.length} subjects`} variant="neutral" />
        </View>

        {loading ? (
          <SkeletonList count={5} />
        ) : subjects.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No subjects found</Text>
            <Text style={styles.emptySub}>
              {selectedSemester
                ? `No courses registered for Semester ${selectedSemester}.`
                : 'No course catalog entries available.'}
            </Text>
          </View>
        ) : (
          <View style={styles.listCard}>
            {subjects.map((subj, index) => {
              const isLast = index === subjects.length - 1;
              return (
                <View key={subj.id}>
                  <View style={styles.subjectRow}>
                    <View style={styles.subjectInfo}>
                      <Text style={styles.subjectName}>{subj.name}</Text>
                      <Text style={styles.subjectMeta}>
                        {subj.code ? `Code: ${subj.code} · ` : ''}
                        {subj.semester ? `Semester ${subj.semester}` : 'General'}
                      </Text>
                    </View>
                    <View style={styles.rowActions}><Tag label={subj.semester ? `S${subj.semester}` : 'Core'} variant="brand" /><TouchableOpacity onPress={() => openEdit(subj)}><Ionicons name="create-outline" size={19} color={Colors.brand} /></TouchableOpacity><TouchableOpacity onPress={() => removeSubject(subj)}><Ionicons name="trash-outline" size={19} color={Colors.absent} /></TouchableOpacity></View>
                  </View>
                  {!isLast ? <View style={styles.divider} /> : null}
                </View>
              );
            })}
          </View>
        )}

      </ScrollView>
      <Sheet visible={addSheetVisible} onClose={() => { setAddSheetVisible(false); setEditingSubject(null); }} title={editingSubject ? "Edit Subject" : "Add Subject"} subtitle="Add this course to a specific semester.">
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.sheetBody}>

            {success ? (
              <View style={styles.successBox}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.present} />
                <Text style={styles.successText}>{success}</Text>
              </View>
            ) : null}

            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={Colors.absent} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

          {!editingSubject ? <><Text style={styles.fieldLabel}>DEPARTMENT</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.formPillScroll}>{departments.map((department) => { const selected = selectedDepartmentId === department.id; return <TouchableOpacity key={department.id} style={[styles.filterChip, selected && styles.filterChipActive]} onPress={() => setSelectedDepartmentId(department.id)}><Text style={[styles.filterChipText, selected && styles.filterChipTextActive]}>{department.code}</Text></TouchableOpacity>; })}</ScrollView><Text style={styles.selectionHint}>{departments.find((department) => department.id === selectedDepartmentId)?.name || 'Choose the department for this subject.'}</Text></> : null}
          <Input
              label="Subject name"
              value={newName}
              onChangeText={(t) => {
                setNewName(t);
                if (error) setError(null);
                if (success) setSuccess(null);
              }}
              placeholder="e.g. Data Structures & Algorithms"
            />

            <Text style={styles.fieldLabel}>SEMESTER (S1 – S8)</Text>
            <Text style={styles.selectionHint}>Selected: Semester {newSemester}</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.formPillScroll}>
              {SEMESTERS.map((s) => {
                const isSelected = newSemester === s;
                return (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.filterChip,
                      isSelected && styles.filterChipActive,
                    ]}
                    onPress={() => setNewSemester(s)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        isSelected && styles.filterChipTextActive,
                      ]}
                    >
                      S{s}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={{ marginTop: Spacing.md }}>
              <Button
                title={editingSubject ? "Save Changes" : "Add Subject"}
                onPress={handleCreateSubject}
                loading={submitting}
                disabled={!newName.trim()}
                disabledReason={!newName.trim() ? 'Enter subject name' : undefined}
              />
            </View>
        </ScrollView>
      </Sheet>
    </View>
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
  backLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.md,
    alignSelf: 'flex-start',
  },
  backLinkText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.sm,
    color: Colors.brand,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.md, marginBottom: Spacing.lg },
  headerText: { flex: 1 },
  title: {
    fontFamily: Fonts.heading,
    fontSize: FontSize['3xl'],
    color: Colors.ink,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.muted,
    marginTop: 2,
  },
  chipsScroll: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.base,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    marginRight: Spacing.xs,
    backgroundColor: Colors.surface,
  },
  filterChipActive: {
    backgroundColor: Colors.brand,
    borderColor: Colors.brand,
  },
  filterChipText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.ink,
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontFamily: Fonts.bodySemiBold,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.lg,
    color: Colors.ink,
  },
  listCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.base,
    overflow: 'hidden',
    marginBottom: Spacing.xl,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 56,
  },
  rowActions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  subjectInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  subjectName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.base,
    color: Colors.ink,
  },
  subjectMeta: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.muted,
    marginTop: 2,
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
    marginBottom: Spacing.xl,
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
  },
  formCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.base,
    padding: Spacing.xl,
  },
  formTitle: {
    fontFamily: Fonts.heading,
    fontSize: FontSize.xl,
    color: Colors.ink,
  },
  formSubtitle: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.muted,
    marginTop: 2,
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.muted,
    letterSpacing: 0.6,
    marginBottom: Spacing.xs,
    marginTop: Spacing.xs,
  },
  formPillScroll: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  sheetBody: { paddingBottom: Spacing['2xl'] },
  selectionHint: { fontFamily: Fonts.body, fontSize: FontSize.xs, color: Colors.muted, marginTop: -Spacing.xs, marginBottom: Spacing.sm },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.tintOk,
    borderWidth: 1,
    borderColor: '#BBDCC7',
    borderRadius: Radius.base,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  successText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.present,
    flex: 1,
  },
  errorBox: {
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
  errorText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.absent,
    flex: 1,
  },
});
