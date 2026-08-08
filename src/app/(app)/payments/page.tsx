'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PlusCircle, ChevronsUpDown, Check, Search, Trash2, Printer } from 'lucide-react';
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
import { logAuditAction } from '@/lib/audit';
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

type DisplayPayment = Payment & {
  studentName: string;
  matricule?: string;
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
  
  const years = ['2025', '2026', '2027', '2028', '2029', '2030'];
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
      const studentMap = new Map(studentsList.map(s => [s.id, { name: `${s.firstName} ${s.lastName}`, matricule: s.matricule }]));

      const paymentsSnapshot = await getDocs(collection(db, 'payments'));
      const paymentsList = paymentsSnapshot.docs.map(doc => {
        const data = doc.data() as Omit<Payment, 'id'>;
        const studentInfo = studentMap.get(data.studentId);
        return {
          id: doc.id,
          ...data,
          studentName: studentInfo ? studentInfo.name : 'Élève inconnu',
          matricule: studentInfo ? studentInfo.matricule : 'N/A',
        };
      }) as DisplayPayment[];
      setPayments(paymentsList);

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
    fetchPaymentsAndStudents();
  }, []);

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

    const amount = parseFloat((form.elements.namedItem('amount') as HTMLInputElement)?.value);
    const newPaymentData: Omit<Payment, 'id'> = {
      studentId: selectedStudentId,
      amount,
      paymentDate: (form.elements.namedItem('date') as HTMLInputElement)?.value,
      status: (form.elements.namedItem('status') as HTMLInputElement)?.value as Payment['status'],
      month: `${year}-${month}`,
    };

    try {
      await addDoc(collection(db, 'payments'), newPaymentData);
      const studentObj = students.find(s => s.id === selectedStudentId);
      await logAuditAction('payment_added', `Enregistrement d'un paiement de ${amount} FCFA pour ${studentObj?.firstName} ${studentObj?.lastName} (Mois ${year}-${month})`);
      
      toast({
        title: 'Succès',
        description: 'Paiement ajouté avec succès !',
      });
      fetchPaymentsAndStudents();
      setOpen(false);
      form.reset();
      setSelectedStudentId('');
    } catch (error) {
      console.error("Erreur: ", error);
      toast({
        title: 'Erreur',
        description: "Impossible d'ajouter le paiement.",
        variant: 'destructive',
      });
    }
  };

  const handleDeletePayment = async (payment: DisplayPayment) => {
    try {
      await deleteDoc(doc(db, 'payments', payment.id));
      await logAuditAction('payment_deleted', `Suppression du paiement de ${payment.amount} FCFA de ${payment.studentName}`);
      toast({
        title: 'Succès',
        description: 'Paiement supprimé avec succès !',
      });
      fetchPaymentsAndStudents();
    } catch (error) {
      console.error("Erreur: ", error);
      toast({
        title: 'Erreur',
        description: "Impossible de supprimer le paiement.",
        variant: 'destructive',
      });
    }
  };

  const handlePrintReceipt = (payment: DisplayPayment) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Reçu de Paiement - ${payment.matricule}</title>
        <style>
          body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 30px; color: #333; }
          .receipt-box { width: 500px; margin: 0 auto; border: 2px solid #0b573a; padding: 24px; border-radius: 12px; }
          .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 16px; margin-bottom: 20px; }
          .school-title { font-size: 18px; font-weight: bold; color: #0b573a; margin-bottom: 4px; }
          .receipt-title { font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #777; font-weight: bold; }
          .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px dashed #eee; font-size: 14px; }
          .label { font-weight: bold; color: #555; }
          .amount-box { margin-top: 20px; background: #f0fdf4; border: 1px solid #bbf7d0; text-align: center; padding: 12px; border-radius: 8px; font-size: 20px; font-weight: bold; color: #15803d; }
          .footer-sign { margin-top: 40px; display: flex; justify-content: space-between; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="receipt-box">
          <div class="header">
            <div class="school-title">Centre Islamique Institut Al Housseynou Sow</div>
            <div class="receipt-title">REÇU DE PAIEMENT SCOLARITÉ</div>
          </div>
          <div class="row"><span class="label">Date d'émission :</span> <span>${new Date(payment.paymentDate).toLocaleDateString('fr-FR')}</span></div>
          <div class="row"><span class="label">Reçu N° :</span> <span>REC-${payment.id.substring(0, 8).toUpperCase()}</span></div>
          <div class="row"><span class="label">Nom & Prénom de l'élève :</span> <span><strong>${payment.studentName}</strong></span></div>
          <div class="row"><span class="label">Matricule :</span> <span>${payment.matricule}</span></div>
          <div class="row"><span class="label">Mois Concerné :</span> <span>${payment.month}</span></div>
          <div class="row"><span class="label">Statut :</span> <span>${payment.status}</span></div>

          <div class="amount-box">
            Montant Réglé : ${new Intl.NumberFormat('fr-FR').format(Number(payment.amount))} FCFA
          </div>

          <div class="footer-sign">
            <div>Signature Élève / Tuteur</div>
            <div>Cachet & Signature de la Direction</div>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const getStatusBadgeVariant = (status: string) => {
    return status === 'Payé' ? 'default' : 'secondary';
  };
  
  const getStatusBadgeClass = (status: string) => {
    if (status === 'Payé') return 'bg-emerald-700 hover:bg-emerald-800 text-white';
    return '';
  };
  
  const filteredPayments = payments.filter(payment =>
    payment.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (payment.matricule && payment.matricule.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  const selectedStudent = students.find(s => s.id === selectedStudentId);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-800">Paiements & Scolarité</h1>
          <p className="text-muted-foreground text-sm">Suivez et gérez les encaissements de scolarité des élèves.</p>
        </div>
        <Dialog open={open} onOpenChange={(isOpen) => { setOpen(isOpen); if (!isOpen) { setSelectedStudentId(''); } }}>
          <DialogTrigger asChild><Button className="bg-primary hover:bg-primary/90 text-white"><PlusCircle className="mr-2 h-4 w-4" /> Ajouter un Paiement</Button></DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader><DialogTitle>Nouveau Paiement</DialogTitle></DialogHeader>
            <form onSubmit={handleAddPayment}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right text-xs">Élève</Label>
                   <Popover open={comboboxOpen} onOpenChange={setComboboxOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="col-span-3 w-full justify-between text-left font-normal h-9 text-xs">
                        {selectedStudent ? `${selectedStudent.firstName} ${selectedStudent.lastName}` : "Sélectionner un élève..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandInput placeholder="Rechercher un élève..." className="text-xs" />
                        <CommandEmpty>Aucun élève trouvé.</CommandEmpty>
                        <CommandList>
                          <CommandGroup>
                            {students.map((student) => (
                              <CommandItem 
                                key={student.id} 
                                value={`${student.firstName} ${student.lastName}`} 
                                onSelect={() => { setSelectedStudentId(student.id); setComboboxOpen(false); }}
                                className="text-xs"
                              >
                                <Check className={cn("mr-2 h-3 w-3", selectedStudentId === student.id ? "opacity-100" : "opacity-0")}/>
                                <div className="flex flex-col">
                                  <span>{`${student.firstName} ${student.lastName}`}</span>
                                  <span className="text-[10px] text-muted-foreground">{student.matricule}</span>
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right text-xs">Mois / Année</Label>
                    <div className="col-span-3 grid grid-cols-2 gap-2">
                        <Select name="month" required defaultValue={(new Date().getMonth() + 1).toString().padStart(2, '0')}>
                            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Mois" /></SelectTrigger>
                            <SelectContent>{months.map(m => <SelectItem key={m.value} value={m.value} className="text-xs">{m.label}</SelectItem>)}</SelectContent>
                        </Select>
                        <Select name="year" required defaultValue={new Date().getFullYear().toString()}>
                            <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Année" /></SelectTrigger>
                            <SelectContent>{years.map(y => <SelectItem key={y} value={y} className="text-xs">{y}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right text-xs">Montant (FCFA)</Label>
                  <Input id="amount" name="amount" type="number" placeholder="5000" className="col-span-3 h-9 text-xs" required />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right text-xs">Statut</Label>
                   <Select name="status" required defaultValue="Payé">
                    <SelectTrigger className="col-span-3 h-9 text-xs"><SelectValue placeholder="Statut" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Payé" className="text-xs">Payé</SelectItem>
                      <SelectItem value="En attente" className="text-xs">En attente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right text-xs">Date Règlement</Label>
                  <Input id="date" name="date" type="date" className="col-span-3 h-9 text-xs" defaultValue={new Date().toISOString().split('T')[0]} required />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button type="button" variant="ghost" className="text-xs">Annuler</Button></DialogClose>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white text-xs">Ajouter</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="shadow-sm border-gray-100">
        <CardHeader className="pb-4">
           <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-lg">Historique des paiements</CardTitle>
              <CardDescription className="text-xs">Total: {filteredPayments.length} paiements enregistrés.</CardDescription>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Rechercher par élève ou matricule..." className="pl-8 h-9 text-xs" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs">Matricule</TableHead>
                <TableHead className="text-xs">Élève</TableHead>
                <TableHead className="text-xs">Mois</TableHead>
                <TableHead className="text-xs">Statut</TableHead>
                <TableHead className="text-xs">Montant</TableHead>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-right text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? ( <TableRow><TableCell colSpan={7} className="h-24 text-center text-xs">Chargement...</TableCell></TableRow>
              ) : filteredPayments.length > 0 ? (
                filteredPayments.map((payment) => (
                  <TableRow key={payment.id} className="hover:bg-gray-50/50">
                    <TableCell className="text-xs font-mono font-bold text-primary">{payment.matricule}</TableCell>
                    <TableCell className="font-semibold text-xs text-gray-800">{payment.studentName}</TableCell>
                    <TableCell className="text-xs text-gray-600">{payment.month}</TableCell>
                    <TableCell><Badge variant={getStatusBadgeVariant(payment.status)} className={cn("text-[10px] px-2 py-0 h-5", getStatusBadgeClass(payment.status))}>{payment.status}</Badge></TableCell>
                    <TableCell className="text-xs font-bold text-emerald-800">{new Intl.NumberFormat('fr-FR').format(Number(payment.amount))} FCFA</TableCell>
                    <TableCell className="text-xs text-gray-500">{new Date(payment.paymentDate).toLocaleDateString('fr-FR')}</TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button variant="outline" size="sm" className="h-8 text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50" onClick={() => handlePrintReceipt(payment)}>
                        <Printer className="mr-1 h-3.5 w-3.5" /> Reçu
                      </Button>

                       <AlertDialog>
                          <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10">
                                  <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-card">
                              <AlertDialogHeader>
                                  <AlertDialogTitle className="text-gray-800">Supprimer le paiement ?</AlertDialogTitle>
                                  <AlertDialogDescription className="text-xs text-gray-500">
                                      Le paiement de <strong>{payment.studentName}</strong> ({new Intl.NumberFormat('fr-FR').format(Number(payment.amount))} FCFA) sera définitivement retiré.
                                  </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                  <AlertDialogCancel className="text-xs">Annuler</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeletePayment(payment)} className="bg-destructive hover:bg-destructive/90 text-xs">Supprimer</AlertDialogAction>
                              </AlertDialogFooter>
                          </AlertDialogContent>
                       </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))
              ) : ( <TableRow><TableCell colSpan={7} className="h-24 text-center text-xs text-muted-foreground">Aucun paiement trouvé.</TableCell></TableRow> )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
