
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
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

type ClassInfo = {
  name: string;
  studentCount: number;
};

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'students'));
        const classMap = new Map<string, number>();

        querySnapshot.docs.forEach(doc => {
          const studentData = doc.data();
          const className = studentData.class;
          if (className) {
            classMap.set(className, (classMap.get(className) || 0) + 1);
          }
        });

        const classesList: ClassInfo[] = Array.from(classMap, ([name, studentCount]) => ({
          name,
          studentCount,
        }));
        
        classesList.sort((a, b) => a.name.localeCompare(b.name));
        setClasses(classesList);
      } catch (error) {
        console.error("Erreur lors de la récupération des classes: ", error);
        toast({
          title: 'Erreur',
          description: "Impossible de charger la liste des classes.",
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [toast]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
          <p className="text-muted-foreground">
            Une liste des classes basées sur les élèves inscrits.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Classes</CardTitle>
          <CardDescription>
            Chaque classe et le nombre d'élèves correspondant.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom de la Classe</TableHead>
                <TableHead className="text-right">Nombres d'Élèves</TableHead>
                <TableHead><span className="sr-only">Voir</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : classes.length > 0 ? (
                classes.map((c) => (
                   <TableRow key={c.name} className="group hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <Link href={`/classes/${encodeURIComponent(c.name)}`} className="hover:underline">
                        {c.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">{c.studentCount}</TableCell>
                    <TableCell className="text-right">
                       <Link href={`/classes/${encodeURIComponent(c.name)}`}>
                        <ChevronRight className="h-4 w-4 inline-block opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Aucune classe trouvée. Ajoutez des élèves pour voir les classes ici.
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
