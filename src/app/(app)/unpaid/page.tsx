
'use client';

import { useState, useEffect, useCallback } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Student = {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  classId: string;
  parentPhone?: string;
};

type Payment = {
  studentId: string;
  month: string; // YYYY-MM
};

type Class = {
  id: string;
  name: string;
}

const currentYear = new Date().getFullYear();
const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');

export default function UnpaidStudentsPage() {
  const [unpaidStudents, setUnpaidStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const { toast } = useToast();

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: '01', label: 'Janvier' }, { value: '02', label: 'Février' },
    { value: '03', label: 'Mars' }, { value: '04', label: 'Avril' },
    { value: '05', label: 'Mai' }, { value: '06', label: 'Juin' },
    { value: '07', label: 'Juillet' }, { value: '08', label: 'Août' },
    { value: '09', label: 'Septembre' }, { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' }, { value: '12', label: 'Décembre' }
  ];

  const fetchUnpaidStudents = useCallback(async () => {
    setLoading(true);
    try {
      const targetMonth = `${selectedYear}-${selectedMonth}`;
      
      const classesSnapshot = await getDocs(collection(db, 'classes'));
      const classMap = new Map(classesSnapshot.docs.map(doc => [doc.id, doc.data().name]));
      setClasses(classMap);

      const studentsSnapshot = await getDocs(collection(db, 'students'));
      const allStudents = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Student[];

      const paymentsQuery = query(collection(db, 'payments'), where('month', '==', targetMonth), where('status', '==', 'Payé'));
      const paymentsSnapshot = await getDocs(paymentsQuery);
      
      const paidStudentIds = new Set(
        paymentsSnapshot.docs.map(doc => (doc.data() as Payment).studentId)
      );
      
      const unpaid = allStudents.filter(student => !paidStudentIds.has(student.id));
      
      unpaid.sort((a, b) => (a.matricule || '').localeCompare(b.matricule || ''));
      setUnpaidStudents(unpaid);

    } catch (error) {
      console.error("Erreur lors de la récupération des données: ", error);
      toast({
        title: 'Erreur',
        description: "Impossible de charger la liste des élèves impayés.",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth, toast]);

  useEffect(() => {
    fetchUnpaidStudents();
  }, [fetchUnpaidStudents]);
  
  const selectedMonthLabel = months.find(m => m.value === selectedMonth)?.label || '';
  
  const getClassName = (classId: string) => classes.get(classId) || 'N/A';

  const filteredUnpaidStudents = unpaidStudents.filter(student => {
      const studentName = `${student.firstName} ${student.lastName}`.toLowerCase();
      const className = getClassName(student.classId).toLowerCase();
      const search = searchQuery.toLowerCase();
      return studentName.includes(search) || className.includes(search);
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Impayés du Mois</h1>
        <p className="text-muted-foreground">
          Liste des élèves n'ayant pas payé pour {selectedMonthLabel} {selectedYear}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <CardTitle>Élèves sans Paiement</CardTitle>
              <CardDescription>
                {filteredUnpaidStudents.length} élèves sans paiement pour {selectedMonthLabel} {selectedYear}.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="w-[180px]"><SelectValue placeholder="Mois" /></SelectTrigger>
                    <SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[120px]"><SelectValue placeholder="Année" /></SelectTrigger>
                    <SelectContent>{years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent>
                </Select>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Rechercher par nom, classe..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Matricule</TableHead>
                <TableHead>Nom Complet</TableHead>
                <TableHead>Classe</TableHead>
                <TableHead>Contact Parent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="h-24 text-center">Chargement...</TableCell></TableRow>
              ) : filteredUnpaidStudents.length > 0 ? (
                filteredUnpaidStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.matricule}</TableCell>
                    <TableCell className="font-medium">{`${student.firstName} ${student.lastName}`}</TableCell>
                    <TableCell>{getClassName(student.classId)}</TableCell>
                    <TableCell>{student.parentPhone || 'N/A'}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={4} className="h-24 text-center">Aucun impayé trouvé pour la période sélectionnée.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
