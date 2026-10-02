import React, { useState } from 'react';
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
import { Colors, Spacing, Radius, FontSize, FontWeight } from '../constants/theme';
import { createDepartment, type Department } from '../api/departments';

export default function DepartmentsScreen() {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<Department | null>(null);
  const [errors, setErrors] = useState<{ name?: string; code?: string }>({});

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
      setSuccess(response.data);
      setName('');
      setCode('');
      setErrors({});
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 409) setError('A department with this code already exists.');
      else if (status === 403) setError("You don't have permission.");
      else setError(err?.response?.data?.message || 'Failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <Text style={styles.pageTitle}>Departments</Text>
        <Text style={styles.pageSubtitle}>Create and manage academic departments</Text>

        {/* Form Card */}
        <View style={styles.formCard}>
          <View style={styles.formHeader}>
            <View style={styles.formIconCircle}>
              <Ionicons name="add" size={18} color={Colors.primary} />
            </View>
            <Text style={styles.formTitle}>New Department</Text>
          </View>

          {/* Name */}
          <Text style={styles.fieldLabel}>Department Name</Text>
          <TextInput
            style={[styles.textInput, errors.name ? styles.inputError : null]}
            value={name}
            onChangeText={setName}
            placeholder="e.g. Department of Statistics"
            placeholderTextColor={Colors.textTertiary}
          />
          {errors.name && (
            <View style={styles.fieldError}>
              <Ionicons name="alert-circle" size={12} color={Colors.error} />
              <Text style={styles.fieldErrorText}>{errors.name}</Text>
            </View>
          )}
          <Text style={styles.charCount}>{name.length}/100</Text>

          {/* Code */}
          <Text style={styles.fieldLabel}>Department Code</Text>
          <TextInput
            style={[styles.textInput, styles.codeInput, errors.code ? styles.inputError : null]}
            value={code}
            onChangeText={(v) => setCode(v.toUpperCase())}
            placeholder="e.g. STAT"
            placeholderTextColor={Colors.textTertiary}
            autoCapitalize="characters"
          />
          {errors.code ? (
            <View style={styles.fieldError}>
              <Ionicons name="alert-circle" size={12} color={Colors.error} />
              <Text style={styles.fieldErrorText}>{errors.code}</Text>
            </View>
          ) : (
            <Text style={styles.hint}>Letters, numbers, underscores and hyphens. Auto-uppercase.</Text>
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
              <>
                <Ionicons name="add" size={18} color={Colors.textInverse} />
                <Text style={styles.submitText}>Create Department</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Success */}
        {success && (
          <View style={styles.successCard}>
            <View style={styles.successHeader}>
              <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
              <Text style={styles.successTitle}>Created Successfully!</Text>
            </View>
            <Text style={styles.successSubtext}>{success.name} has been added.</Text>

            <View style={styles.detailCard}>
              <DetailRow label="ID" value={success.id} mono />
              <DetailRow label="Name" value={success.name} />
              <DetailRow label="Code" value={success.code} badge />
              <DetailRow label="Created" value={formatDate(success.createdAt)} />
            </View>
          </View>
        )}

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Field Requirements</Text>
          <View style={styles.infoRow}>
            <View style={styles.infoBadge}><Text style={styles.infoBadgeText}>N</Text></View>
            <Text style={styles.infoText}><Text style={styles.infoStrong}>Name</Text> — 2 to 100 characters</Text>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoBadge}><Text style={styles.infoBadgeText}>C</Text></View>
            <Text style={styles.infoText}><Text style={styles.infoStrong}>Code</Text> — 2 to 20, unique per institution</Text>
          </View>
        </View>

        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function DetailRow({ label, value, mono, badge }: { label: string; value: string; mono?: boolean; badge?: boolean }) {
  return (
    <View style={detailStyles.row}>
      <Text style={detailStyles.label}>{label}</Text>
      {badge ? (
        <View style={detailStyles.badge}>
          <Text style={detailStyles.badgeText}>{value}</Text>
        </View>
      ) : (
        <Text style={[detailStyles.value, mono && detailStyles.mono]}>{value}</Text>
      )}
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm },
  label: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold, color: Colors.textTertiary },
  value: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.text },
  mono: { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 10 },
  badge: { backgroundColor: Colors.primaryBg, borderRadius: Radius.sm, paddingHorizontal: Spacing.sm, paddingVertical: 2 },
  badgeText: { fontSize: FontSize.xs, fontWeight: FontWeight.bold, color: Colors.primary, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { padding: Spacing.lg },
  pageTitle: { fontSize: FontSize['2xl'], fontWeight: FontWeight.bold, color: Colors.text },
  pageSubtitle: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2, marginBottom: Spacing.xl },

  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  formHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginBottom: Spacing.xl },
  formIconCircle: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.text },
  fieldLabel: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
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
  codeInput: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: FontWeight.bold,
    letterSpacing: 2,
  },
  inputError: { borderColor: Colors.error, backgroundColor: Colors.errorBg },
  fieldError: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: Spacing.xs },
  fieldErrorText: { fontSize: FontSize.xs, color: Colors.error, fontWeight: FontWeight.medium },
  charCount: { fontSize: FontSize.xs, color: Colors.textTertiary, textAlign: 'right', marginTop: 2 },
  hint: { fontSize: FontSize.xs, color: Colors.textTertiary, marginTop: Spacing.xs },

  apiError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.errorBg,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  apiErrorText: { flex: 1, fontSize: FontSize.sm, color: Colors.error, fontWeight: FontWeight.medium },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    marginTop: Spacing.xl,
  },
  submitDisabled: { opacity: 0.6 },
  submitText: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.textInverse },

  successCard: {
    backgroundColor: Colors.successBg,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  successHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  successTitle: { fontSize: FontSize.base, fontWeight: FontWeight.bold, color: Colors.success },
  successSubtext: { fontSize: FontSize.sm, color: '#15803D', marginTop: 2 },
  detailCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.lg,
    marginTop: Spacing.md,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },

  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: Spacing.xl,
  },
  infoTitle: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.md,
  },
  infoRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm, marginBottom: Spacing.md },
  infoBadge: {
    width: 18,
    height: 18,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBadgeText: { fontSize: 9, fontWeight: FontWeight.bold, color: Colors.primary },
  infoText: { flex: 1, fontSize: FontSize.sm, color: Colors.textSecondary },
  infoStrong: { fontWeight: FontWeight.bold, color: Colors.text },
});
