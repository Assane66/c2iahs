
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
import { useToast } from '@/hooks/use-toast';

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
};

export default function UnpaidStudentsPage() {
  const [unpaidStudents, setUnpaidStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUnpaidStudents = async () => {
      setLoading(true);
      try {
        // 1. Fetch all students
        const studentsSnapshot = await getDocs(collection(db, 'students'));
        const allStudents = studentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Student[];

        // 2. Fetch all payments
        const paymentsSnapshot = await getDocs(collection(db, 'payments'));
        const payments = paymentsSnapshot.docs.map(doc => doc.data() as Payment);

        // 3. Create a set of student names who have paid
        const paidStudentNames = new Set(payments.map(p => p.studentName));
        
        // 4. Filter students who are not in the paid set
        const unpaid = allStudents.filter(student => !paidStudentNames.has(student.name));
        
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

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paiements Non Effectués</h1>
        <p className="text-muted-foreground">
          Liste des élèves qui n'ont pas encore effectué de paiement.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Élèves sans Paiement</CardTitle>
          <CardDescription>
            Un total de {unpaidStudents.length} élèves trouvés sans paiement enregistré.
          </CardDescription>
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
              ) : unpaidStudents.length > 0 ? (
                unpaidStudents.map((student) => (
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
                    Tous les élèves ont effectué un paiement.
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
