import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, FontSize, Fonts } from '../constants/theme';

export default function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    try {
      if (NetInfo && typeof NetInfo.addEventListener === 'function') {
        const unsubscribe = NetInfo.addEventListener((state) => {
          const offline =
            state.isConnected === false || state.isInternetReachable === false;
          setIsOffline(Boolean(offline));
        });

        if (typeof NetInfo.fetch === 'function') {
          NetInfo.fetch()
            .then((state) => {
              const offline =
                state.isConnected === false || state.isInternetReachable === false;
              setIsOffline(Boolean(offline));
            })
            .catch(() => {});
        }

        return () => {
          if (typeof unsubscribe === 'function') {
            unsubscribe();
          }
        };
      }
    } catch {
      // NetInfo native listener unavailable in current environment
    }
  }, []);

  if (!isOffline) return null;

  return (
    <View style={styles.banner}>
      <Ionicons name="cloud-offline" size={16} color={Colors.absent} />
      <Text style={styles.bannerText}>
        Offline mode · Attendance will be queued and sent once connected
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: Colors.tintError,
    borderBottomWidth: 1,
    borderBottomColor: '#ECC0BD',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.xs + 2,
    paddingHorizontal: Spacing.md,
  },
  bannerText: {
    fontFamily: Fonts.body,
    fontSize: FontSize.xs,
    color: Colors.absent,
  },
});
