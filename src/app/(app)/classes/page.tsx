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
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { logAuditAction } from '@/lib/audit';
import Link from 'next/link';
import { ChevronRight, PlusCircle, Search, School } from 'lucide-react';

type ClassInfo = {
  id: string;
  name: string;
  studentCount: number;
  maxCapacity: number;
  academicYear: string;
};

type Class = {
    id: string;
    name: string;
    academicYear: string;
    maxCapacity?: number;
}

export default function ClassesPage() {
  const [classesInfo, setClassesInfo] = useState<ClassInfo[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  
  const currentYear = new Date().getFullYear();
  const defaultAcademicYear = `${currentYear}-${currentYear + 1}`;

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
            maxCapacity: c.maxCapacity || 30,
            academicYear: c.academicYear || defaultAcademicYear,
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
  }, []);

  const handleAddClass = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const name = (form.elements.namedItem('className') as HTMLInputElement)?.value;
    const academicYear = (form.elements.namedItem('academicYear') as HTMLInputElement)?.value;
    const maxCapacity = parseInt((form.elements.namedItem('maxCapacity') as HTMLInputElement)?.value || '30', 10);
    
    if (!name || !academicYear) {
      toast({
        title: "Champs requis",
        description: "Veuillez remplir tous les champs.",
        variant: "destructive"
      });
      return;
    }

    try {
        await addDoc(collection(db, 'classes'), {
          name,
          academicYear,
          maxCapacity,
        });
        await logAuditAction('class_created', `Création de la classe ${name} (${academicYear}, Capacité max: ${maxCapacity})`);
        toast({
            title: 'Succès',
            description: `La classe ${name} a été créée avec succès !`,
        });
        fetchClassesAndStudents();
        setOpen(false);
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
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Classes</h1>
          <p className="text-muted-foreground">
            Structurez vos effectifs et niveaux scolaires.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white">
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
                  <Label htmlFor="className" className="text-right">Nom classe</Label>
                  <Input id="className" name="className" placeholder="Ex: CM2 A, Terminale S" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="academicYear" className="text-right">Année Scolaire</Label>
                  <Input id="academicYear" name="academicYear" defaultValue={defaultAcademicYear} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="maxCapacity" className="text-right">Capacity Max</Label>
                  <Input id="maxCapacity" name="maxCapacity" type="number" defaultValue="30" className="col-span-3" required />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="secondary">Annuler</Button></DialogClose>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">Créer la Classe</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
           <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <School className="h-5 w-5 text-primary" /> Liste des Classes
              </CardTitle>
              <CardDescription>
                {filteredClasses.length} classes enregistrées.
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
                <TableHead>Année Scolaire</TableHead>
                <TableHead>Effectif & Capacité</TableHead>
                <TableHead><span className="sr-only">Voir</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : filteredClasses.length > 0 ? (
                filteredClasses.map((c) => {
                  const percentage = Math.min(Math.round((c.studentCount / c.maxCapacity) * 100), 100);
                  return (
                    <TableRow key={c.id} className="group hover:bg-muted/50">
                      <TableCell className="font-semibold">
                        <Link href={`/classes/${encodeURIComponent(c.id)}`} className="hover:underline text-primary">
                          {c.name}
                        </Link>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{c.academicYear}</TableCell>
                      <TableCell>
                        <div className="space-y-1 max-w-[200px]">
                          <div className="flex justify-between text-xs font-medium">
                            <span>{c.studentCount} / {c.maxCapacity} élèves</span>
                            <span>{percentage}%</span>
                          </div>
                          <Progress value={percentage} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                         <Link href={`/classes/${encodeURIComponent(c.id)}`}>
                          <ChevronRight className="h-4 w-4 inline-block opacity-0 group-hover:opacity-100 transition-opacity" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
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
