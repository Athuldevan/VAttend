import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Fonts, Radius, Spacing } from '../constants/theme';
import {
  getRegistrationDepartments,
  type RegistrationDepartment,
  type RegistrationRole,
} from '../api/auth';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import SegmentedControl from '../components/SegmentedControl';
import Tag from '../components/Tag';

export default function RegisterScreen({
  onBackToLogin,
}: {
  onBackToLogin: () => void;
}) {
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
    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      (!creatingDepartment && !departmentId)
    ) {
      setError('Please complete every field.');
      return;
    }
    if (
      creatingDepartment &&
      (!departmentName.trim() || !departmentCode.trim())
    ) {
      setError('Enter a department name and code.');
      return;
    }
    if (!/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).{8,}$/.test(password)) {
      setError(
        'Password needs 8+ characters, including upper and lower case and a number.'
      );
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
          department: {
            name: departmentName.trim(),
            code: departmentCode.trim().toUpperCase(),
          },
        });
      } else {
        await register({
          name: name.trim(),
          email: email.trim(),
          password,
          role,
          departmentId,
        });
      }
    } catch (err: any) {
      const validationErrors = err?.response?.data?.errors;
      const nextFieldErrors = Array.isArray(validationErrors)
        ? validationErrors.reduce(
            (
              errors: Record<string, string>,
              item: { field?: string; message?: string }
            ) => {
              if (item.field && item.message) errors[item.field] = item.message;
              return errors;
            },
            {}
          )
        : {};
      setFieldErrors(nextFieldErrors);
      const validationMessage = Array.isArray(validationErrors)
        ? validationErrors
            .map((item: { message?: string }) => item.message)
            .filter(Boolean)
            .join(' ')
        : '';
      setError(
        validationMessage ||
          err?.response?.data?.message ||
          'Could not create the account.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBackToLogin}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={18} color={Colors.brand} />
            <Text style={styles.backText}>Sign in</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.institution}>VICTORIA COLLEGE PALAKKAD</Text>
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>
              Register as Teacher or Department Head (HOD)
            </Text>
          </View>

          <View style={styles.card}>
            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={Colors.absent} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Input
              label="Full name"
              value={name}
              onChangeText={(t) => {
                setName(t);
                if (error) setError('');
              }}
              placeholder="e.g. Dr. Rajesh K"
              error={fieldErrors.name}
            />

            <Input
              label="Email address"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (error) setError('');
              }}
              placeholder="name@victoriacollege.edu.in"
              keyboardType="email-address"
              autoCapitalize="none"
              error={fieldErrors.email}
            />

            <Input
              label="Password"
              value={password}
              onChangeText={(t) => {
                setPassword(t);
                if (error) setError('');
              }}
              placeholder="Min 8 characters"
              secureTextEntry
              hint="Hint: 8+ characters with uppercase, lowercase, and a number"
              error={fieldErrors.password}
            />

            {/* Role Segmented */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>ROLE</Text>
              <SegmentedControl
                options={[
                  { value: 'TEACHER', label: 'Teacher' },
                  { value: 'ADMIN', label: 'HOD' },
                ]}
                value={role}
                onChange={(newRole) => {
                  setRole(newRole as RegistrationRole);
                  if (newRole === 'TEACHER') {
                    setCreatingDepartment(false);
                  }
                }}
              />
            </View>

            {/* Department Section */}
            <View style={styles.section}>
              <View style={styles.deptHeaderRow}>
                <Text style={styles.sectionLabel}>DEPARTMENT</Text>
                {role === 'ADMIN' ? (
                  <View style={styles.deptToggleRow}>
                    <TouchableOpacity
                      onPress={() => setCreatingDepartment(false)}
                      style={[
                        styles.togglePill,
                        !creatingDepartment && styles.togglePillActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.toggleText,
                          !creatingDepartment && styles.toggleTextActive,
                        ]}
                      >
                        Select existing
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setCreatingDepartment(true)}
                      style={[
                        styles.togglePill,
                        creatingDepartment && styles.togglePillActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.toggleText,
                          creatingDepartment && styles.toggleTextActive,
                        ]}
                      >
                        Create new
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>

              {loadingDepartments ? (
                <View style={styles.loaderWrap}>
                  <ActivityIndicator size="small" color={Colors.brand} />
                  <Text style={styles.loaderText}>Loading departments...</Text>
                </View>
              ) : role === 'ADMIN' && creatingDepartment ? (
                <View style={styles.newDeptBox}>
                  <Input
                    label="Department name"
                    value={departmentName}
                    onChangeText={setDepartmentName}
                    placeholder="e.g. Computer Science"
                    error={fieldErrors['department.name']}
                  />
                  <Input
                    label="Department code"
                    value={departmentCode}
                    onChangeText={setDepartmentCode}
                    placeholder="e.g. CS"
                    autoCapitalize="characters"
                    error={fieldErrors['department.code']}
                  />
                </View>
              ) : (
                <View style={styles.deptList}>
                  {departments.length === 0 ? (
                    <Text style={styles.emptyText}>
                      No existing departments found.
                    </Text>
                  ) : (
                    departments.map((dept) => {
                      const isSelected = departmentId === dept.id;
                      return (
                        <TouchableOpacity
                          key={dept.id}
                          style={[
                            styles.deptRow,
                            isSelected && styles.deptRowSelected,
                          ]}
                          onPress={() => setDepartmentId(dept.id)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.deptInfo}>
                            <Text
                              style={[
                                styles.deptName,
                                isSelected && styles.deptNameSelected,
                              ]}
                            >
                              {dept.name}
                            </Text>
                            <Text style={styles.deptCode}>({dept.code})</Text>
                          </View>
                          {isSelected ? (
                            <Tag label="Selected" variant="brand" />
                          ) : null}
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              )}
            </View>

            <View style={styles.submitWrap}>
              <Button
                title="Create account"
                onPress={submit}
                loading={submitting}
                disabled={
                  !name.trim() ||
                  !email.trim() ||
                  !password ||
                  (!creatingDepartment && !departmentId)
                }
                disabledReason={
                  !name.trim() || !email.trim() || !password
                    ? 'Fill in required fields'
                    : !creatingDepartment && !departmentId
                    ? 'Select a department'
                    : undefined
                }
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing['2xl'],
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.lg,
    alignSelf: 'flex-start',
  },
  backText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.sm,
    color: Colors.brand,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  institution: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.muted,
    letterSpacing: 1.2,
    marginBottom: Spacing.xs,
  },
  title: {
    fontFamily: Fonts.heading,
    fontSize: FontSize['3xl'],
    color: Colors.ink,
    lineHeight: 38,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.muted,
  },
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.base,
    padding: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  sectionLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.muted,
    letterSpacing: 0.6,
    marginBottom: Spacing.xs,
  },
  deptHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  deptToggleRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  togglePill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.base,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  togglePillActive: {
    backgroundColor: Colors.brand,
    borderColor: Colors.brand,
  },
  toggleText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.muted,
  },
  toggleTextActive: {
    color: '#FFFFFF',
    fontFamily: Fonts.bodySemiBold,
  },
  loaderWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  loaderText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.muted,
  },
  newDeptBox: {
    marginTop: Spacing.xs,
  },
  deptList: {
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.base,
    overflow: 'hidden',
    backgroundColor: Colors.surface,
  },
  deptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.line,
    minHeight: 44,
  },
  deptRowSelected: {
    backgroundColor: '#F7F9FC',
  },
  deptInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  deptName: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.ink,
  },
  deptNameSelected: {
    fontFamily: Fonts.bodySemiBold,
    color: Colors.brand,
  },
  deptCode: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.muted,
  },
  emptyText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.muted,
    padding: Spacing.md,
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
  submitWrap: {
    marginTop: Spacing.sm,
  },
});
