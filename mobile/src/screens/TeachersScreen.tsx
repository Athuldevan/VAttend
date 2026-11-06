import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Colors, FontSize, Fonts, Radius, Spacing } from '../constants/theme';
import { createTeacher, getTeachers, type TeacherOption } from '../api/users';

export default function TeachersScreen() {
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    getTeachers()
      .then((r) => setTeachers(r.data))
      .catch((e) => console.log('Error loading teachers:', e))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Required Fields', 'Please enter both teacher name and email.');
      return;
    }

    setSubmitting(true);
    try {
      const teacher = await createTeacher({ name: name.trim(), email: email.trim() });
      setName('');
      setEmail('');
      const statusText = teacher.emailSent
        ? `An invitation email was sent to ${teacher.email} with their 6-digit setup code.`
        : `Teacher account created. Setup code: ${teacher.setupCode}`;

      Alert.alert('Teacher Invited Successfully', `${statusText}\n\nSetup Code: ${teacher.setupCode}`);
      load();
    } catch (e: any) {
      Alert.alert(
        'Could not invite teacher',
        e?.response?.data?.errors?.[0]?.message || e?.response?.data?.message || 'Try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.root}>
      <Text style={styles.title}>Faculty Directory</Text>
      <Text style={styles.sub}>
        Invite teachers to your department. An automated invitation email will be sent with their activation setup code.
      </Text>

      <View style={styles.card}>
        <Text style={styles.sectionHeader}>Invite New Faculty</Text>
        <TextInput
          style={styles.input}
          placeholder="Teacher Name (e.g. Dr. Jane Smith)"
          placeholderTextColor={Colors.textTertiary}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Teacher Email (e.g. jane@college.edu)"
          placeholderTextColor={Colors.textTertiary}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TouchableOpacity
          style={[styles.button, submitting && styles.buttonDisabled]}
          onPress={add}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator color={Colors.textInverse} />
          ) : (
            <Text style={styles.buttonText}>Send Invitation Email</Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionHeader, { marginBottom: Spacing.md }]}>Active Faculty ({teachers.length})</Text>

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginVertical: Spacing.xl }} />
      ) : teachers.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>No active teachers found in this department.</Text>
        </View>
      ) : (
        teachers.map((t) => (
          <View key={t.id} style={styles.teacherCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{t.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.teacherInfo}>
              <Text style={styles.teacherName}>{t.name}</Text>
              <Text style={styles.teacherEmail}>{t.email}</Text>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: {
    padding: Spacing.lg,
    backgroundColor: Colors.background,
    paddingBottom: Spacing['3xl'],
  },
  title: {
    fontSize: FontSize['2xl'],
    fontFamily: Fonts.bold,
    color: Colors.text,
  },
  sub: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  sectionHeader: {
    fontSize: FontSize.base,
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  card: {
    padding: Spacing.lg,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    color: Colors.text,
    fontSize: FontSize.base,
    backgroundColor: Colors.surface,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    padding: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: Fonts.bold,
    color: Colors.textInverse,
    fontSize: FontSize.base,
  },
  teacherCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    padding: Spacing.md,
    borderRadius: Radius.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontFamily: Fonts.bold,
    color: Colors.primary,
    fontSize: FontSize.lg,
  },
  teacherInfo: {
    flex: 1,
  },
  teacherName: {
    fontFamily: Fonts.bold,
    color: Colors.text,
    fontSize: FontSize.base,
  },
  teacherEmail: {
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    fontSize: FontSize.sm,
    marginTop: 2,
  },
  emptyState: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  emptyStateText: {
    fontFamily: Fonts.regular,
    color: Colors.textTertiary,
    fontSize: FontSize.sm,
  },
});
