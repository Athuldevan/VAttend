import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';
import {
  getPrograms,
  createProgram,
  deleteProgram,
  type Program,
  type CreateProgramPayload,
} from '../api/programs';
import { getDepartments, type Department } from '../api/departments';

export default function ProgramsScreen() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formDeptId, setFormDeptId] = useState('');
  const [formName, setFormName] = useState('');
  const [formLevel, setFormLevel] = useState<'UG' | 'PG'>('UG');
  const [formDuration, setFormDuration] = useState('3');
  const [formError, setFormError] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [progRes, deptRes] = await Promise.all([
        getPrograms(),
        getDepartments(),
      ]);
      setPrograms(progRes.data || []);
      setDepartments(deptRes.data || []);
      if (deptRes.data && deptRes.data.length > 0 && !formDeptId) {
        setFormDeptId(deptRes.data[0].id);
      }
    } catch (err: any) {
      console.warn('Error fetching programs data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [formDeptId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleCreate = async () => {
    if (!formName.trim() || formName.trim().length < 2) {
      setFormError('Program name must be at least 2 characters.');
      return;
    }
    if (!formDeptId) {
      setFormError('Please select a department.');
      return;
    }
    const durationNum = parseInt(formDuration, 10);
    if (isNaN(durationNum) || durationNum < 1 || durationNum > 6) {
      setFormError('Duration must be between 1 and 6 years.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await createProgram({
        departmentId: formDeptId,
        name: formName.trim(),
        level: formLevel,
        durationYears: durationNum,
      });
      setModalVisible(false);
      setFormName('');
      setFormDuration('3');
      fetchData();
    } catch (err: any) {
      setFormError(err?.response?.data?.message || 'Failed to create program.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (prog: Program) => {
    Alert.alert(
      'Delete Program',
      `Are you sure you want to delete "${prog.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProgram(prog.id);
              setPrograms((prev) => prev.filter((p) => p.id !== prog.id));
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || 'Failed to delete program.');
            }
          },
        },
      ]
    );
  };

  const deptMap = React.useMemo(() => {
    const map = new Map<string, string>();
    departments.forEach((d) => map.set(d.id, d.name));
    return map;
  }, [departments]);

  const filteredPrograms = programs.filter((p) => {
    const matchesDept = selectedDeptId === 'all' || p.departmentId === selectedDeptId;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.level.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.pageTitle}>Academic Programs</Text>
          <Text style={styles.pageSubtitle}>
            {programs.length} programs registered across departments
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setFormError('');
            setModalVisible(true);
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color={Colors.textInverse} />
          <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={16} color={Colors.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search programs..."
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

      {/* Department Filter Pills */}
      <View style={styles.deptFilterWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.deptFilterList}
        >
          <TouchableOpacity
            style={[
              styles.filterPill,
              selectedDeptId === 'all' && styles.filterPillActive,
            ]}
            onPress={() => setSelectedDeptId('all')}
          >
            <Text
              style={[
                styles.filterPillText,
                selectedDeptId === 'all' && styles.filterPillTextActive,
              ]}
            >
              All Departments
            </Text>
          </TouchableOpacity>
          {departments.map((d) => (
            <TouchableOpacity
              key={d.id}
              style={[
                styles.filterPill,
                selectedDeptId === d.id && styles.filterPillActive,
              ]}
              onPress={() => setSelectedDeptId(d.id)}
            >
              <Text
                style={[
                  styles.filterPillText,
                  selectedDeptId === d.id && styles.filterPillTextActive,
                ]}
              >
                {d.code || d.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Programs List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading programs...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.listContent}
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
          {filteredPrograms.length === 0 ? (
            <View style={styles.emptyCard}>
              <Ionicons name="school-outline" size={44} color={Colors.primaryLight} />
              <Text style={styles.emptyTitle}>No Programs Found</Text>
              <Text style={styles.emptySubtext}>
                {searchQuery || selectedDeptId !== 'all'
                  ? 'Try adjusting your filters or search terms.'
                  : 'Get started by creating your first academic program.'}
              </Text>
            </View>
          ) : (
            filteredPrograms.map((p) => {
              const deptName = deptMap.get(p.departmentId) || 'Department';
              const isUG = p.level === 'UG';

              return (
                <View key={p.id} style={styles.programCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardTitleBlock}>
                      <View style={[styles.levelBadge, isUG ? styles.ugBadge : styles.pgBadge]}>
                        <Text style={[styles.levelText, isUG ? styles.ugText : styles.pgText]}>
                          {p.level}
                        </Text>
                      </View>
                      <Text style={styles.progName}>{p.name}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDelete(p)}
                      style={styles.cardActionBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Ionicons name="trash-outline" size={17} color={Colors.textTertiary} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.cardMetaRow}>
                    <View style={styles.metaItem}>
                      <Ionicons name="business-outline" size={13} color={Colors.textTertiary} />
                      <Text style={styles.metaText} numberOfLines={1}>{deptName}</Text>
                    </View>
                    <View style={styles.metaItem}>
                      <Ionicons name="time-outline" size={13} color={Colors.textTertiary} />
                      <Text style={styles.metaText}>{p.durationYears} {p.durationYears === 1 ? 'Year' : 'Years'}</Text>
                    </View>
                  </View>
                </View>
              );
            })
          )}
          <View style={{ height: Spacing['3xl'] }} />
        </ScrollView>
      )}

      {/* Create Program Modal */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Academic Program</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={22} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Department Picker */}
              <Text style={styles.modalLabel}>Department</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.deptChoiceList}>
                {departments.map((d) => (
                  <TouchableOpacity
                    key={d.id}
                    style={[
                      styles.deptChoiceChip,
                      formDeptId === d.id && styles.deptChoiceChipActive,
                    ]}
                    onPress={() => setFormDeptId(d.id)}
                  >
                    <Text
                      style={[
                        styles.deptChoiceText,
                        formDeptId === d.id && styles.deptChoiceTextActive,
                      ]}
                    >
                      {d.code || d.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Program Name */}
              <Text style={styles.modalLabel}>Program Name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. B.Sc Statistics"
                placeholderTextColor={Colors.textTertiary}
                value={formName}
                onChangeText={setFormName}
              />

              {/* Level Segment */}
              <Text style={styles.modalLabel}>Level</Text>
              <View style={styles.levelSegment}>
                {(['UG', 'PG'] as const).map((lvl) => (
                  <TouchableOpacity
                    key={lvl}
                    style={[
                      styles.levelOption,
                      formLevel === lvl && styles.levelOptionActive,
                    ]}
                    onPress={() => {
                      setFormLevel(lvl);
                      setFormDuration(lvl === 'UG' ? '3' : '2');
                    }}
                  >
                    <Text
                      style={[
                        styles.levelOptionText,
                        formLevel === lvl && styles.levelOptionTextActive,
                      ]}
                    >
                      {lvl === 'UG' ? 'Undergraduate (UG)' : 'Postgraduate (PG)'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Duration Years */}
              <Text style={styles.modalLabel}>Duration (Years)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. 3"
                placeholderTextColor={Colors.textTertiary}
                keyboardType="numeric"
                value={formDuration}
                onChangeText={setFormDuration}
              />

              {formError ? (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
                  <Text style={styles.errorText}>{formError}</Text>
                </View>
              ) : null}

              <TouchableOpacity
                style={[styles.saveBtn, submitting && styles.btnDisabled]}
                onPress={handleCreate}
                disabled={submitting}
                activeOpacity={0.8}
              >
                {submitting ? (
                  <ActivityIndicator color={Colors.textInverse} size="small" />
                ) : (
                  <Text style={styles.saveBtnText}>Create Program</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  pageTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  pageSubtitle: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    gap: 4,
  },
  addButtonText: {
    color: Colors.textInverse,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? Spacing.sm : 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  deptFilterWrapper: {
    marginTop: Spacing.sm,
  },
  deptFilterList: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.xs,
  },
  filterPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterPillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterPillText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    color: Colors.textSecondary,
  },
  filterPillTextActive: {
    color: Colors.textInverse,
    fontWeight: FontWeight.bold,
  },
  listContent: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.sm,
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  emptyCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing['3xl'],
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.xl,
  },
  emptyTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.text,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  programCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardTitleBlock: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  levelBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
    marginBottom: Spacing.xs,
  },
  ugBadge: {
    backgroundColor: Colors.infoBg,
  },
  pgBadge: {
    backgroundColor: Colors.primaryBg,
  },
  levelText: {
    fontSize: FontSize.xs - 1,
    fontWeight: FontWeight.bold,
  },
  ugText: {
    color: Colors.info,
  },
  pgText: {
    color: Colors.primary,
  },
  progName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  cardActionBtn: {
    padding: Spacing.xs,
  },
  cardMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginTop: Spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    padding: Spacing.xl,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.text,
  },
  modalLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    marginTop: Spacing.md,
    textTransform: 'uppercase',
  },
  deptChoiceList: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
  },
  deptChoiceChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginRight: Spacing.xs,
    backgroundColor: Colors.background,
  },
  deptChoiceChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  deptChoiceText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
  },
  deptChoiceTextActive: {
    color: Colors.textInverse,
    fontWeight: FontWeight.bold,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: FontSize.sm,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  levelSegment: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    overflow: 'hidden',
  },
  levelOption: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  levelOptionActive: {
    backgroundColor: Colors.primary,
  },
  levelOptionText: {
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  levelOptionTextActive: {
    color: Colors.textInverse,
    fontWeight: FontWeight.bold,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.errorBg,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginTop: Spacing.md,
  },
  errorText: {
    fontSize: FontSize.xs,
    color: Colors.error,
    flex: 1,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.xl,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: Colors.textInverse,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.base,
  },
});
