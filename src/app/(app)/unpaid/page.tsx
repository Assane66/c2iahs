
'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
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

type Student = {
  id: string;
  studentId: number;
  name: string;
  class: string;
  dob: string;
  pob: string;
  contact: string;
};

type Payment = {
  studentName: string;
  date: string; // ex: "2024-09-23"
};

export default function UnpaidStudentsPage() {
  const [unpaidStudents, setUnpaidStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMonth, setCurrentMonth] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchUnpaidStudents = async () => {
      setLoading(true);
      try {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth(); // 0-11
        
        const monthName = new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(today);
        setCurrentMonth(`${monthName} ${year}`);

        // 1. Fetch all students
        const studentsSnapshot = await getDocs(collection(db, 'students'));
        const allStudents = studentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Student[];

        // 2. Fetch all payments
        const paymentsSnapshot = await getDocs(collection(db, 'payments'));
        const payments = paymentsSnapshot.docs.map(doc => doc.data() as Payment);

        // 3. Create a set of student names who have paid THIS MONTH
        const paidThisMonthStudentNames = new Set(
          payments
            .filter(p => {
              if (!p.date) return false;
              const paymentDate = new Date(p.date);
              return paymentDate.getFullYear() === year && paymentDate.getMonth() === month;
            })
            .map(p => p.studentName)
        );
        
        // 4. Filter students who are not in the "paid this month" set
        const unpaid = allStudents.filter(student => !paidThisMonthStudentNames.has(student.name));
        
        unpaid.sort((a, b) => a.studentId - b.studentId);
        setUnpaidStudents(unpaid);

      } catch (error) {
        console.error("Erreur lors de la récupération des données: ", error);
        toast({
          title: 'Erreur',
          description: "Impossible de charger la liste des élèves non payés.",
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUnpaidStudents();
  }, [toast]);

  const filteredUnpaidStudents = unpaidStudents.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.class.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Impayés du Mois</h1>
        <p className="text-muted-foreground">
          Liste des élèves n'ayant pas encore payé pour le mois de {currentMonth}.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Élèves sans Paiement ce Mois-ci</CardTitle>
              <CardDescription>
                Un total de {filteredUnpaidStudents.length} élèves trouvés sans paiement pour {currentMonth}.
              </CardDescription>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher un élève..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Classe</TableHead>
                <TableHead>Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : filteredUnpaidStudents.length > 0 ? (
                filteredUnpaidStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.studentId}</TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.class}</TableCell>
                    <TableCell>{student.contact}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Tous les élèves ont payé pour ce mois-ci.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
