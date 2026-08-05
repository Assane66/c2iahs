'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { PlusCircle, Search, Trash2, Download, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportJsonToExcel } from '@/lib/export';
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
  id: string;
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
      const classesSnapshot = await getDocs(collection(db, 'classes'));
      const classesList = classesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Class[];
      setClasses(classesList);

      const studentsSnapshot = await getDocs(query(collection(db, 'students'), orderBy('numericId', 'asc')));
      const studentsList = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
      setStudents(studentsList);
    } catch (error) {
      console.error("Erreur: ", error);
      toast({
        title: 'Erreur',
        description: "Impossible de charger les données.",
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
        const q = query(collection(db, 'students'), orderBy('numericId', 'desc'), limit(1));
        const querySnapshot = await getDocs(q);

        let nextId = 1;
        if (!querySnapshot.empty) {
            const lastStudent = querySnapshot.docs[0].data();
            nextId = (lastStudent.numericId || 0) + 1;
        }
        
        const formattedId = `${yearPrefix}-${String(nextId).padStart(3, '0')}`;

        await addDoc(collection(db, 'students'), {
            ...newStudentData,
            matricule: formattedId,
            numericId: nextId,
            registrationDate: new Date().toISOString().split('T')[0]
        });
        
        toast({ title: 'Succès', description: `Élève ajouté: ${formattedId}` });
        fetchStudentsAndClasses();
        setOpen(false);
        form.reset();
    } catch (error) {
        console.error("Erreur: ", error);
        toast({ title: 'Erreur', description: "Action impossible.", variant: 'destructive' });
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    try {
      // 1. Suppression en cascade : Supprimer d'abord tous les paiements liés à cet élève
      const paymentsRef = collection(db, 'payments');
      const q = query(paymentsRef, where('studentId', '==', studentId));
      const paymentsSnapshot = await getDocs(q);
      
      const deletePromises = paymentsSnapshot.docs.map(paymentDoc => deleteDoc(paymentDoc.ref));
      await Promise.all(deletePromises);

      // 2. Supprimer l'élève lui-même
      await deleteDoc(doc(db, 'students', studentId));

      toast({
        title: 'Succès',
        description: 'Élève et ses paiements supprimés avec succès !',
      });
      fetchStudentsAndClasses();
    } catch (error) {
      console.error("Erreur suppression: ", error);
      toast({
        title: 'Erreur',
        description: "Impossible de supprimer le dossier.",
        variant: 'destructive',
      });
    }
  };
  
  const filteredStudents = students.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.matricule.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const getClassName = (classId?: string, fallbackName?: string) => {
    return classes.find(c => c.id === (classId || ''))?.name || fallbackName || 'N/A';
  }

  const handleExportStudents = () => {
    exportJsonToExcel(
      students.map((student) => ({
        Matricule: student.matricule,
        Prénom: student.firstName,
        Nom: student.lastName,
        Classe: getClassName(student.classId),
        DateDeNaissance: student.dob,
        LieuNaissance: student.pob,
        Sexe: student.sex,
        TelephoneParent: student.parentPhone || '',
        Adresse: student.address || '',
        DateInscription: student.registrationDate,
      })),
      'Élèves',
      `élèves-${new Date().toISOString().split('T')[0]}.xlsx`
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-800">Élèves</h1>
          <p className="text-muted-foreground text-sm">Gérez la liste complète des inscrits.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" className="hidden sm:inline-flex" onClick={handleExportStudents}>
            <Download className="mr-2 h-4 w-4" />Exporter XLSX
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90"><PlusCircle className="mr-2 h-4 w-4" /> Ajouter un Élève</Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Nouveau Dossier Élève</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddStudent}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right text-xs">Prénom</Label>
                    <Input name="firstName" className="col-span-3 h-9 text-xs" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right text-xs">Nom</Label>
                    <Input name="lastName" className="col-span-3 h-9 text-xs" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right text-xs">Naissance</Label>
                    <Input name="dob" type="date" className="col-span-3 h-9 text-xs" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right text-xs">Lieu Naiss.</Label>
                    <Input name="pob" className="col-span-3 h-9 text-xs" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right text-xs">Classe</Label>
                    <Select name="classId" required>
                      <SelectTrigger className="col-span-3 h-9 text-xs"><SelectValue placeholder="Choisir..." /></SelectTrigger>
                      <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right text-xs">Sexe</Label>
                    <Select name="sex" required>
                      <SelectTrigger className="col-span-3 h-9 text-xs"><SelectValue placeholder="Sexe" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Masculin" className="text-xs">Masculin</SelectItem>
                        <SelectItem value="Féminin" className="text-xs">Féminin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right text-xs">Adresse</Label>
                    <Input name="address" className="col-span-3 h-9 text-xs" />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right text-xs">Tél. Parent</Label>
                    <Input name="parentPhone" className="col-span-3 h-9 text-xs" />
                  </div>
                </div>
                <DialogFooter>
                  <DialogClose asChild><Button type="button" variant="ghost" className="text-xs">Annuler</Button></DialogClose>
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-xs">Enregistrer</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="shadow-sm border-gray-100">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Liste</CardTitle>
              <CardDescription className="text-xs">Total: {filteredStudents.length} élèves.</CardDescription>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Rechercher..." className="pl-8 h-9 text-xs" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Matricule</TableHead>
                <TableHead className="text-xs">Nom</TableHead>
                <TableHead className="text-xs">Classe</TableHead>
                <TableHead className="text-xs">Naissance</TableHead>
                <TableHead className="text-xs">Sexe</TableHead>
                <TableHead className="text-right text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="h-24 text-center text-xs">Chargement...</TableCell></TableRow>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <TableRow key={student.id} className="hover:bg-gray-50/50">
                    <TableCell className="text-xs text-gray-600 font-mono">{student.matricule}</TableCell>
                    <TableCell className="font-medium text-xs text-gray-800">{`${student.firstName} ${student.lastName}`}</TableCell>
                    <TableCell className="text-xs text-gray-600">{getClassName(student.classId)}</TableCell>
                    <TableCell className="text-xs text-gray-500">{student.dob}</TableCell>
                    <TableCell className="text-xs text-gray-500">{student.sex}</TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <Link href={`/students/${student.id}`}>
                        <Button variant="outline" size="icon" className="h-8 w-8 text-primary hover:bg-primary/10">
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                                  <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-card">
                              <AlertDialogHeader>
                                  <AlertDialogTitle className="text-gray-800">Supprimer l'élève ?</AlertDialogTitle>
                                  <AlertDialogDescription className="text-xs text-gray-500">
                                      Attention : Cette action est irréversible. Le dossier de l'élève <strong>{student.firstName} {student.lastName}</strong> ainsi que <strong>tous ses paiements enregistrés</strong> seront définitivement supprimés.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel className="text-xs">Annuler</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteStudent(student.id)} className="bg-destructive hover:bg-destructive/90 text-xs">Supprimer définitivement</AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={6} className="h-24 text-center text-xs text-muted-foreground">Aucun élève trouvé.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
