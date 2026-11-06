import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Fonts, Radius, Spacing } from '../constants/theme';
import { getRegistrationDepartments, type RegistrationDepartment, type RegistrationRole } from '../api/auth';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ onBackToLogin }: { onBackToLogin: () => void }) {
  const { register, registerWithDepartment } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<RegistrationRole>('TEACHER');
  const [departments, setDepartments] = useState<RegistrationDepartment[]>([]);
  const [departmentId, setDepartmentId] = useState('');
  const [creatingDepartment, setCreatingDepartment] = useState(false);
  const [departmentName, setDepartmentName] = useState('');
  const [departmentCode, setDepartmentCode] = useState('');
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    getRegistrationDepartments()
      .then((items) => setDepartments(items))
      .catch(() => setError('Unable to load departments. Please try again.'))
      .finally(() => setLoadingDepartments(false));
  }, []);

  const submit = async () => {
    setFieldErrors({});
    if (!name.trim() || !email.trim() || !password || (!creatingDepartment && !departmentId)) {
      setError('Please complete every field.');
      return;
    }
    if (creatingDepartment && (!departmentName.trim() || !departmentCode.trim())) {
      setError('Enter a department name and code.');
      return;
    }
    if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/.test(password)) {
      setError('Password needs 8 characters, including uppercase, lowercase, and a number.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      if (creatingDepartment) {
        await registerWithDepartment({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          department: { name: departmentName.trim(), code: departmentCode.trim() },
        });
      } else {
        await register({ name: name.trim(), email: email.trim(), password, role, departmentId });
      }
    } catch (err: any) {
      const validationErrors = err?.response?.data?.errors;
      const nextFieldErrors = Array.isArray(validationErrors)
        ? validationErrors.reduce((errors: Record<string, string>, item: { field?: string; message?: string }) => {
            if (item.field && item.message) errors[item.field] = item.message;
            return errors;
          }, {})
        : {};
      setFieldErrors(nextFieldErrors);
      const validationMessage = Array.isArray(validationErrors)
        ? validationErrors.map((item: { message?: string }) => item.message).filter(Boolean).join(' ')
        : '';
      setError(validationMessage || err?.response?.data?.message || 'Could not create the account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <TouchableOpacity style={styles.backButton} onPress={onBackToLogin}>
            <Ionicons name="arrow-back" size={18} color={Colors.primary} />
            <Text style={styles.backText}>Back to sign in</Text>
          </TouchableOpacity>

          <View style={styles.card}>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Register as an Admin or Teacher.</Text>

            <Field label="Full name" value={name} onChangeText={setName} placeholder="Enter full name" error={fieldErrors.name} />
            <Field label="Email address" value={email} onChangeText={setEmail} placeholder="name@example.com" email error={fieldErrors.email} />
            <Field label="Password" value={password} onChangeText={setPassword} placeholder="At least 8 characters" secure error={fieldErrors.password} />

            <Text style={styles.label}>Role</Text>
            <View style={styles.roleRow}>
              {(['TEACHER', 'ADMIN'] as RegistrationRole[]).map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.roleOption, role === item && styles.roleOptionSelected]}
                  onPress={() => {
                    setRole(item);
                    if (item === 'TEACHER') {
                      setCreatingDepartment(false);
                    }
                  }}
                >
                  <Text style={[styles.roleText, role === item && styles.roleTextSelected]}>
                    {item === 'TEACHER' ? 'Teacher' : 'Admin'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Department</Text>
            {role === 'ADMIN' ? (
              <View style={styles.departmentModeRow}>
                <TouchableOpacity
                  style={[styles.modeOption, !creatingDepartment && styles.modeOptionSelected]}
                  onPress={() => setCreatingDepartment(false)}
                >
                  <Text style={[styles.modeText, !creatingDepartment && styles.roleTextSelected]}>Select existing</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modeOption, creatingDepartment && styles.modeOptionSelected]}
                  onPress={() => setCreatingDepartment(true)}
                >
                  <Text style={[styles.modeText, creatingDepartment && styles.roleTextSelected]}>Create new</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.subtitle}>Select the department registered by your HOD / Admin.</Text>
            )}
            {loadingDepartments ? (
              <ActivityIndicator color={Colors.primary} style={styles.departmentLoader} />
            ) : role === 'ADMIN' && creatingDepartment ? (
              <>
                <Field label="Department name" value={departmentName} onChangeText={setDepartmentName} placeholder="e.g. Computer Science" error={fieldErrors['department.name']} />
                <Field label="Department code" value={departmentCode} onChangeText={setDepartmentCode} placeholder="e.g. CS" error={fieldErrors['department.code']} />
              </>
            ) : (
              <View style={styles.departmentList}>
                {departments.map((department) => (
                  <TouchableOpacity
                    key={department.id}
                    style={[styles.departmentOption, departmentId === department.id && styles.departmentOptionSelected]}
                    onPress={() => setDepartmentId(department.id)}
                  >
                    <Text style={[styles.departmentText, departmentId === department.id && styles.roleTextSelected]}>
                      {department.name} ({department.code})
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {error ? <Text style={styles.error}>{error}</Text> : null}
            <TouchableOpacity style={[styles.submit, submitting && styles.disabled]} onPress={submit} disabled={submitting}>
              {submitting ? <ActivityIndicator color={Colors.textInverse} /> : <Text style={styles.submitText}>Create account</Text>}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function Field({ label, value, onChangeText, placeholder, email, secure, error }: {
  label: string; value: string; onChangeText: (value: string) => void; placeholder: string; email?: boolean; secure?: boolean; error?: string;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error && styles.inputInvalid]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.textTertiary}
        keyboardType={email ? 'email-address' : 'default'}
        autoCapitalize={email ? 'none' : 'words'}
        secureTextEntry={secure}
      />
      {error ? <Text style={styles.fieldError}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.gradientStart },
  flex: { flex: 1 },
  content: { flexGrow: 1, justifyContent: 'center', padding: Spacing.xl },
  backButton: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs, marginBottom: Spacing.lg },
  backText: { color: Colors.primary, fontFamily: Fonts.semibold, fontSize: FontSize.sm },
  card: { backgroundColor: Colors.surface, padding: Spacing['2xl'], borderRadius: Radius.xl },
  title: { color: Colors.text, fontFamily: Fonts.bold, fontSize: FontSize['2xl'] },
  subtitle: { color: Colors.textSecondary, fontFamily: Fonts.regular, fontSize: FontSize.sm, marginTop: Spacing.xs, marginBottom: Spacing.xl },
  field: { marginBottom: Spacing.md },
  label: { color: Colors.textSecondary, fontFamily: Fonts.semibold, fontSize: FontSize.xs, marginBottom: Spacing.xs, textTransform: 'uppercase' },
  input: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, backgroundColor: Colors.backgroundAlt, color: Colors.text, fontFamily: Fonts.regular, fontSize: FontSize.base, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  inputInvalid: { borderColor: Colors.error },
  fieldError: { color: Colors.error, fontFamily: Fonts.medium, fontSize: FontSize.xs, marginTop: Spacing.xs },
  roleRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.lg },
  roleOption: { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingVertical: Spacing.md, alignItems: 'center' },
  roleOptionSelected: { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
  roleText: { color: Colors.textSecondary, fontFamily: Fonts.semibold, fontSize: FontSize.sm },
  roleTextSelected: { color: Colors.primary, fontFamily: Fonts.bold },
  departmentModeRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.md },
  modeOption: { flex: 1, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingVertical: Spacing.sm, alignItems: 'center' },
  modeOptionSelected: { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
  modeText: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: FontSize.xs },
  departmentLoader: { alignSelf: 'flex-start', marginBottom: Spacing.lg },
  departmentList: { gap: Spacing.xs, marginBottom: Spacing.lg },
  departmentOption: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, padding: Spacing.md },
  departmentOptionSelected: { backgroundColor: Colors.primaryBg, borderColor: Colors.primary },
  departmentText: { color: Colors.textSecondary, fontFamily: Fonts.medium, fontSize: FontSize.sm },
  error: { color: Colors.error, fontFamily: Fonts.medium, fontSize: FontSize.sm, marginBottom: Spacing.md },
  submit: { alignItems: 'center', backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: Spacing.lg, marginTop: Spacing.sm },
  disabled: { opacity: 0.6 },
  submitText: { color: Colors.textInverse, fontFamily: Fonts.bold, fontSize: FontSize.base },
});
