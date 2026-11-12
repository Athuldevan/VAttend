import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Fonts, Radius, Spacing } from '../constants/theme';
import { getClasses, type ClassItem } from '../api/classes';
import { getPrograms, type Program } from '../api/programs';
import { createStudent, getStudents, type StudentItem } from '../api/users';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';
import Sheet from '../components/Sheet';
import SkeletonList from '../components/Skeleton';

interface StudentsScreenProps { onBack?: () => void; }

export default function StudentsScreen({ onBack }: StudentsScreenProps) {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [password, setPassword] = useState('');

  const load = useCallback(async () => {
    try {
      const [classRes, programRes] = await Promise.all([
        getClasses(user?.departmentId), getPrograms().catch(() => ({ data: [] })),
      ]);
      const nextClasses = classRes.data || [];
      setClasses(nextClasses);
      setPrograms(programRes.data || []);
      const classId = selectedClassId || nextClasses[0]?.id || '';
      if (classId && !selectedClassId) setSelectedClassId(classId);
      const studentRes = await getStudents(classId || undefined);
      setStudents(studentRes.data || []);
    } catch {
      setStudents([]);
    } finally {
      setLoading(false); setRefreshing(false);
    }
  }, [selectedClassId, user?.departmentId]);

  useEffect(() => { load(); }, [load]);
  const selectClass = async (classId: string) => {
    setSelectedClassId(classId);
    try { setStudents((await getStudents(classId)).data || []); } catch { setStudents([]); }
  };
  const programNames = useMemo(() => new Map(programs.map((p) => [p.id, p.name])), [programs]);
  const classLabel = (cls: ClassItem) => `${programNames.get(cls.programId) || 'Program'} · Year ${cls.year} · Sem ${cls.currentSemester}`;

  const save = async () => {
    const roll = Number(rollNumber);
    if (!selectedClassId || !name.trim() || !email.trim() || !Number.isInteger(roll) || roll < 1 || password.length < 5) {
      Alert.alert('Check student details', 'Choose a class and enter name, email, a positive roll number, and a password of at least 5 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await createStudent({ name: name.trim(), email: email.trim(), password, rollNumber: roll, classId: selectedClassId });
      setSheetVisible(false); setName(''); setEmail(''); setRollNumber(''); setPassword('');
      await selectClass(selectedClassId);
      Alert.alert('Student added', 'The student is assigned to the selected class and can use the supplied password to sign in.');
    } catch (error: any) {
      Alert.alert('Could not add student', error?.response?.data?.message || 'Please verify the details and try again.');
    } finally { setSubmitting(false); }
  };

  return <View style={styles.container}>
    <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.brand} colors={[Colors.brand]} />}>
      {onBack ? <TouchableOpacity style={styles.back} onPress={onBack}><Ionicons name="chevron-back" size={18} color={Colors.brand} /><Text style={styles.backText}>Manage</Text></TouchableOpacity> : null}
      <View style={styles.header}><View><Text style={styles.title}>Students</Text><Text style={styles.subtitle}>Add students to their department, program, and year class.</Text></View><Button title="Add student" size="sm" fullWidth={false} onPress={() => setSheetVisible(true)} icon={<Ionicons name="add" size={18} color="#fff" />} /></View>
      {loading ? <SkeletonList count={4} /> : <>
        <Text style={styles.label}>CLASS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classScroll}>
          {classes.map((cls) => <TouchableOpacity key={cls.id} onPress={() => selectClass(cls.id)} style={[styles.classChip, selectedClassId === cls.id && styles.classChipActive]}><Text style={[styles.classChipText, selectedClassId === cls.id && styles.classChipTextActive]}>{classLabel(cls)}</Text></TouchableOpacity>)}
        </ScrollView>
        {classes.length === 0 ? <View style={styles.empty}><Text style={styles.emptyTitle}>No classes in your department</Text><Text style={styles.emptyText}>Create the class first, then add its students here.</Text></View> : <View style={styles.card}>{students.length === 0 ? <Text style={styles.emptyText}>No students in this class yet.</Text> : students.map((student, index) => <View key={student.id} style={[styles.row, index < students.length - 1 && styles.divider]}><View><Text style={styles.studentName}>{student.name}</Text><Text style={styles.studentMeta}>{student.email}</Text></View><Text style={styles.roll}>Roll {student.rollNumber}</Text></View>)}</View>}
      </>}
    </ScrollView>
    <Sheet visible={sheetVisible} onClose={() => setSheetVisible(false)} title="Add Student" subtitle="The selected class determines department and year.">
      <ScrollView style={styles.sheet}><Text style={styles.label}>ASSIGN TO CLASS</Text>{classes.map((cls) => <TouchableOpacity key={cls.id} onPress={() => setSelectedClassId(cls.id)} style={[styles.selectRow, selectedClassId === cls.id && styles.selectRowActive]}><Text style={styles.selectText}>{classLabel(cls)}</Text></TouchableOpacity>)}<Input label="Student name" value={name} onChangeText={setName} placeholder="e.g. Anu Thomas" /><Input label="Email address" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="student@example.com" /><Input label="Roll number" value={rollNumber} onChangeText={setRollNumber} keyboardType="number-pad" placeholder="e.g. 24" /><Input label="Initial password" value={password} onChangeText={setPassword} secureTextEntry placeholder="Minimum 5 characters" /><Button title="Add Student" onPress={save} loading={submitting} disabled={!classes.length} /></ScrollView>
    </Sheet>
  </View>;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background }, content: { padding: Spacing.xl, paddingBottom: Spacing['2xl'] }, back: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.md }, backText: { color: Colors.brand, fontFamily: Fonts.bodySemiBold, fontSize: FontSize.sm }, header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: Spacing.md, marginBottom: Spacing.xl }, title: { color: Colors.ink, fontFamily: Fonts.heading, fontSize: FontSize['3xl'] }, subtitle: { color: Colors.muted, fontFamily: Fonts.body, fontSize: FontSize.xs, marginTop: 3, maxWidth: 210 }, label: { color: Colors.muted, fontFamily: Fonts.bodySemiBold, fontSize: FontSize.xs, marginBottom: Spacing.sm }, classScroll: { marginBottom: Spacing.xl }, classChip: { borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.base, padding: Spacing.sm, marginRight: Spacing.sm, backgroundColor: Colors.surface }, classChipActive: { borderColor: Colors.brand, backgroundColor: Colors.tintNeutral }, classChipText: { color: Colors.ink, fontFamily: Fonts.bodySemiBold, fontSize: FontSize.xs }, classChipTextActive: { color: Colors.brand }, card: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.base, paddingHorizontal: Spacing.lg }, row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.md }, divider: { borderBottomWidth: 1, borderBottomColor: Colors.line }, studentName: { color: Colors.ink, fontFamily: Fonts.bodySemiBold, fontSize: FontSize.base }, studentMeta: { color: Colors.muted, fontFamily: Fonts.body, fontSize: FontSize.xs, marginTop: 2 }, roll: { color: Colors.brand, fontFamily: Fonts.bodySemiBold, fontSize: FontSize.xs }, empty: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.base, padding: Spacing.xl }, emptyTitle: { color: Colors.ink, fontFamily: Fonts.heading, fontSize: FontSize.lg, marginBottom: 4 }, emptyText: { color: Colors.muted, fontFamily: Fonts.body, fontSize: FontSize.sm, paddingVertical: Spacing.md }, sheet: { paddingHorizontal: Spacing.xl }, selectRow: { borderWidth: 1, borderColor: Colors.line, borderRadius: Radius.base, padding: Spacing.sm, marginBottom: Spacing.sm }, selectRowActive: { borderColor: Colors.brand, backgroundColor: Colors.tintNeutral }, selectText: { color: Colors.ink, fontFamily: Fonts.bodySemiBold, fontSize: FontSize.sm },
});
