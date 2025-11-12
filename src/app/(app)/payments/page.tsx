
'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MoreHorizontal, PlusCircle, ChevronsUpDown, Check, Search } from 'lucide-react';
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
  studentName: string;
  status: 'Payé' | 'En attente' | 'En retard';
  amount: string;
  date: string;
  month: string; // YYYY-MM
};

type Student = {
  id: string;
  studentId: number;
  name: string;
  class: string;
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [selectedStudentName, setSelectedStudentName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
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
      const paymentsSnapshot = await getDocs(collection(db, 'payments'));
      const paymentsList = paymentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Payment[];
      paymentsList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setPayments(paymentsList);

      const studentsSnapshot = await getDocs(collection(db, 'students'));
      const studentsList = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
      setStudents(studentsList);

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
  }, []);

  const handleAddPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const year = (form.elements.namedItem('year') as HTMLSelectElement)?.value;
    const month = (form.elements.namedItem('month') as HTMLSelectElement)?.value;
    
    if (!selectedStudentName) {
        toast({ title: 'Erreur', description: "Veuillez sélectionner un élève.", variant: 'destructive' });
        return;
    }
    if (!year || !month) {
        toast({ title: 'Erreur', description: "Veuillez sélectionner un mois et une année.", variant: 'destructive' });
        return;
    }

    const newPaymentData = {
      studentName: selectedStudentName,
      amount: (form.elements.namedItem('amount') as HTMLInputElement)?.value,
      date: (form.elements.namedItem('date') as HTMLInputElement)?.value,
      status: (form.elements.namedItem('status') as HTMLInputElement)?.value as 'Payé' | 'En attente' | 'En retard',
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
      setSelectedStudentName('');
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
      case 'En retard': return 'destructive';
      case 'En attente': default: return 'secondary';
    }
  };
  
  const getStatusBadgeClass = (status: string) => {
    if (status === 'Payé') return 'bg-green-600 hover:bg-green-700';
    return '';
  };
  
  const filteredPayments = payments.filter(payment =>
    payment.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paiements</h1>
          <p className="text-muted-foreground">Suivez et gérez les paiements des élèves.</p>
        </div>
        <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) { setSelectedStudentName(''); } }}>
          <DialogTrigger asChild><Button><PlusCircle className="mr-2 h-4 w-4" /> Ajouter un Paiement</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Ajouter un Nouveau Paiement</DialogTitle></DialogHeader>
            <form onSubmit={handleAddPayment}>
              <div className="grid gap-4 py-4">
                {/* Student Selector */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="studentName" className="text-right">Élève</Label>
                   <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" aria-expanded={comboboxOpen} className="col-span-3 w-full justify-between">
                        {selectedStudentName || "Sélectionner un élève..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command><CommandInput placeholder="Rechercher un élève..." /><CommandEmpty>Aucun élève trouvé.</CommandEmpty>
                        <CommandList><CommandGroup>
                            {students.map((student) => (
                              <CommandItem key={student.id} value={student.name} onSelect={(currentValue) => { setSelectedStudentName(currentValue === selectedStudentName ? "" : student.name); setComboboxOpen(false);}}>
                                <Check className={cn("mr-2 h-4 w-4", selectedStudentName === student.name ? "opacity-100" : "opacity-0")}/>
                                <div className="flex flex-col"><span>{student.name}</span><span className="text-xs text-muted-foreground">ID: {student.studentId} | Classe: {student.class}</span></div>
                              </CommandItem>
                            ))}
                        </CommandGroup></CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                {/* Month and Year Selectors */}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right">Mois de Paiement</Label>
                    <div className="col-span-3 grid grid-cols-2 gap-2">
                        <Select name="month" required defaultValue={(new Date().getMonth() + 1).toString().padStart(2, '0')}>
                            <SelectTrigger><SelectValue placeholder="Mois" /></SelectTrigger>
                            <SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select name="year" required defaultValue={currentYear.toString()}>
                            <SelectTrigger><SelectValue placeholder="Année" /></SelectTrigger>
                            <SelectContent>{years.map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </div>
                {/* Amount */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">Montant</Label>
                  <Input id="amount" name="amount" type="number" placeholder="ex: 5000" className="col-span-3" required />
                </div>
                {/* Status */}
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">Statut</Label>
                   <Select name="status" required>
                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Sélectionner un statut" /></SelectTrigger>
                    <SelectContent><SelectItem value="Payé">Payé</SelectItem><SelectItem value="En attente">En attente</SelectItem><SelectItem value="En retard">En retard</SelectItem></SelectContent>
                  </Select>
                </div>
                {/* Date */}
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
              <CardDescription>Un enregistrement de tous les paiements reçus.</CardDescription>
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
                    <TableCell>{payment.date}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button aria-haspopup="true" size="icon" variant="ghost"><MoreHorizontal className="h-4 w-4" /><span className="sr-only">Toggle menu</span></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end"><DropdownMenuLabel>Actions</DropdownMenuLabel><DropdownMenuItem onClick={() => handleDeletePayment(payment.id)}>Supprimer</DropdownMenuItem></DropdownMenuContent>
                      </DropdownMenu>
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
