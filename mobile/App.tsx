import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import SetPasswordScreen from './src/screens/SetPasswordScreen';
import MainNavigator from './src/navigation/MainNavigator';
import { Colors } from './src/constants/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function AppRoot() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showRegistration, setShowRegistration] = React.useState(false);
  const [showSetPassword, setShowSetPassword] = React.useState(false);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (isAuthenticated) return <MainNavigator />;

  if (showSetPassword) return <SetPasswordScreen onBack={() => setShowSetPassword(false)} />;
  return showRegistration ? (
    <RegisterScreen onBackToLogin={() => setShowRegistration(false)} />
  ) : (
    <LoginScreen onRegister={() => setShowRegistration(true)} onSetPassword={() => setShowSetPassword(true)} />
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppRoot />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
