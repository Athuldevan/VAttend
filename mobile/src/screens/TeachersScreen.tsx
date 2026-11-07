import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Text,
  TouchableOpacity,
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Fonts, Radius, Spacing } from '../constants/theme';
import { createTeacher, getTeachers, type TeacherOption } from '../api/users';
import { useAuth } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Tag from '../components/Tag';
import SkeletonList from '../components/Skeleton';

interface TeachersScreenProps {
  onBack?: () => void;
}

export default function TeachersScreen({ onBack }: TeachersScreenProps) {
  const { user } = useAuth();
  const isHOD = user?.role === 'ADMIN';

  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    getTeachers()
      .then((r) => setTeachers(r.data || []))
      .catch(() => setTeachers([]))
      .finally(() => {
        setLoading(false);
        setRefreshing(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  const handleInvite = async () => {
    if (!name.trim() || !email.trim()) {
      Alert.alert('Required Fields', 'Please enter both faculty name and email address.');
      return;
    }

    setSubmitting(true);
    try {
      const teacher = await createTeacher({ name: name.trim(), email: email.trim() });
      setName('');
      setEmail('');
      const statusText = teacher.emailSent
        ? `An invitation email was sent to ${teacher.email} with their 6-digit setup code.`
        : `Faculty account created. Setup code: ${teacher.setupCode}`;

      Alert.alert('Faculty Invited Successfully', `${statusText}\n\nSetup Code: ${teacher.setupCode}`);
      load();
    } catch (e: any) {
      Alert.alert(
        'Could not invite faculty',
        e?.response?.data?.errors?.[0]?.message ||
          e?.response?.data?.message ||
          'Please verify the details and try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const getInitials = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return fullName.slice(0, 2).toUpperCase() || 'FA';
  };

  return (
    <ScrollView
      style={styles.container}
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
      <View style={styles.header}>
        <Text style={styles.title}>Faculty</Text>
        <Text style={styles.subtitle}>
          Teachers directory and automated invitation portal
        </Text>
      </View>

      {/* Invite Form (HOD only) */}
      {isHOD ? (
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Invite New Faculty</Text>
          <Text style={styles.formSubtitle}>
            Send an activation email with a 6-digit setup code for self-onboarding.
          </Text>

          <Input
            label="Faculty name"
            placeholder="e.g. Dr. Priya Raman"
            value={name}
            onChangeText={setName}
          />

          <Input
            label="Email address"
            placeholder="e.g. priya@victoriacollege.edu.in"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Button
            title="Send Invitation"
            onPress={handleInvite}
            loading={submitting}
            disabled={!name.trim() || !email.trim()}
            disabledReason={!name.trim() || !email.trim() ? 'Enter name and email' : undefined}
          />
        </View>
      ) : null}

      {/* Active Faculty List */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>
          Active Faculty ({teachers.length})
        </Text>
        <Tag label={`${teachers.length} members`} variant="neutral" />
      </View>

      {loading ? (
        <SkeletonList count={4} />
      ) : teachers.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No faculty members yet</Text>
          <Text style={styles.emptySub}>
            Faculty invited by the HOD will appear here once registered.
          </Text>
        </View>
      ) : (
        <View style={styles.listCard}>
          {teachers.map((teacher, index) => {
            const isLast = index === teachers.length - 1;
            const initials = getInitials(teacher.name);

            return (
              <View key={teacher.id}>
                <View style={styles.teacherRow}>
                  {/* Initial avatar */}
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{initials}</Text>
                  </View>

                  <View style={styles.teacherInfo}>
                    <Text style={styles.teacherName}>{teacher.name}</Text>
                    <Text style={styles.teacherEmail}>{teacher.email}</Text>
                  </View>

                  <Tag label="Active" variant="present" />
                </View>
                {!isLast ? <View style={styles.divider} /> : null}
              </View>
            );
          })}
        </View>
      )}

      <View style={{ height: Spacing['2xl'] }} />
    </ScrollView>
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
  formCard: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.base,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
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
  },
  teacherRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: 56,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: Radius.base,
    backgroundColor: Colors.tintNeutral,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.ink,
  },
  teacherInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  teacherName: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.base,
    color: Colors.ink,
  },
  teacherEmail: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.muted,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.line,
    marginLeft: Spacing.lg + 38 + Spacing.md,
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
});
