import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, Fonts } from '../constants/theme';
import { createDepartment, getDepartments, type Department } from '../api/departments';
import { useAuth } from '../context/AuthContext';

export default function DepartmentsScreen() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; code?: string }>({});

  const loadDepartments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getDepartments();
      setDepartments(res.data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!name.trim() || name.trim().length < 2) e.name = 'Min 2 characters.';
    else if (name.trim().length > 100) e.name = 'Max 100 characters.';
    if (!code.trim() || code.trim().length < 2) e.code = 'Min 2 characters.';
    else if (code.trim().length > 20) e.code = 'Max 20 characters.';
    else if (!/^[A-Za-z0-9_-]+$/.test(code.trim())) e.code = 'Letters, numbers, _ and - only.';
    setErrors(e);
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
        code: code.trim(),
      });
      setSuccess(`Department "${response.data.name}" created successfully!`);
      setName('');
      setCode('');
      setErrors({});
      setShowAddForm(false);
      await loadDepartments();
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) setError('A department with this code already exists.');
      else if (status === 403) setError("Only administrators have permission to create departments.");
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
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.pageTitle}>Department Directory</Text>
            <Text style={styles.pageSubtitle}>
              {isAdmin
                ? 'Your assigned department and institution branches'
                : 'Your department details'}
            </Text>
          </View>
          {isAdmin && !showAddForm && (
            <TouchableOpacity
              style={styles.addToggleBtn}
              onPress={() => setShowAddForm(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.addToggleText}>New Dept</Text>
            </TouchableOpacity>
          )}
        </View>

        {success && (
          <View style={styles.alertSuccess}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={styles.alertSuccessText}>{success}</Text>
          </View>
        )}

        {/* Add Department Form (Only for Admins who explicitly click New Dept) */}
        {isAdmin && showAddForm && (
          <View style={styles.formCard}>
            <View style={styles.formHeader}>
              <View style={styles.formIconCircle}>
                <Ionicons name="business" size={18} color={Colors.primary} />
              </View>
              <Text style={styles.formTitle}>Add New Department</Text>
              <TouchableOpacity
                style={styles.closeBtn}
                onPress={() => {
                  setShowAddForm(false);
                  setError(null);
                }}
              >
                <Ionicons name="close" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Name */}
            <Text style={styles.fieldLabel}>Department Name</Text>
            <TextInput
              style={[styles.textInput, errors.name ? styles.inputError : null]}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Computer Science"
              placeholderTextColor={Colors.textTertiary}
            />
            {errors.name && (
              <View style={styles.fieldError}>
                <Ionicons name="alert-circle" size={12} color={Colors.error} />
                <Text style={styles.fieldErrorText}>{errors.name}</Text>
              </View>
            )}

            {/* Code */}
            <Text style={styles.fieldLabel}>Department Code</Text>
            <TextInput
              style={[styles.textInput, styles.codeInput, errors.code ? styles.inputError : null]}
              value={code}
              onChangeText={(v) => setCode(v.toUpperCase())}
              placeholder="e.g. CS"
              placeholderTextColor={Colors.textTertiary}
              autoCapitalize="characters"
            />
            {errors.code ? (
              <View style={styles.fieldError}>
                <Ionicons name="alert-circle" size={12} color={Colors.error} />
                <Text style={styles.fieldErrorText}>{errors.code}</Text>
              </View>
            ) : (
              <Text style={styles.hint}>Unique short code for roll calls and courses.</Text>
            )}

            {/* API Error */}
            {error && (
              <View style={styles.apiError}>
                <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
                <Text style={styles.apiErrorText}>{error}</Text>
              </View>
            )}

            {/* Submit */}
            <TouchableOpacity
              style={[styles.submitBtn, submitting && styles.submitDisabled]}
              onPress={handleSubmit}
              disabled={submitting}
              activeOpacity={0.8}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={Colors.textInverse} />
              ) : (
                <Text style={styles.submitText}>Save Department</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* List of Departments */}
        <Text style={styles.sectionTitle}>Registered Departments ({departments.length})</Text>

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginVertical: Spacing.xl }} />
        ) : departments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="business-outline" size={36} color={Colors.textTertiary} />
            <Text style={styles.emptyTitle}>No departments found</Text>
            <Text style={styles.emptySub}>
              {isAdmin
                ? 'Create your first department using the button above.'
                : 'Contact your administrator to configure a department.'}
            </Text>
          </View>
        ) : (
          departments.map((dept) => {
            const isMyDept = user?.departmentId === dept.id;
            return (
              <View
                key={dept.id}
                style={[styles.deptCard, isMyDept && styles.myDeptCard]}
              >
                <View style={styles.deptIconBadge}>
                  <Ionicons name="business" size={20} color={isMyDept ? Colors.primary : Colors.textSecondary} />
                </View>
                <View style={styles.deptContent}>
                  <View style={styles.deptTopRow}>
                    <Text style={styles.deptName}>{dept.name}</Text>
                    <View style={[styles.codeBadge, isMyDept && styles.myCodeBadge]}>
                      <Text style={[styles.codeBadgeText, isMyDept && styles.myCodeBadgeText]}>{dept.code}</Text>
                    </View>
                  </View>
                  {isMyDept && (
                    <View style={styles.hodBadge}>
                      <Ionicons name="shield-checkmark" size={12} color={Colors.primary} />
                      <Text style={styles.hodBadgeText}>Your HOD Department</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })
        )}

        <View style={{ height: Spacing['3xl'] }} />
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
    padding: Spacing.lg,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  pageTitle: {
    fontSize: FontSize['2xl'],
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  pageSubtitle: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
  },
  addToggleText: {
    fontFamily: Fonts.semibold,
    color: '#fff',
    fontSize: FontSize.xs,
    marginLeft: 4,
  },
  alertSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.greenBg,
    padding: Spacing.md,
    borderRadius: Radius.md,
    marginBottom: Spacing.md,
  },
  alertSuccessText: {
    fontFamily: Fonts.medium,
    color: Colors.success,
    fontSize: FontSize.sm,
    marginLeft: Spacing.xs,
  },
  sectionTitle: {
    fontSize: FontSize.base,
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
  },
  deptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  myDeptCard: {
    borderColor: Colors.primary,
    backgroundColor: '#FAF5FF',
  },
  deptIconBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  deptContent: {
    flex: 1,
  },
  deptTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deptName: {
    fontFamily: Fonts.bold,
    color: Colors.text,
    fontSize: FontSize.base,
    flex: 1,
    marginRight: Spacing.sm,
  },
  codeBadge: {
    backgroundColor: Colors.surfaceSecondary,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.sm,
  },
  codeBadgeText: {
    fontFamily: Fonts.bold,
    color: Colors.textSecondary,
    fontSize: FontSize.xs,
  },
  myCodeBadge: {
    backgroundColor: Colors.primaryBg,
  },
  myCodeBadgeText: {
    color: Colors.primary,
  },
  hodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  hodBadgeText: {
    fontFamily: Fonts.semibold,
    color: Colors.primary,
    fontSize: FontSize.xs,
    marginLeft: 4,
  },
  formCard: {
    backgroundColor: Colors.surface,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  formHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  formIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  formTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.base,
    color: Colors.text,
    flex: 1,
  },
  closeBtn: {
    padding: 4,
  },
  fieldLabel: {
    fontFamily: Fonts.semibold,
    fontSize: FontSize.xs,
    color: Colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    fontSize: FontSize.base,
    color: Colors.text,
    backgroundColor: Colors.surface,
    marginBottom: Spacing.sm,
  },
  codeInput: {
    fontFamily: Fonts.bold,
    letterSpacing: 1,
  },
  inputError: {
    borderColor: Colors.error,
  },
  fieldError: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  fieldErrorText: {
    fontFamily: Fonts.medium,
    color: Colors.error,
    fontSize: FontSize.xs,
    marginLeft: 4,
  },
  hint: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginBottom: Spacing.sm,
  },
  apiError: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    marginBottom: Spacing.md,
  },
  apiErrorText: {
    fontFamily: Fonts.medium,
    color: Colors.error,
    fontSize: FontSize.xs,
    marginLeft: 4,
  },
  submitBtn: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitText: {
    fontFamily: Fonts.bold,
    color: Colors.textInverse,
    fontSize: FontSize.base,
  },
  emptyCard: {
    padding: Spacing['2xl'],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: Spacing.md,
  },
  emptyTitle: {
    fontFamily: Fonts.bold,
    fontSize: FontSize.base,
    color: Colors.text,
    marginTop: Spacing.md,
  },
  emptySub: {
    fontFamily: Fonts.regular,
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: 4,
  },
});
