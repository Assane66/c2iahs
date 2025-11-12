
'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { ChevronRight, PlusCircle, Search } from 'lucide-react';

type ClassInfo = {
  id: string;
  name: string;
  studentCount: number;
};

type Class = {
    id: string;
    name: string;
    academicYear: string;
}

export default function ClassesPage() {
  const [classesInfo, setClassesInfo] = useState<ClassInfo[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  
  const currentYear = new Date().getFullYear();
  const academicYear = `${currentYear}-${currentYear + 1}`;

  const fetchClassesAndStudents = async () => {
    setLoading(true);
    try {
        const classesSnapshot = await getDocs(collection(db, 'classes'));
        const classesList = classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Class[];
        classesList.sort((a, b) => a.name.localeCompare(b.name));

        const studentsSnapshot = await getDocs(collection(db, 'students'));
        const studentCountMap = new Map<string, number>();

        studentsSnapshot.forEach(doc => {
            const studentData = doc.data();
            const classId = studentData.classId;
            if (classId) {
                studentCountMap.set(classId, (studentCountMap.get(classId) || 0) + 1);
            }
        });
        
        const classInfoList = classesList.map(c => ({
            id: c.id,
            name: c.name,
            studentCount: studentCountMap.get(c.id) || 0,
        }));
        
        setClassesInfo(classInfoList);

    } catch (error) {
        console.error("Erreur lors de la récupération des données: ", error);
        toast({
            title: 'Erreur',
            description: "Impossible de charger les classes.",
            variant: 'destructive',
        });
    } finally {
        setLoading(false);
    }
  };


  useEffect(() => {
    fetchClassesAndStudents();
  }, [toast]);

  const handleAddClass = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const newClassData = {
        name: (form.elements.namedItem('className') as HTMLInputElement)?.value,
        academicYear: (form.elements.namedItem('academicYear') as HTMLInputElement)?.value,
    };
    
    if (!newClassData.name || !newClassData.academicYear) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive"
      });
      return;
    }

    try {
        await addDoc(collection(db, 'classes'), newClassData);
        toast({
            title: 'Succès',
            description: `La classe ${newClassData.name} a été ajoutée avec succès !`,
        });
        fetchClassesAndStudents(); // Refresh list
        setOpen(false); // Close dialog
        form.reset();
    } catch (error) {
        console.error("Erreur lors de l'ajout de la classe: ", error);
        toast({
            title: 'Erreur',
            description: "Impossible d'ajouter la classe.",
            variant: 'destructive',
        });
    }
  };


  const filteredClasses = classesInfo.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Classes</h1>
          <p className="text-muted-foreground">
            Gérez les classes de votre établissement.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une Classe
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une Nouvelle Classe</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddClass}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="className" className="text-right">Nom de la classe</Label>
                  <Input id="className" name="className" placeholder="Ex: CM2" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="academicYear" className="text-right">Année Scolaire</Label>
                  <Input id="academicYear" name="academicYear" defaultValue={academicYear} className="col-span-3" required />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary">Annuler</Button></DialogClose>
                <Button type="submit">Ajouter la Classe</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
           <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Liste des Classes</CardTitle>
              <CardDescription>
                {filteredClasses.length} classes trouvées.
              </CardDescription>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher une classe..."
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
              ) : filteredClasses.length > 0 ? (
                filteredClasses.map((c) => (
                   <TableRow key={c.id} className="group hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <Link href={`/classes/${encodeURIComponent(c.id)}`} className="hover:underline">
                        {c.name}
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">{c.studentCount}</TableCell>
                    <TableCell className="text-right">
                       <Link href={`/classes/${encodeURIComponent(c.id)}`}>
                        <ChevronRight className="h-4 w-4 inline-block opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    Aucune classe trouvée. Ajoutez des classes pour commencer.
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
