
'use client';

import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
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
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ArrowLeft, Search } from 'lucide-react';

type Student = {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  dob: string;
  pob: string;
  parentPhone?: string;
};

type ClassDetailsPageProps = {
  params: {
    className: string; // This is actually the class ID
  };
};

export default function ClassDetailsPage({ params }: ClassDetailsPageProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [className, setClassName] = useState('');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const classId = decodeURIComponent(params.className);

  useEffect(() => {
    const fetchClassDetailsAndStudents = async () => {
      if (!classId) return;

      try {
        // Fetch class name
        const classDocRef = doc(db, 'classes', classId);
        const classDoc = await getDoc(classDocRef);
        if (classDoc.exists()) {
          setClassName(classDoc.data().name);
        } else {
           toast({
            title: 'Erreur',
            description: "Classe non trouvée.",
            variant: 'destructive',
          });
        }
        
        // Fetch students in that class
        const studentsRef = collection(db, 'students');
        const q = query(studentsRef, where('classId', '==', classId));
        const querySnapshot = await getDocs(q);
        
        const studentsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Student[];
        
        studentsList.sort((a, b) => (a.matricule || '').localeCompare(b.matricule || ''));
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

    fetchClassDetailsAndStudents();
  }, [classId, toast]);

  const filteredStudents = students.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Liste des Élèves</CardTitle>
              <CardDescription>
                Un total de {filteredStudents.length} élèves trouvés dans la classe {className}.
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
                <TableHead>Matricule</TableHead>
                <TableHead>Nom Complet</TableHead>
                <TableHead>Date de Naissance</TableHead>
                <TableHead>Lieu de Naissance</TableHead>
                <TableHead>Contact Parent</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.matricule}</TableCell>
                    <TableCell className="font-medium">{`${student.firstName} ${student.lastName}`}</TableCell>
                    <TableCell>{student.dob}</TableCell>
                    <TableCell>{student.pob}</TableCell>
                    <TableCell>{student.parentPhone || 'N/A'}</TableCell>
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
