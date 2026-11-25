import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, FontSize, Fonts, Radius, Spacing } from '../constants/theme';
import { getDepartments, type Department } from '../api/departments';
import { createStudent, deleteStudent, getStudents, updateStudent, type StudentItem } from '../api/users';
import Button from '../components/Button';
import Input from '../components/Input';
import Sheet from '../components/Sheet';
import SkeletonList from '../components/Skeleton';

interface StudentsScreenProps { onBack?: () => void; }
const defaultBatch = () => { const y = new Date().getFullYear(); return `${y}-${String(y + 1).slice(-2)}`; };

export default function StudentsScreen({ onBack }: StudentsScreenProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [departmentId, setDepartmentId] = useState('');
  const [year, setYear] = useState(1);
  const [academicYear, setAcademicYear] = useState(defaultBatch());
  const [loading, setLoading] = useState(true); const [refreshing, setRefreshing] = useState(false);
  const [sheetVisible, setSheetVisible] = useState(false); const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState(''); const [rollNumber, setRollNumber] = useState('');
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);
  const load = useCallback(async () => {
    try {
      const result = await getDepartments(); const nextDepartments = result.data || []; setDepartments(nextDepartments);
      const nextDepartmentId = departmentId || nextDepartments[0]?.id || '';
      if (nextDepartmentId && !departmentId) setDepartmentId(nextDepartmentId);
      setStudents((await getStudents(nextDepartmentId ? { departmentId: nextDepartmentId, year, academicYear } : undefined)).data || []);
    } catch { setStudents([]); } finally { setLoading(false); setRefreshing(false); }
  }, [departmentId, year, academicYear]);
  useEffect(() => { load(); }, [load]);
  const openAdd = () => { setEditingStudent(null); setName(''); setRollNumber(''); setSheetVisible(true); };
  const openEdit = (student: StudentItem) => { setEditingStudent(student); setName(student.name); setRollNumber(String(student.rollNumber)); setDepartmentId(student.departmentId || departmentId); setYear(student.year || year); setAcademicYear(student.academicYear || academicYear); setSheetVisible(true); };
  const save = async () => {
    const roll = Number(rollNumber);
    if (!departmentId || !name.trim() || !Number.isInteger(roll) || roll < 1 || !academicYear.trim()) { Alert.alert('Check student details', 'Choose department, year and batch, then enter name and roll number.'); return; }
    setSubmitting(true);
    try {
      const payload = { name: name.trim(), rollNumber: roll, departmentId, year, academicYear: academicYear.trim() };
      if (editingStudent) await updateStudent(editingStudent.id, payload); else await createStudent(payload);
      setSheetVisible(false); setEditingStudent(null); await load();
      Alert.alert('Student saved', `Allocated to Year ${year}, ${academicYear}. The student will appear in both semesters.`);
    } catch (error: any) { Alert.alert('Could not save student', error?.response?.data?.message || error?.response?.data?.errors?.[0]?.message || 'Please try again.'); } finally { setSubmitting(false); }
  };
  const remove = (student: StudentItem) => Alert.alert('Delete student?', `${student.name} will be removed from active rosters.`, [{ text: 'Cancel', style: 'cancel' }, { text: 'Delete', style: 'destructive', onPress: async () => { try { await deleteStudent(student.id); await load(); } catch { Alert.alert('Could not delete student'); } } }]);
  const deptName = departments.find((d) => d.id === departmentId)?.name || 'Department';
  const Cohort = () => <><Text style={styles.label}>DEPARTMENT</Text><ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll}>{departments.map((d) => <TouchableOpacity key={d.id} onPress={() => setDepartmentId(d.id)} style={[styles.chip, departmentId === d.id && styles.chipActive]}><Text style={[styles.chipText, departmentId === d.id && styles.chipTextActive]}>{d.code}</Text></TouchableOpacity>)}</ScrollView><Text style={styles.label}>YEAR</Text><View style={styles.yearRow}>{[1,2,3,4,5].map((value) => <TouchableOpacity key={value} onPress={() => setYear(value)} style={[styles.yearButton, year === value && styles.chipActive]}><Text style={[styles.chipText, year === value && styles.chipTextActive]}>Y{value}</Text></TouchableOpacity>)}</View><Input label="Academic batch" value={academicYear} onChangeText={setAcademicYear} placeholder="e.g. 2026-27" /></>;
  return <View style={styles.container}><ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={Colors.brand} colors={[Colors.brand]} />}>
    {onBack ? <TouchableOpacity style={styles.back} onPress={onBack}><Ionicons name="chevron-back" size={18} color={Colors.brand}/><Text style={styles.backText}>Manage</Text></TouchableOpacity> : null}
    <View style={styles.header}><View style={styles.headerText}><Text style={styles.title}>Students</Text><Text style={styles.subtitle}>Allocate a department cohort; no semester selection is needed.</Text></View><Button title="Add student" size="sm" fullWidth={false} onPress={openAdd} icon={<Ionicons name="add" size={18} color="#fff"/>}/></View>
    <Cohort/><Text style={styles.cohortText}>{deptName} · Year {year} · {academicYear}</Text>
    {loading ? <SkeletonList count={4}/> : <View style={styles.card}>{students.length === 0 ? <Text style={styles.emptyText}>No students in this cohort yet.</Text> : students.map((student, index) => <View key={student.id} style={[styles.row, index < students.length - 1 && styles.divider]}><View><Text style={styles.studentName}>{student.name}</Text><Text style={styles.studentMeta}>Year {student.year} · {student.academicYear}</Text></View><View style={styles.actions}><Text style={styles.roll}>Roll {student.rollNumber}</Text><TouchableOpacity onPress={() => openEdit(student)}><Ionicons name="create-outline" size={20} color={Colors.brand}/></TouchableOpacity><TouchableOpacity onPress={() => remove(student)}><Ionicons name="trash-outline" size={20} color={Colors.absent}/></TouchableOpacity></View></View>)}</View>}
  </ScrollView><Sheet visible={sheetVisible} onClose={() => { setSheetVisible(false); setEditingStudent(null); }} title={editingStudent ? 'Edit Student' : 'Add Student'} subtitle="Students continue through both semesters in the same year."><ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.sheet}><Cohort/><Input label="Student name" value={name} onChangeText={setName} placeholder="e.g. Anu Thomas"/><Input label="Roll number" value={rollNumber} onChangeText={setRollNumber} keyboardType="number-pad" placeholder="e.g. 24"/><Button title={editingStudent ? 'Save Changes' : 'Add Student'} onPress={save} loading={submitting} disabled={!departments.length}/></ScrollView></Sheet></View>;
}

