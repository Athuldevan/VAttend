import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius, FontSize, Fonts } from '../constants/theme';
import { getDepartments } from '../api/departments';
import { getPrograms } from '../api/programs';
import { getSubjects } from '../api/subjects';
import { getTeachers } from '../api/users';
import ListRow from '../components/ListRow';
import SkeletonList from '../components/Skeleton';

export type ManageSubScreen = 'departments' | 'programs' | 'subjects' | 'faculty';

interface ManageScreenProps {
  onNavigateSub: (sub: ManageSubScreen) => void;
}

export default function ManageScreen({ onNavigateSub }: ManageScreenProps) {
  const [counts, setCounts] = useState({
    departments: 0,
    programs: 0,
    subjects: 0,
    faculty: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchCounts = useCallback(async () => {
    try {
      const [dRes, pRes, sRes, tRes] = await Promise.all([
        getDepartments().catch(() => ({ data: [] })),
        getPrograms().catch(() => ({ data: [] })),
        getSubjects().catch(() => ({ data: [] })),
        getTeachers().catch(() => ({ data: [] })),
      ]);

      setCounts({
        departments: dRes.data?.length || 0,
        programs: pRes.data?.length || 0,
        subjects: sRes.data?.length || 0,
        faculty: tRes.data?.length || 0,
      });
    } catch {
      // Keep existing counts
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCounts();
  }, [fetchCounts]);

  const sections: Array<{
    key: ManageSubScreen;
    title: string;
    description: string;
    count: number;
    icon: keyof typeof Ionicons.glyphMap;
  }> = [
    {
      key: 'departments',
      title: 'Departments',
      description: 'Academic departments & HOD directory',
      count: counts.departments,
      icon: 'business-outline',
    },
    {
      key: 'programs',
      title: 'Programs',
      description: 'Undergraduate and postgraduate degree tracks',
      count: counts.programs,
      icon: 'school-outline',
    },
    {
      key: 'subjects',
      title: 'Subjects',
      description: 'Semester curriculum course catalog (S1 – S8)',
      count: counts.subjects,
      icon: 'book-outline',
    },
    {
      key: 'faculty',
      title: 'Faculty',
      description: 'Teachers directory and email invitation portal',
      count: counts.faculty,
      icon: 'people-outline',
    },
  ];

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
      <View style={styles.header}>
        <Text style={styles.title}>Manage</Text>
        <Text style={styles.subtitle}>
          Administrative directory and configuration portal
        </Text>
      </View>

      {loading ? (
        <SkeletonList count={4} />
      ) : (
        <View style={styles.card}>
          {sections.map((item, idx) => {
            const isLast = idx === sections.length - 1;
            return (
              <ListRow
                key={item.key}
                title={item.title}
                subtitle={item.description}
                showDivider={!isLast}
                showChevron
                leftElement={
                  <View style={styles.iconBadge}>
                    <Ionicons name={item.icon} size={20} color={Colors.brand} />
                  </View>
                }
                rightElement={
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{item.count}</Text>
                  </View>
                }
                onPress={() => onNavigateSub(item.key)}
              />
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
  header: {
    marginBottom: Spacing.xl,
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
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.line,
    borderRadius: Radius.base,
    overflow: 'hidden',
  },
  iconBadge: {
    width: 38,
    height: 38,
    borderRadius: Radius.base,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadge: {
    backgroundColor: Colors.tintNeutral,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.base,
    borderWidth: 1,
    borderColor: Colors.line,
  },
  countText: {
    fontFamily: Fonts.bodySemiBold,
    fontSize: FontSize.xs,
    color: Colors.ink,
  },
});

