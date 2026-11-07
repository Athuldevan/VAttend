import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, Fonts } from '../constants/theme';
import { createDepartment, getDepartments, type Department } from '../api/departments';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Tag from '../components/Tag';
import SkeletonList from '../components/Skeleton';

interface DepartmentsScreenProps {
  onBack?: () => void;
}

export default function DepartmentsScreen({ onBack }: DepartmentsScreenProps) {
  const { user } = useAuth();
  const isHOD = user?.role === 'ADMIN';

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; code?: string }>({});

  const loadDepartments = useCallback(async () => {
    try {
      const res = await getDepartments();
      setDepartments(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadDepartments();
  }, [loadDepartments]);

  const validate = (): boolean => {
    const e: typeof fieldErrors = {};
    if (!name.trim() || name.trim().length < 2) e.name = 'Min 2 characters required.';
    if (!code.trim() || code.trim().length < 2) e.code = 'Min 2 characters required.';
    else if (!/^[A-Za-z0-9_-]+$/.test(code.trim())) e.code = 'Letters, numbers, _ and - only.';
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      const response = await createDepartment({
        name: name.trim(),
        code: code.trim().toUpperCase(),
      });
      setSuccess(`Department "${response.data.name}" registered successfully.`);
      setName('');
      setCode('');
      setFieldErrors({});
      loadDepartments();
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) setError('A department with this code already exists.');
      else if (status === 403) setError('Only HODs have permission to create departments.');
      else setError(err?.response?.data?.message || 'Failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
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
        <View style={styles.header}>
          <Text style={styles.title}>Departments</Text>
          <Text style={styles.subtitle}>
            Academic department directory ({departments.length} registered)
          </Text>
        </View>

        {/* 1. LIST OF EXISTING DEPARTMENTS WITH CODE TAGS */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Existing Departments</Text>
          <Tag label={`${departments.length} active`} variant="neutral" />
        </View>

        {loading ? (
          <SkeletonList count={4} />
        ) : departments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No departments registered yet.</Text>
          </View>
        ) : (
          <View style={styles.listCard}>
            {departments.map((dept, index) => {
              const isLast = index === departments.length - 1;
              const isUserDept = user?.departmentId === dept.id;

              return (
                <View key={dept.id}>
                  <View style={styles.deptRow}>
                    <View style={styles.deptMain}>
                      <View style={styles.deptTitleRow}>
                        <Text style={styles.deptName}>{dept.name}</Text>
                        {isUserDept ? (
                          <Tag label="Your Dept" variant="brand" />
                        ) : null}
                      </View>
                      <Text style={styles.deptSub}>
                        {(dept as any).hod
                          ? `HOD: ${typeof (dept as any).hod === 'object' ? (dept as any).hod.name : 'Assigned'}`
                          : 'No HOD assigned'}
                      </Text>
                    </View>
                    <Tag label={dept.code} variant="neutral" />
                  </View>
                  {!isLast ? <View style={styles.divider} /> : null}
                </View>
              );
            })}
          </View>
        )}

        {/* 2. ADD DEPARTMENT FORM (HOD Only) */}
        {isHOD ? (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Register New Department</Text>
            <Text style={styles.formSubtitle}>
              Only HOD accounts can add department entities.
            </Text>

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

            <Input
              label="Department name"
              value={name}
              onChangeText={(t) => {
                setName(t);
                if (error) setError(null);
                if (success) setSuccess(null);
              }}
              placeholder="e.g. Physics"
              error={fieldErrors.name}
            />

            <Input
              label="Department code"
              value={code}
              onChangeText={(t) => {
                setCode(t);
                if (error) setError(null);
                if (success) setSuccess(null);
              }}
              placeholder="e.g. PHY"
              autoCapitalize="characters"
              error={fieldErrors.code}
            />

            <Button
              title="Add Department"
              onPress={handleSubmit}
              loading={submitting}
              disabled={!name.trim() || !code.trim()}
              disabledReason={
                !name.trim() || !code.trim() ? 'Enter name and code' : undefined
              }
            />
          </View>
        ) : null}

        <View style={{ height: Spacing['2xl'] }} />
      </ScrollView>
    </KeyboardAvoidingView>
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
    marginBottom: Spacing.xl,
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
  deptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 56,
  },
  deptMain: {
    flex: 1,
    marginRight: Spacing.md,
  },
  deptTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  deptName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.base,
    color: Colors.ink,
  },
  deptSub: {
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
  emptyText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.muted,
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
