import React from 'react';
import { View, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { useFonts, Newsreader_600SemiBold } from '@expo-google-fonts/newsreader';
import {
  PublicSans_400Regular,
  PublicSans_600SemiBold,
} from '@expo-google-fonts/public-sans';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import SetPasswordScreen from './src/screens/SetPasswordScreen';
import MainNavigator from './src/navigation/MainNavigator';
import OfflineBanner from './src/components/OfflineBanner';
import { Colors } from './src/constants/theme';

function AppRoot() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showRegistration, setShowRegistration] = React.useState(false);
  const [showSetPassword, setShowSetPassword] = React.useState(false);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.brand} />
      </View>
    );
  }

  if (isAuthenticated) return <MainNavigator />;

  if (showSetPassword)
    return <SetPasswordScreen onBack={() => setShowSetPassword(false)} />;
  return showRegistration ? (
    <RegisterScreen onBackToLogin={() => setShowRegistration(false)} />
  ) : (
    <LoginScreen
      onRegister={() => setShowRegistration(true)}
      onSetPassword={() => setShowSetPassword(true)}
    />
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Newsreader_600SemiBold,
    PublicSans_400Regular,
    PublicSans_600SemiBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.brand} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.flex}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar barStyle="dark-content" />
          <OfflineBanner />
          <AppRoot />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
