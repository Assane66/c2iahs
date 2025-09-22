
'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
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
  id: string;
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
  const { toast } = useToast();

  const fetchStudents = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'students'));
      const studentsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
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
      await addDoc(collection(db, 'students'), newStudentData);
      toast({
        title: 'Succès',
        description: 'Élève ajouté avec succès !',
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
          <CardTitle>Liste des Élèves</CardTitle>
          <CardDescription>
            Une liste de tous les élèves de l'école.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>ID</TableHead>
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
              ) : students.length > 0 ? (
                students.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell>{student.id}</TableCell>
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