const styles = StyleSheet.create({
  container:{flex:1,backgroundColor:Colors.background},content:{padding:Spacing.xl,paddingBottom:Spacing['2xl']},back:{flexDirection:'row',alignItems:'center',marginBottom:Spacing.md},backText:{color:Colors.brand,fontFamily:Fonts.bodySemiBold,fontSize:FontSize.sm},header:{flexDirection:'row',justifyContent:'space-between',alignItems:'flex-start',gap:Spacing.md,marginBottom:Spacing.lg},headerText:{flex:1},title:{color:Colors.ink,fontFamily:Fonts.heading,fontSize:FontSize['3xl']},subtitle:{color:Colors.muted,fontFamily:Fonts.body,fontSize:FontSize.xs,marginTop:3},label:{color:Colors.muted,fontFamily:Fonts.bodySemiBold,fontSize:FontSize.xs,marginBottom:Spacing.sm,marginTop:Spacing.sm},chipScroll:{marginBottom:Spacing.sm},chip:{borderWidth:1,borderColor:Colors.line,borderRadius:Radius.base,paddingHorizontal:Spacing.md,paddingVertical:Spacing.sm,marginRight:Spacing.sm,backgroundColor:Colors.surface},chipActive:{borderColor:Colors.brand,backgroundColor:Colors.brand},chipText:{color:Colors.ink,fontFamily:Fonts.bodySemiBold,fontSize:FontSize.xs},chipTextActive:{color:'#fff'},yearRow:{flexDirection:'row',gap:Spacing.xs,marginBottom:Spacing.sm},yearButton:{flex:1,borderWidth:1,borderColor:Colors.line,borderRadius:Radius.base,alignItems:'center',paddingVertical:Spacing.sm,backgroundColor:Colors.surface},cohortText:{fontFamily:Fonts.bodySemiBold,fontSize:FontSize.xs,color:Colors.brand,marginBottom:Spacing.md},card:{backgroundColor:Colors.surface,borderWidth:1,borderColor:Colors.line,borderRadius:Radius.base,paddingHorizontal:Spacing.lg},row:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',paddingVertical:Spacing.md},actions:{flexDirection:'row',alignItems:'center',gap:Spacing.md},divider:{borderBottomWidth:1,borderBottomColor:Colors.line},studentName:{color:Colors.ink,fontFamily:Fonts.bodySemiBold,fontSize:FontSize.base},studentMeta:{color:Colors.muted,fontFamily:Fonts.body,fontSize:FontSize.xs,marginTop:2},roll:{color:Colors.brand,fontFamily:Fonts.bodySemiBold,fontSize:FontSize.xs},emptyText:{color:Colors.muted,fontFamily:Fonts.body,fontSize:FontSize.sm,paddingVertical:Spacing.xl},sheet:{paddingBottom:Spacing['2xl']},
});
