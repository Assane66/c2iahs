
'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
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
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type Student = {
  id: string; 
  studentId: number; 
  name: string;
  class: string;
  dob: string;
  pob: string;
  contact: string;
};

type ClassDetailsPageProps = {
  params: {
    className: string;
  };
};

export default function ClassDetailsPage({ params }: ClassDetailsPageProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const className = decodeURIComponent(params.className);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!className) return;

      try {
        const studentsRef = collection(db, 'students');
        const q = query(studentsRef, where('class', '==', className));
        const querySnapshot = await getDocs(q);
        
        const studentsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Student[];
        
        studentsList.sort((a, b) => a.studentId - b.studentId);
        setStudents(studentsList);
      } catch (error) {
        console.error("Erreur lors de la récupération des élèves: ", error);
        toast({
          title: 'Erreur',
          description: "Impossible de charger la liste des élèves pour cette classe.",
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [className, toast]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="outline" size="icon">
          <Link href="/classes">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Retour aux classes</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Classe: {className}</h1>
          <p className="text-muted-foreground">
            Liste des élèves inscrits dans cette classe.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Élèves</CardTitle>
          <CardDescription>
            Un total de {students.length} élèves trouvés dans la classe {className}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Date de Naissance</TableHead>
                <TableHead>Lieu de Naissance</TableHead>
                <TableHead>Contact</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : students.length > 0 ? (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.studentId}</TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.dob}</TableCell>
                    <TableCell>{student.pob}</TableCell>
                    <TableCell>{student.contact}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Aucun élève trouvé dans cette classe.
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
