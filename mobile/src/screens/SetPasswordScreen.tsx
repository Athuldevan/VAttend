import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Fonts, Radius, Spacing } from '../constants/theme';
import { setPassword } from '../api/auth';
import Input from '../components/Input';
import Button from '../components/Button';

export default function SetPasswordScreen({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [password, setPasswordValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const inputRefs = useRef<Array<any>>([]);

  const handleDigitChange = (val: string, index: number) => {
    const clean = val.replace(/[^0-9]/g, '');
    const newDigits = [...digits];

    if (clean.length > 1) {
      // Pasting full code
      const pasted = clean.slice(0, 6).split('');
      pasted.forEach((d, i) => {
        if (i < 6) newDigits[i] = d;
      });
      setDigits(newDigits);
      const nextFocus = Math.min(pasted.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    newDigits[index] = clean;
    setDigits(newDigits);

    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const codeString = digits.join('');

  const submit = async () => {
    if (!email.trim() || codeString.length < 6 || !password) {
      setErrorMessage('Please fill in all fields including the 6-digit code.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }

    setErrorMessage('');
    setSubmitting(true);

    try {
      await setPassword({
        email: email.trim(),
        setupCode: codeString,
        password,
      });
      setIsSuccess(true);
    } catch (e: any) {
      setErrorMessage(
        e?.response?.data?.errors?.[0]?.message ||
          e?.response?.data?.message ||
          'Could not activate account. Please check your code and email.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <View style={styles.root}>
        <View style={styles.successCard}>
          <View style={styles.successIconBadge}>
            <Ionicons name="checkmark-sharp" size={32} color={Colors.present} />
          </View>
          <Text style={styles.successTitle}>Account Activated</Text>
          <Text style={styles.successSub}>
            Your faculty password has been successfully configured. You can now sign in with your email and password.
          </Text>
          <Button
            title="Go to sign in"
            onPress={onBack}
            style={styles.successBtn}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={onBack}
            activeOpacity={0.7}
          >
            <Ionicons name="chevron-back" size={18} color={Colors.brand} />
            <Text style={styles.backText}>Sign in</Text>
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.institution}>VICTORIA COLLEGE PALAKKAD</Text>
            <Text style={styles.title}>Activate account</Text>
            <Text style={styles.subtitle}>
              Enter your invited email, setup code, and choose a new password.
            </Text>
          </View>

          <View style={styles.card}>
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={16} color={Colors.absent} />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            <Input
              label="Email address"
              placeholder="e.g. teacher@victoriacollege.edu.in"
              value={email}
              onChangeText={(t) => {
                setEmail(t);
                if (errorMessage) setErrorMessage('');
              }}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            {/* 6 separate code boxes */}
            <View style={styles.codeSection}>
              <Text style={styles.codeLabel}>6-DIGIT SETUP CODE</Text>
              <View style={styles.codeBoxesRow}>
                {digits.map((digit, idx) => (
                  <TextInput
                    key={idx}
                    ref={(el) => {
                      inputRefs.current[idx] = el;
                    }}
                    style={[
                      styles.codeBox,
                      Boolean(digit) && styles.codeBoxFilled,
                    ]}
                    value={digit}
                    onChangeText={(val) => handleDigitChange(val, idx)}
                    onKeyPress={(e) => handleKeyPress(e, idx)}
                    keyboardType="number-pad"
                    maxLength={1}
                    selectTextOnFocus
                  />
                ))}
              </View>
            </View>

            <Input
              label="New password"
              placeholder="Minimum 8 characters"
              secureTextEntry
              value={password}
              onChangeText={(t) => {
                setPasswordValue(t);
                if (errorMessage) setErrorMessage('');
              }}
              hint="Hint: Include upper, lower case and numbers"
            />

            <View style={styles.btnWrap}>
              <Button
                title="Activate account"
                onPress={submit}
                loading={submitting}
                disabled={!email.trim() || codeString.length < 6 || !password}
                disabledReason={
                  !email.trim() || codeString.length < 6 || !password
                    ? 'Enter email, 6-digit code, and password'
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing['2xl'],
    justifyContent: 'center',
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
  codeSection: {
    marginBottom: Spacing.md,
  },
  codeLabel: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: Spacing.xs,
  },
  codeBoxesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.xs,
  },
  codeBox: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.base,
    backgroundColor: Colors.surface,
    textAlign: 'center',
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xl,
    color: Colors.ink,
  },
  codeBoxFilled: {
    borderColor: Colors.brand,
    borderWidth: 2,
  },
  btnWrap: {
    marginTop: Spacing.md,
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
  successCard: {
    margin: Spacing.xl,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.base,
    padding: Spacing['2xl'],
    alignItems: 'center',
  },
  successIconBadge: {
    width: 64,
    height: 64,
    borderRadius: Radius.base,
    backgroundColor: Colors.tintOk,
    borderWidth: 1,
    borderColor: '#BBDCC7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  successTitle: {
    fontFamily: Fonts.heading,
    fontSize: FontSize['2xl'],
    color: Colors.ink,
    marginBottom: Spacing.sm,
  },
  successSub: {
    fontFamily: Fonts.body,
    fontSize: FontSize.sm,
    color: Colors.muted,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  successBtn: {
    minWidth: 200,
  },
});
