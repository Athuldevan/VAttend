import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, Fonts } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ onRegister, onSetPassword }: { onRegister: () => void; onSetPassword: () => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('richu@gmail.com');
  const [password, setPassword] = useState('richu@123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailFocused, setEmailFocused] = useState(false);
  const [passFocused, setPassFocused] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await login({ email: email.trim(), password });
    } catch (err: any) {
      console.log('Login error:', err);
      let message = 'Unable to sign in. Please check your credentials.';
      if (err?.response?.data?.message) {
        message = err.response.data.message;
      } else if (err?.message === 'Network Error' || !err?.response) {
        message = 'Network error: Cannot reach the backend server. Please verify your phone is on the same Wi-Fi.';
      }
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.gradientStart} />

      {/* Background gradient blobs */}
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Area */}
          <View style={styles.logoArea}>
            <View style={styles.logoRing}>
              <View style={styles.logoBadge}>
                <Ionicons name="school-outline" size={30} color={Colors.text} />
              </View>
            </View>
            <Text style={styles.appName}>AMS</Text>
            <Text style={styles.appTagline}>Attendance Management System</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome back 👋</Text>
            <Text style={styles.cardSubtitle}>Sign in to your teacher portal</Text>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={[styles.inputRow, emailFocused && styles.inputRowFocused, error && !email ? styles.inputError : null]}>
                <View style={styles.inputIconWrap}>
                  <Ionicons name="mail-outline" size={18} color={emailFocused ? Colors.primary : Colors.textTertiary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={Colors.textTertiary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={[styles.inputRow, passFocused && styles.inputRowFocused, error && !password ? styles.inputError : null]}>
                <View style={styles.inputIconWrap}>
                  <Ionicons name="lock-closed-outline" size={18} color={passFocused ? Colors.primary : Colors.textTertiary} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={Colors.textTertiary}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPassFocused(true)}
                  onBlur={() => setPassFocused(false)}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeBtn}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={Colors.textTertiary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Error Box */}
            {error ? (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle-outline" size={16} color={Colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Sign In Button */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={Colors.text} size="small" />
              ) : (
                <>
                  <Text style={styles.buttonText}>Sign In</Text>
                  <Ionicons name="arrow-forward" size={18} color={Colors.text} />
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={styles.registerLink} onPress={onRegister}>
              <Text style={styles.registerLinkText}>Create an Admin or Teacher account</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.registerLink} onPress={onSetPassword}>
              <Text style={styles.registerLinkText}>Set password with HOD setup code</Text>
            </TouchableOpacity>

            {/* Footer hint */}
            <View style={styles.footerRow}>
              <Ionicons name="shield-checkmark-outline" size={13} color={Colors.textTertiary} />
              <Text style={styles.footerText}>Secured · Faculty access only</Text>
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
    backgroundColor: Colors.gradientStart,
  },
  blobTop: {
    position: 'absolute',
    top: -80,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: Colors.primaryMuted,
    opacity: 0.6,
  },
  blobBottom: {
    position: 'absolute',
    bottom: -60,
    left: -80,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: Colors.greenBg,
    opacity: 0.8,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing['2xl'],
    paddingVertical: Spacing['4xl'],
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: Spacing['4xl'],
  },
  logoRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    opacity: 0.5,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
  },
  appName: {
    fontSize: FontSize['3xl'],
    fontFamily: Fonts.extrabold,
    color: Colors.text,
    letterSpacing: 3,
    marginBottom: Spacing.xs,
  },
  appTagline: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.medium,
    color: Colors.textSecondary,
    letterSpacing: 0.3,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing['3xl'],
    shadowColor: '#1A1A1A',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 8,
  },
  cardTitle: {
    fontSize: FontSize['2xl'],
    fontFamily: Fonts.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  cardSubtitle: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.regular,
    color: Colors.textSecondary,
    marginBottom: Spacing['3xl'],
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    backgroundColor: Colors.backgroundAlt,
    overflow: 'hidden',
  },
  inputRowFocused: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryBg,
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorBg,
  },
  inputIconWrap: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    fontFamily: Fonts.regular,
    color: Colors.text,
    paddingVertical: Platform.OS === 'ios' ? Spacing.md : Spacing.sm,
    paddingRight: Spacing.sm,
  },
  eyeBtn: {
    paddingHorizontal: Spacing.md,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.sm,
    backgroundColor: Colors.errorBg,
    borderRadius: Radius.sm,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#F5CCCC',
  },
  errorText: {
    flex: 1,
    fontSize: FontSize.sm,
    fontFamily: Fonts.medium,
    color: Colors.error,
    lineHeight: 18,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: Spacing.lg,
    marginTop: Spacing.xs,
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    fontSize: FontSize.base,
    fontFamily: Fonts.bold,
    color: Colors.text,
    letterSpacing: 0.5,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    marginTop: Spacing.xl,
  },
  registerLink: {
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  registerLinkText: {
    fontSize: FontSize.sm,
    fontFamily: Fonts.semibold,
    color: Colors.primary,
  },
  footerText: {
    fontSize: FontSize.xs,
    fontFamily: Fonts.medium,
    color: Colors.textTertiary,
  },
});
