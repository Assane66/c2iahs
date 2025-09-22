
'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { MoreHorizontal, PlusCircle, FileDown } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';

type Payment = {
  id: string;
  studentName: string;
  status: 'Payé' | 'En attente' | 'En retard';
  amount: string;
  date: string;
};

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPayments = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'payments'));
      const paymentsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Payment[];
      setPayments(paymentsList);
    } catch (error) {
      console.error("Erreur lors de la récupération des paiements: ", error);
      toast({
        title: 'Erreur',
        description: "Impossible de charger l'historique des paiements.",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleAddPayment = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const newPaymentData = {
      studentName: (form.elements.namedItem('studentName') as HTMLInputElement)?.value,
      amount: (form.elements.namedItem('amount') as HTMLInputElement)?.value,
      date: (form.elements.namedItem('date') as HTMLInputElement)?.value,
      status: (form.elements.namedItem('status') as HTMLInputElement)?.value,
    };
    try {
      await addDoc(collection(db, 'payments'), newPaymentData);
      toast({
        title: 'Succès',
        description: 'Paiement ajouté avec succès !',
      });
      fetchPayments(); // Refresh list
      setOpen(false);
      form.reset();
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
      fetchPayments(); // Refresh list
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
      case 'Payé':
        return 'default';
      case 'En retard':
        return 'destructive';
      case 'En attente':
      default:
        return 'secondary';
    }
  };

  const getStatusBadgeClass = (status: string) => {
    if (status === 'Payé') {
      return 'bg-green-600 hover:bg-green-700';
    }
    return '';
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paiements</h1>
          <p className="text-muted-foreground">
            Suivez et gérez les paiements des élèves.
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter un Paiement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un Nouveau Paiement</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddPayment}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="studentName" className="text-right">
                    Nom de l'Élève
                  </Label>
                  <Input id="studentName" name="studentName" className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    Montant
                  </Label>
                  <Input id="amount" name="amount" type="text" placeholder="ex: 50.00" className="col-span-3" required />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Statut
                  </Label>
                   <Select name="status" required>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Payé">Payé</SelectItem>
                      <SelectItem value="En attente">En attente</SelectItem>
                      <SelectItem value="En retard">En retard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Date
                  </Label>
                  <Input id="date" name="date" type="date" className="col-span-3" required />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">
                    Annuler
                  </Button>
                </DialogClose>
                <Button type="submit">Ajouter</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historique des Paiements</CardTitle>
          <CardDescription>
            Un enregistrement de tous les paiements reçus.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom de l'Élève</TableHead>
                <TableHead>ID de Transaction</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Montant</TableHead>
                <TableHead>Date</TableHead>
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
              ) : payments.length > 0 ? (
                payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {payment.studentName}
                    </TableCell>
                    <TableCell>{payment.id}</TableCell>
                    <TableCell>
                      <Badge
                        variant={getStatusBadgeVariant(payment.status)}
                        className={getStatusBadgeClass(payment.status)}
                      >
                        {payment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{payment.amount}</TableCell>
                    <TableCell>{payment.date}</TableCell>
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
                           <DropdownMenuItem onClick={() => handleDeletePayment(payment.id)}>
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Aucun paiement trouvé.
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
