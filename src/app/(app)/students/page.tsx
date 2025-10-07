
'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MoreHorizontal, PlusCircle, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type Student = {
  id: string; // Firestore document ID
  studentId: string; // Formatted ID like 001/24
  numericId: number; // The numeric part of the ID
  year: number; // The year part of the ID
  name: string;
  class: string;
  dob: string;
  pob: string;
  contact: string;
};

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const fetchStudents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'students'));
      const studentsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
      // Sort students by their numeric ID
      studentsList.sort((a, b) => (a.numericId ?? 0) - (b.numericId ?? 0));
      setStudents(studentsList);
    } catch (error) {
      console.error("Erreur lors de la récupération des élèves: ", error);
      toast({
        title: 'Erreur',
        description: "Impossible de charger la liste des élèves.",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddStudent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const newStudentData = {
      name: (form.elements.namedItem('name') as HTMLInputElement)?.value,
      class: (form.elements.namedItem('class') as HTMLInputElement)?.value,
      dob: (form.elements.namedItem('dob') as HTMLInputElement)?.value,
      pob: (form.elements.namedItem('pob') as HTMLInputElement)?.value,
      contact: (form.elements.namedItem('contact') as HTMLInputElement)?.value,
    };

    try {
        const currentYear = new Date().getFullYear();
        
        // Check for the highest ID in the current year
        const q = query(
          collection(db, 'students'), 
          orderBy('numericId', 'desc'), 
          limit(1)
        );
        const querySnapshot = await getDocs(q);

        let nextId = 1;
        if (!querySnapshot.empty) {
            const lastStudent = querySnapshot.docs[0].data() as Student;
            // If there are students, increment the highest ID
            if(students.length > 0) {
              nextId = (lastStudent.numericId || 0) + 1;
            }
        }
        
        const yearShort = currentYear.toString().slice(-2);
        const formattedId = `${String(nextId).padStart(3, '0')}/${yearShort}`;

        await addDoc(collection(db, 'students'), {
            ...newStudentData,
            studentId: formattedId,
            numericId: nextId,
            year: currentYear,
        });
        
        toast({
            title: 'Succès',
            description: `Élève ajouté avec l'ID ${formattedId} !`,
        });
        fetchStudents(); // Refresh list
        setOpen(false);
        form.reset();
    } catch (error) {
        console.error("Erreur lors de l'ajout de l'élève: ", error);
        toast({
            title: 'Erreur',
            description: "Impossible d'ajouter l'élève.",
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
      fetchStudents(); // Refresh list
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
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(student.studentId).includes(searchQuery)
  );

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
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un Nouvel Élève</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddStudent}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nom
                  </Label>
                  <Input id="name" name="name" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="class" className="text-right">
                    Classe
                  </Label>
                  <Input id="class" name="class" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dob" className="text-right">
                    Date de Naissance
                  </Label>
                  <Input id="dob" name="dob" type="date" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="pob" className="text-right">
                    Lieu de Naissance
                  </Label>
                  <Input id="pob" name="pob" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="contact" className="text-right">
                    Contact
                  </Label>
                  <Input id="contact" name="contact" className="col-span-3" required />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Annuler
                  </Button>
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
                Une liste de tous les élèves de l'école.
              </CardDescription>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Rechercher par nom, classe, ID..."
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
                <TableHead>Date de Naissance</TableHead>
                <TableHead>Lieu de Naissance</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell>{student.studentId}</TableCell>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.class}</TableCell>
                    <TableCell>{student.dob}</TableCell>
                    <TableCell>{student.pob}</TableCell>
                    <TableCell>{student.contact}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            aria-haspopup="true"
                            size="icon"
                            variant="ghost"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>Modifier</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteStudent(student.id)}>
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
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

