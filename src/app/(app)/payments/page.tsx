
'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MoreHorizontal, PlusCircle, ChevronsUpDown, Check, Search, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type Payment = {
  id: string;
  studentId: string;
  amount: number;
  paymentDate: string;
  status: 'Payé' | 'En attente';
  month: string; // YYYY-MM
};

type Student = {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
};

// Extend Payment type for display purposes
type DisplayPayment = Payment & {
  studentName: string;
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<DisplayPayment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  
  const years = Array.from({ length: 6 }, (_, i) => 2025 + i);
  const months = [
    { value: '01', label: 'Janvier' }, { value: '02', label: 'Février' },
    { value: '03', label: 'Mars' }, { value: '04', label: 'Avril' },
    { value: '05', label: 'Mai' }, { value: '06', label: 'Juin' },
    { value: '07', label: 'Juillet' }, { value: '08', label: 'Août' },
    { value: '09', label: 'Septembre' }, { value: '10', label: 'Octobre' },
    { value: '11', label: 'Novembre' }, { value: '12', label: 'Décembre' }
  ];

  const fetchPaymentsAndStudents = async () => {
    setLoading(true);
    try {
      const studentsSnapshot = await getDocs(collection(db, 'students'));
      const studentsList = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
      setStudents(studentsList);
      const studentMap = new Map(studentsList.map(s => [s.id, `${s.firstName} ${s.lastName}`]));

      const paymentsSnapshot = await getDocs(query(collection(db, 'payments')));
      const paymentsList = paymentsSnapshot.docs.map(doc => {
        const data = doc.data() as Omit<Payment, 'id'>;
        return {
          id: doc.id,
          ...data,
          studentName: studentMap.get(data.studentId) || 'Élève inconnu',
        }
      }) as DisplayPayment[];
      setPayments(paymentsList);

    } catch (error) {
      console.error("Erreur lors de la récupération des données: ", error);
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
    fetchPaymentsAndStudents();
  }, [toast]);

  const handleAddPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const year = (form.elements.namedItem('year') as HTMLSelectElement)?.value;
    const month = (form.elements.namedItem('month') as HTMLSelectElement)?.value;
    
    if (!selectedStudentId) {
        toast({ title: 'Erreur', description: "Veuillez sélectionner un élève.", variant: 'destructive' });
        return;
    }
    if (!year || !month) {
        toast({ title: 'Erreur', description: "Veuillez sélectionner un mois et une année.", variant: 'destructive' });
        return;
    }

    const newPaymentData: Omit<Payment, 'id'> = {
      studentId: selectedStudentId,
      amount: parseFloat((form.elements.namedItem('amount') as HTMLInputElement)?.value),
      paymentDate: (form.elements.namedItem('date') as HTMLInputElement)?.value,
      status: (form.elements.namedItem('status') as HTMLInputElement)?.value as Payment['status'],
      month: `${year}-${month}`,
    };

    try {
      await addDoc(collection(db, 'payments'), newPaymentData);
      toast({
        title: 'Succès',
        description: 'Paiement ajouté avec succès !',
      });
      fetchPaymentsAndStudents(); // Refresh list
      setOpen(false);
      form.reset();
      setSelectedStudentId('');
    } catch (error) {
      console.error("Erreur lors de l'ajout du paiement: ", error);
      toast({
        title: 'Erreur',
        description: "Impossible d'ajouter le paiement.",
        variant: 'destructive',
      });
    }
  };

  const handleDeletePayment = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'payments', id));
      toast({
        title: 'Succès',
        description: 'Paiement supprimé avec succès !',
      });
      fetchPaymentsAndStudents();
    } catch (error) {
      console.error("Erreur lors de la suppression du paiement: ", error);
      toast({
        title: 'Erreur',
        description: "Impossible de supprimer le paiement.",
        variant: 'destructive',
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Payé': return 'default';
      case 'En attente': default: return 'secondary';
    }
  };
  
  const getStatusBadgeClass = (status: string) => {
    if (status === 'Payé') return 'bg-green-600 hover:bg-green-700';
    return '';
  };
  
  const filteredPayments = payments.filter(payment =>
    payment.studentName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const selectedStudent = students.find(s => s.id === selectedStudentId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paiements</h1>
          <p className="text-muted-foreground">Suivez et gérez les paiements des élèves.</p>
        </div>
        <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) { setSelectedStudentId(''); } }}>
          <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Ajouter un Paiement</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Ajouter un Nouveau Paiement</DialogTitle></DialogHeader>
            <form onSubmit={handleAddPayment}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="studentId" className="text-right">Élève</Label>
                   <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={comboboxOpen} className="col-span-3 w-full justify-between">
                        {selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : "Sélectionner un élève..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command><CommandInput placeholder="Rechercher un élève..." /><CommandEmpty>Aucun élève trouvé.</CommandEmpty>
                        <CommandList><CommandGroup>
                            {students.map((student) => (
                              <CommandItem key={student.id} value={`${student.firstName} ${student.lastName}`} onSelect={() => { setSelectedStudentId(student.id); setComboboxOpen(false);}}>
                                <Check className={cn("mr-2 h-4 w-4", selectedStudentId === student.id ? "opacity-100" : "opacity-0")}/>
                                <div className="flex flex-col"><span>{`${student.firstName} ${student.lastName}`}</span><span className="text-xs text-muted-foreground">{student.matricule}</span></div>
                              </CommandItem>
                            ))}
                        </CommandGroup></CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Mois de Paiement</Label>
                    <div className="col-span-3 grid grid-cols-2 gap-2">
                        <Select name="month" required defaultValue={(new Date().getMonth() + 1).toString().padStart(2, '0')}>
                            <SelectTrigger><SelectValue placeholder="Mois" /></SelectTrigger>
                            <SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select name="year" required defaultValue={new Date().getFullYear().toString()}>
                            <SelectTrigger><SelectValue placeholder="Année" /></SelectTrigger>
                            <SelectContent>{years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">Montant</Label>
                  <Input id="amount" name="amount" type="number" placeholder="ex: 5000" className="col-span-3" required />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">Statut</Label>
                   <Select name="status" required>
                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Sélectionner un statut" /></SelectTrigger>
                    <SelectContent><SelectItem value="Payé">Payé</SelectItem><SelectItem value="En attente">En attente</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">Date</Label>
                  <Input id="date" name="date" type="date" className="col-span-3" defaultValue={new Date().toISOString().split('T')[0]} required />
                </div>
              </div>
              <DialogFooter><DialogClose asChild><Button type="button" variant="secondary">Annuler</Button></DialogClose><Button type="submit">Ajouter</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
           <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Historique des Paiements</CardTitle>
              <CardDescription>Un enregistrement de tous les paiements ({filteredPayments.length}).</CardDescription>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Rechercher par nom..." className="pl-8" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom de l'Élève</TableHead>
                <TableHead>Mois Payé</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Date</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? ( <TableRow><TableCell colSpan={6} className="h-24 text-center">Chargement...</TableCell></TableRow>
              ) : filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.studentName}</TableCell>
                    <TableCell>{payment.month}</TableCell>
                    <TableCell><Badge variant={getStatusBadgeVariant(payment.status)} className={getStatusBadgeClass(payment.status)}>{payment.status}</Badge></TableCell>
                    <TableCell>{new Intl.NumberFormat('fr-FR').format(Number(payment.amount))} FCFA</TableCell>
                    <TableCell>{new Date(payment.paymentDate).toLocaleDateString('fr-FR')}</TableCell>
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
                                      Cette action est irréversible. Le paiement de <strong>{payment.studentName}</strong> d'un montant de <strong>{new Intl.NumberFormat('fr-FR').format(Number(payment.amount))} FCFA</strong> sera définitivement supprimé.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeletePayment(payment.id)}>
                                      Supprimer
                                  </AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : ( <TableRow><TableCell colSpan={6} className="h-24 text-center">Aucun paiement trouvé.</TableCell></TableRow> )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
