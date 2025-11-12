
'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MoreHorizontal, PlusCircle, Search, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Student = {
  id: string; // Firestore document ID
  matricule: string;
  numericId: number;
  firstName: string;
  lastName: string;
  dob: string;
  pob: string;
  classId: string;
  sex: 'Masculin' | 'Féminin';
  address?: string;
  parentPhone?: string;
  registrationDate: string;
};

type Class = {
  id: string;
  name: string;
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const fetchStudentsAndClasses = async () => {
    setLoading(true);
    try {
      // Fetch classes
      const classesSnapshot = await getDocs(collection(db, 'classes'));
      const classesList = classesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Class[];
      setClasses(classesList);

      // Fetch students
      const studentsSnapshot = await getDocs(query(collection(db, 'students'), orderBy('numericId', 'asc')));
      const studentsList = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
      setStudents(studentsList);
    } catch (error) {
      console.error("Erreur lors de la récupération des données: ", error);
      toast({
        title: 'Erreur',
        description: "Impossible de charger la liste des élèves ou des classes.",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentsAndClasses();
  }, []);

  const handleAddStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const newStudentData = {
      firstName: (form.elements.namedItem('firstName') as HTMLInputElement)?.value,
      lastName: (form.elements.namedItem('lastName') as HTMLInputElement)?.value,
      dob: (form.elements.namedItem('dob') as HTMLInputElement)?.value,
      pob: (form.elements.namedItem('pob') as HTMLInputElement)?.value,
      classId: (form.elements.namedItem('classId') as HTMLInputElement)?.value,
      sex: (form.elements.namedItem('sex') as HTMLInputElement)?.value as Student['sex'],
      address: (form.elements.namedItem('address') as HTMLInputElement)?.value,
      parentPhone: (form.elements.namedItem('parentPhone') as HTMLInputElement)?.value,
    };

    if (!newStudentData.classId) {
        toast({ title: "Erreur", description: "Veuillez sélectionner une classe.", variant: "destructive" });
        return;
    }

    try {
        const currentYear = new Date().getFullYear();
        const yearPrefix = `ELV${currentYear}`;

        const q = query(
          collection(db, 'students'),
          orderBy('numericId', 'desc'), 
          limit(1)
        );
        const querySnapshot = await getDocs(q);

        let nextId = 1;
        if (!querySnapshot.empty) {
            const lastStudent = querySnapshot.docs[0].data();
            if(lastStudent.matricule.startsWith(yearPrefix)) {
                nextId = (lastStudent.numericId || 0) + 1;
            }
        }
        
        const formattedId = `${yearPrefix}-${String(nextId).padStart(3, '0')}`;

        await addDoc(collection(db, 'students'), {
            ...newStudentData,
            matricule: formattedId,
            numericId: nextId,
            registrationDate: new Date().toISOString().split('T')[0]
        });
        
        toast({
            title: 'Succès',
            description: `Élève ajouté avec le matricule ${formattedId} !`,
        });
        fetchStudentsAndClasses(); // Refresh list
        setOpen(false);
        form.reset();
    } catch (error) {
        console.error("Erreur lors de l'ajout de l'élève: ", error);
        toast({
            title: 'Erreur',
            description: "Impossible d'ajouter l'élève. Vérifiez les permissions Firestore.",
            variant: 'destructive',
        });
    }
  };

  const handleDeleteStudent = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'students', id));
      toast({
        title: 'Succès',
        description: 'Élève supprimé avec succès !',
      });
      fetchStudentsAndClasses(); // Refresh list
    } catch (error) {
      console.error("Erreur lors de la suppression de l'élève: ", error);
      toast({
        title: 'Erreur',
        description: "Impossible de supprimer l'élève.",
        variant: 'destructive',
      });
    }
  };
  
  const filteredStudents = students.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.matricule.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const getClassName = (classId: string) => {
    return classes.find(c => c.id === classId)?.name || 'N/A';
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Élèves</h1>
          <p className="text-muted-foreground">
            Gérez votre liste d'élèves.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un Élève
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajouter un Nouvel Élève</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddStudent}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="firstName" className="text-right">Prénom</Label>
                  <Input id="firstName" name="firstName" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lastName" className="text-right">Nom</Label>
                  <Input id="lastName" name="lastName" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dob" className="text-right">Date de Naissance</Label>
                  <Input id="dob" name="dob" type="date" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="pob" className="text-right">Lieu de Naissance</Label>
                  <Input id="pob" name="pob" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="classId" className="text-right">Classe</Label>
                    <Select name="classId" required>
                        <SelectTrigger className="col-span-3"><SelectValue placeholder="Sélectionner une classe" /></SelectTrigger>
                        <SelectContent>
                            {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="sex" className="text-right">Sexe</Label>
                  <Select name="sex" required>
                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Sélectionner le sexe" /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Masculin">Masculin</SelectItem>
                        <SelectItem value="Féminin">Féminin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="address" className="text-right">Adresse</Label>
                  <Input id="address" name="address" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="parentPhone" className="text-right">Tél. Parent</Label>
                  <Input id="parentPhone" name="parentPhone" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">Annuler</Button>
                </DialogClose>
                <Button type="submit">Ajouter l'Élève</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Liste des Élèves</CardTitle>
              <CardDescription>
                Une liste de tous les élèves de l'école. Total: {filteredStudents.length}
              </CardDescription>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher par nom, matricule..."
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
                <TableHead>Classe</TableHead>
                <TableHead>Date de Naissance</TableHead>
                <TableHead>Sexe</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.matricule}</TableCell>
                    <TableCell className="font-medium">{`${student.firstName} ${student.lastName}`}</TableCell>
                    <TableCell>{getClassName(student.classId)}</TableCell>
                    <TableCell>{student.dob}</TableCell>
                    <TableCell>{student.sex}</TableCell>
                    <TableCell className="text-right">
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Supprimer</span>
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                              <AlertDialogHeader>
                                  <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                      Cette action est irréversible. Le dossier de l'élève <strong>{student.firstName} {student.lastName}</strong> sera définitivement supprimé.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteStudent(student.id)}>
                                      Supprimer
                                  </AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Aucun élève trouvé.
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

    