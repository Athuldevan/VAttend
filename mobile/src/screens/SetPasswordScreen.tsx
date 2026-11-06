import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Fonts, Radius, Spacing } from '../constants/theme';
import { setPassword } from '../api/auth';

export default function SetPasswordScreen({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [setupCode, setSetupCode] = useState('');
  const [password, setPasswordValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const submit = async () => {
    if (!email.trim() || !setupCode.trim() || !password) {
      setErrorMessage('Please fill in all fields.');
      return;
    }
    if (setupCode.trim().length < 4) {
      setErrorMessage('Please enter the 6-digit setup code sent to your email.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setSubmitting(true);

    try {
      await setPassword({
        email: email.trim(),
        setupCode: setupCode.trim(),
        password,
      });
      setSuccessMessage('Password set successfully! You can now sign in.');
    } catch (e: any) {
      setErrorMessage(
        e?.response?.data?.errors?.[0]?.message ||
          e?.response?.data?.message ||
          'Could not activate account. Please check your code and email.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.root}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <TouchableOpacity style={styles.backRow} onPress={onBack}>
            <Ionicons name="arrow-back" size={20} color={Colors.primary} />
            <Text style={styles.backText}>Back to Sign In</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Faculty Activation</Text>
          <Text style={styles.sub}>
            Enter your invited email, the 6-digit setup code sent to your inbox, and create your password.
          </Text>

          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="teacher@example.com"
            placeholderTextColor={Colors.textTertiary}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.label}>6-Digit Setup Code</Text>
          <TextInput
            style={[styles.input, styles.codeInput]}
            placeholder="e.g. 123456"
            placeholderTextColor={Colors.textTertiary}
            value={setupCode}
            onChangeText={setSetupCode}
            keyboardType="number-pad"
            maxLength={6}
          />

          <Text style={styles.label}>New Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Create password"
            placeholderTextColor={Colors.textTertiary}
            value={password}
            onChangeText={setPasswordValue}
            secureTextEntry
          />
          <Text style={styles.note}>Must be at least 8 characters.</Text>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
          {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}

          {successMessage ? (
            <TouchableOpacity style={styles.button} onPress={onBack}>
              <Text style={styles.buttonText}>Go to Sign In</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.button, submitting && styles.disabledButton]}
              onPress={submit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color={Colors.textInverse} />
              ) : (
                <Text style={styles.buttonText}>Activate & Set Password</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.surface,
    padding: Spacing['2xl'],
    borderRadius: Radius.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  backText: {
    fontFamily: Fonts.semibold,
    color: Colors.primary,
    fontSize: FontSize.sm,
    marginLeft: Spacing.xs,
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
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
    lineHeight: 20,
  },
  label: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.semibold,
    color: Colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  codeInput: {
    letterSpacing: 4,
    fontFamily: Fonts.bold,
    fontSize: FontSize.lg,
  },
  note: {
    fontSize: FontSize.xs,
    color: Colors.textTertiary,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSize.sm,
    fontFamily: Fonts.medium,
    marginBottom: Spacing.md,
  },
  successText: {
    color: Colors.success,
    fontSize: FontSize.sm,
    fontFamily: Fonts.semibold,
    marginBottom: Spacing.md,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: Spacing.lg,
    borderRadius: Radius.md,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    fontFamily: Fonts.bold,
    color: Colors.textInverse,
    fontSize: FontSize.base,
  },
});
