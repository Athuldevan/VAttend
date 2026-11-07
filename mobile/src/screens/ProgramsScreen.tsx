import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, Fonts } from '../constants/theme';
import {
  getPrograms,
  createProgram,
  deleteProgram,
  type Program,
  type CreateProgramPayload,
} from '../api/programs';
import { getDepartments, type Department } from '../api/departments';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Tag from '../components/Tag';
import Sheet from '../components/Sheet';
import SegmentedControl from '../components/SegmentedControl';
import SkeletonList from '../components/Skeleton';

interface ProgramsScreenProps {
  onBack?: () => void;
}

export default function ProgramsScreen({ onBack }: ProgramsScreenProps) {
  const { user } = useAuth();
  const isHOD = user?.role === 'ADMIN';

  const [programs, setPrograms] = useState<Program[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Sheet State
  const [sheetVisible, setSheetVisible] = useState(false);
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
        getDepartments().catch(() => ({ data: [] })),
      ]);
      setPrograms(progRes.data || []);
      const depts = deptRes.data || [];
      setDepartments(depts);
      if (depts.length > 0 && !formDeptId) {
        setFormDeptId(depts[0].id);
      }
    } catch {
      // keep
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
      setSheetVisible(false);
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
      `Are you sure you want to delete ${prog.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProgram(prog.id);
              fetchData();
            } catch (err: any) {
              Alert.alert('Error', err?.response?.data?.message || 'Could not delete program');
            }
          },
        },
      ]
    );
  };

  // Filtered Programs
  const filtered = programs.filter((p) => {
    const matchesDept =
      selectedDeptId === 'all' ||
      (typeof p.departmentId === 'object'
        ? (p.departmentId as any)._id === selectedDeptId
        : p.departmentId === selectedDeptId);

    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.level.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesDept && matchesSearch;
  });

  return (
    <View style={styles.container}>
      <ScrollView
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
          <View>
            <Text style={styles.title}>Programs</Text>
            <Text style={styles.subtitle}>
              Academic degrees & curricula ({filtered.length} visible)
            </Text>
          </View>
          {isHOD ? (
            <Button
              title="New program"
              onPress={() => {
                setFormError('');
                setSheetVisible(true);
              }}
              size="sm"
              icon={<Ionicons name="add" size={18} color="#FFFFFF" />}
              fullWidth={false}
            />
          ) : null}
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={Colors.muted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search programs..."
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

        {/* Department Filter Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsScroll}
        >
          <TouchableOpacity
            style={[
              styles.filterChip,
              selectedDeptId === 'all' && styles.filterChipActive,
            ]}
            onPress={() => setSelectedDeptId('all')}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedDeptId === 'all' && styles.filterChipTextActive,
              ]}
            >
              All Departments
            </Text>
          </TouchableOpacity>
          {departments.map((d) => {
            const isSelected = selectedDeptId === d.id;
            return (
              <TouchableOpacity
                key={d.id}
                style={[
                  styles.filterChip,
                  isSelected && styles.filterChipActive,
                ]}
                onPress={() => setSelectedDeptId(d.id)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isSelected && styles.filterChipTextActive,
                  ]}
                >
                  {d.code || d.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Programs List */}
        {loading ? (
          <SkeletonList count={5} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No programs found</Text>
            <Text style={styles.emptySub}>
              {searchQuery
                ? 'No programs match your search criteria.'
                : 'No programs registered in this department.'}
            </Text>
          </View>
        ) : (
          <View style={styles.listCard}>
            {filtered.map((prog, index) => {
              const isLast = index === filtered.length - 1;
              const deptName =
                typeof prog.departmentId === 'object'
                  ? (prog.departmentId as any).name || (prog.departmentId as any).code
                  : 'Dept';

              return (
                <View key={prog.id}>
                  <View style={styles.programRow}>
                    <View style={styles.programInfo}>
                      <View style={styles.programTitleRow}>
                        <Text style={styles.programName}>{prog.name}</Text>
                        <Tag
                          label={prog.level}
                          variant={prog.level === 'PG' ? 'brand' : 'neutral'}
                        />
                      </View>
                      <Text style={styles.programMeta}>
                        {deptName} · {prog.durationYears} {prog.durationYears === 1 ? 'Year' : 'Years'}
                      </Text>
                    </View>

                    {isHOD ? (
                      <TouchableOpacity
                        onPress={() => handleDelete(prog)}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        style={styles.deleteBtn}
                      >
                        <Ionicons name="trash-outline" size={16} color={Colors.absent} />
                      </TouchableOpacity>
                    ) : null}
                  </View>
                  {!isLast ? <View style={styles.divider} /> : null}
                </View>
              );
            })}
          </View>
        )}

        {/* New Program Sheet */}
        <Sheet
          visible={sheetVisible}
          onClose={() => setSheetVisible(false)}
          title="New Program"
          subtitle="Add an academic degree program"
        >
          <ScrollView style={styles.sheetScroll} showsVerticalScrollIndicator={false}>
            {formError ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={Colors.absent} />
                <Text style={styles.errorText}>{formError}</Text>
              </View>
            ) : null}

            <Input
              label="Program name"
              value={formName}
              onChangeText={(t) => {
                setFormName(t);
                if (formError) setFormError('');
              }}
              placeholder="e.g. B.Sc Computer Science"
            />

            <Text style={styles.fieldLabel}>ACADEMIC LEVEL</Text>
            <SegmentedControl
              options={[
                { value: 'UG', label: 'Undergraduate (UG)' },
                { value: 'PG', label: 'Postgraduate (PG)' },
              ]}
              value={formLevel}
              onChange={(lvl) => setFormLevel(lvl as 'UG' | 'PG')}
            />

            <View style={{ marginTop: Spacing.md }}>
              <Input
                label="Duration in years"
                value={formDuration}
                onChangeText={setFormDuration}
                keyboardType="number-pad"
                placeholder="e.g. 3"
              />
            </View>

            <Text style={styles.fieldLabel}>DEPARTMENT</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.chipsScroll}
            >
              {departments.map((d) => {
                const selected = formDeptId === d.id;
                return (
                  <TouchableOpacity
                    key={d.id}
                    style={[styles.filterChip, selected && styles.filterChipActive]}
                    onPress={() => setFormDeptId(d.id)}
                  >
                    <Text
                      style={[
                        styles.filterChipText,
                        selected && styles.filterChipTextActive,
                      ]}
                    >
                      {d.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={{ marginTop: Spacing.md }}>
              <Button
                title="Create Program"
                onPress={handleCreate}
                loading={submitting}
              />
            </View>
          </ScrollView>
        </Sheet>

        <View style={{ height: Spacing['2xl'] }} />
      </ScrollView>
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
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.muted,
    marginTop: 2,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.base,
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.ink,
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
  listCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.base,
    overflow: 'hidden',
  },
  programRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 56,
  },
  programInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  programTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  programName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.base,
    color: Colors.ink,
  },
  programMeta: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.muted,
    marginTop: 2,
  },
  deleteBtn: {
    padding: Spacing.xs,
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
  },
  sheetScroll: {
    maxHeight: 460,
  },
  fieldLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.muted,
    letterSpacing: 0.6,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
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
