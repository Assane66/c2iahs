'use client';

import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  limit,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { exportJsonToExcel } from '@/lib/export';
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { logAuditAction } from '@/lib/audit';
import {
  CheckCircle2,
  Download,
  Edit3,
  MessageCircle,
  Search,
  XCircle,
  FileSpreadsheet,
} from 'lucide-react';

type Registration = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  requestedClass: string;
  birthPlace?: string | null;
  birthDate?: string | null;
  status: 'En attente' | 'Acceptée' | 'Refusée';
  remarks?: string;
  studentId?: string;
  createdAt?: { seconds: number } | null;
};

type ClassInfo = {
  id: string;
  name: string;
  academicYear?: string;
};

export default function InscriptionsPage() {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedRegistration, setSelectedRegistration] = useState<Registration | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const classesSnapshot = await getDocs(collection(db, 'classes'));
      const classesList = classesSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as ClassInfo[];
      setClasses(classesList);

      const regsSnapshot = await getDocs(collection(db, 'registrations'));
      const regsList = regsSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Registration[];

      regsList.sort((a, b) => {
        const aDate = a.createdAt?.seconds ?? 0;
        const bDate = b.createdAt?.seconds ?? 0;
        return bDate - aDate;
      });
      setRegistrations(regsList);
    } catch (error) {
      console.error('Erreur chargement inscriptions:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les demandes d’inscription.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    if (status === 'Acceptée') return 'default';
    if (status === 'Refusée') return 'destructive';
    return 'secondary';
  };

  const handleOpenEdit = (registration: Registration) => {
    setSelectedRegistration(registration);
    setIsEditOpen(true);
  };

  const handleSaveRegistration = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedRegistration) return;

    const form = e.currentTarget;
    const updatedData = {
      firstName: (form.elements.namedItem('firstName') as HTMLInputElement).value.trim(),
      lastName: (form.elements.namedItem('lastName') as HTMLInputElement).value.trim(),
      phone: (form.elements.namedItem('phone') as HTMLInputElement).value.trim(),
      requestedClass: (form.elements.namedItem('requestedClass') as HTMLInputElement).value.trim(),
      birthPlace: (form.elements.namedItem('birthPlace') as HTMLInputElement).value.trim() || null,
      birthDate: (form.elements.namedItem('birthDate') as HTMLInputElement).value || null,
      remarks: (form.elements.namedItem('remarks') as HTMLInputElement).value.trim() || '',
      updatedAt: serverTimestamp(),
    };

    try {
      await updateDoc(doc(db, 'registrations', selectedRegistration.id), updatedData);
      await logAuditAction('inscription_edited', `Modification fiche demande de ${updatedData.firstName} ${updatedData.lastName}`);
      toast({ title: 'Mise à jour enregistrée', description: 'La demande a bien été modifiée.' });
      setIsEditOpen(false);
      setSelectedRegistration(null);
      fetchData();
    } catch (error) {
      console.error('Erreur mise à jour inscription:', error);
      toast({ title: 'Erreur', description: 'Impossible de sauvegarder la modification.', variant: 'destructive' });
    }
  };

  const generateMatricule = async () => {
    const currentYear = new Date().getFullYear();
    const yearPrefix = `ELV${currentYear}`;
    const lastStudentQuery = query(collection(db, 'students'), orderBy('numericId', 'desc'), limit(1));
    const snapshot = await getDocs(lastStudentQuery);
    let nextId = 1;
    if (!snapshot.empty) {
      const lastStudent = snapshot.docs[0].data();
      nextId = (lastStudent.numericId || 0) + 1;
    }
    return { numericId: nextId, matricule: `${yearPrefix}-${String(nextId).padStart(3, '0')}` };
  };

  const handleStatusChange = async (registration: Registration, status: Registration['status']) => {
    if (!registration) return;

    try {
      const updatePayload: any = {
        status,
        updatedAt: serverTimestamp(),
      };

      if (status === 'Acceptée' && !registration.studentId) {
        const { numericId, matricule } = await generateMatricule();
        const matchedClass = classes.find((c) => c.name.toLowerCase() === registration.requestedClass.toLowerCase());
        const studentDoc = await addDoc(collection(db, 'students'), {
          firstName: registration.firstName,
          lastName: registration.lastName,
          dob: registration.birthDate || '',
          pob: registration.birthPlace || '',
          classId: matchedClass?.id || '',
          sex: 'Masculin',
          address: '',
          parentPhone: registration.phone,
          matricule,
          numericId,
          registrationDate: new Date().toISOString().split('T')[0],
        });
        updatePayload.studentId = studentDoc.id;

        await logAuditAction('inscription_accepted', `Inscription acceptée pour ${registration.firstName} ${registration.lastName} (Matricule: ${matricule})`);
        
        await addDoc(collection(db, 'notifications'), {
          title: 'Nouvel élève inscrit',
          message: `L'inscription de ${registration.firstName} ${registration.lastName} a été validée (${matricule}).`,
          type: 'success',
          read: false,
          createdAt: serverTimestamp(),
        });
      } else if (status === 'Refusée') {
        await logAuditAction('inscription_rejected', `Inscription refusée pour ${registration.firstName} ${registration.lastName}`);
      }

      await updateDoc(doc(db, 'registrations', registration.id), updatePayload);
      toast({ title: 'Statut mis à jour', description: `La demande est maintenant ${status}.` });
      fetchData();
    } catch (error) {
      console.error('Erreur changement statut:', error);
      toast({ title: 'Erreur', description: 'Impossible de mettre à jour le statut.', variant: 'destructive' });
    }
  };

  const filteredRegistrations = registrations.filter((registration) => {
    const queryStr = searchQuery.toLowerCase();
    const matchesQuery = (
      registration.firstName.toLowerCase().includes(queryStr) ||
      registration.lastName.toLowerCase().includes(queryStr) ||
      registration.phone.toLowerCase().includes(queryStr) ||
      registration.requestedClass.toLowerCase().includes(queryStr)
    );
    const matchesStatus = statusFilter === 'all' || registration.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const handleExportFiltered = (filterType: string) => {
    let listToExport = registrations;
    let fileName = `inscriptions-toutes-${new Date().toISOString().split('T')[0]}.xlsx`;

    if (filterType === 'Acceptée') {
      listToExport = registrations.filter((r) => r.status === 'Acceptée');
      fileName = `inscriptions-acceptees-${new Date().toISOString().split('T')[0]}.xlsx`;
    } else if (filterType === 'Refusée') {
      listToExport = registrations.filter((r) => r.status === 'Refusée');
      fileName = `inscriptions-refusees-${new Date().toISOString().split('T')[0]}.xlsx`;
    } else if (filterType === 'En attente') {
      listToExport = registrations.filter((r) => r.status === 'En attente');
      fileName = `inscriptions-en-attente-${new Date().toISOString().split('T')[0]}.xlsx`;
    }

    exportJsonToExcel(
      listToExport.map((registration) => ({
        Prénom: registration.firstName,
        Nom: registration.lastName,
        Téléphone: registration.phone,
        ClasseDemandée: registration.requestedClass,
        Statut: registration.status,
        DateNaissance: registration.birthDate || '',
        LieuNaissance: registration.birthPlace || '',
        Remarques: registration.remarks || '',
        CrééLe: registration.createdAt
          ? new Date(registration.createdAt.seconds * 1000).toLocaleDateString('fr-FR')
          : '',
      })),
      'Inscriptions',
      fileName
    );
  };

  const getWhatsAppLink = (registration: Registration, status: Registration['status']) => {
    const base = 'https://wa.me/221781635209';
    const message = `Bonjour,%20la%20demande%20de%20${registration.firstName}%20${registration.lastName}%20a%20été%20${status.toLowerCase()}.%0ATél:%20${registration.phone}%0AClasse:%20${registration.requestedClass}`;
    return `${base}?text=${message}`;
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inscriptions</h1>
          <p className="text-muted-foreground text-sm">Gérez les demandes d'inscription et transformez-les en dossiers élèves.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-[240px]">
            <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]"><SelectValue placeholder="Tous les statuts" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="En attente">En attente</SelectItem>
              <SelectItem value="Acceptée">Acceptée</SelectItem>
              <SelectItem value="Refusée">Refusée</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={(val) => handleExportFiltered(val)}>
            <SelectTrigger className="w-[170px] bg-emerald-700 text-white hover:bg-emerald-800">
              <Download className="mr-1.5 h-4 w-4" /> Exporter Excel
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les demandes</SelectItem>
              <SelectItem value="Acceptée">Élèves Acceptés</SelectItem>
              <SelectItem value="En attente">Demandes en attente</SelectItem>
              <SelectItem value="Refusée">Élèves Refusés</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between w-full">
            <div>
              <CardTitle>Demandes d'inscription</CardTitle>
              <CardDescription>{filteredRegistrations.length} demandes affichées</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Classe demandée</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Créé le</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Chargement...
                  </TableCell>
                </TableRow>
              ) : filteredRegistrations.length > 0 ? (
                filteredRegistrations.map((registration) => (
                  <TableRow key={registration.id} className="group hover:bg-muted/50">
                    <TableCell className="font-semibold">{registration.firstName} {registration.lastName}</TableCell>
                    <TableCell>{registration.phone}</TableCell>
                    <TableCell>{registration.requestedClass}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusVariant(registration.status)}>{registration.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {registration.createdAt ? new Date(registration.createdAt.seconds * 1000).toLocaleDateString('fr-FR') : 'N/A'}
                    </TableCell>
                    <TableCell className="flex flex-wrap gap-1.5">
                      <Button size="sm" variant="outline" onClick={() => handleOpenEdit(registration)}>
                        <Edit3 className="mr-1 h-3.5 w-3.5" />Modifier
                      </Button>
                      <Button size="sm" className="bg-emerald-700 hover:bg-emerald-800 text-white" onClick={() => handleStatusChange(registration, 'Acceptée')}>
                        <CheckCircle2 className="mr-1 h-3.5 w-3.5" />Accepter
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleStatusChange(registration, 'Refusée')}>
                        <XCircle className="mr-1 h-3.5 w-3.5" />Refuser
                      </Button>
                      <Button size="sm" variant="outline" className="text-emerald-700 border-emerald-300" onClick={() => window.open(getWhatsAppLink(registration, registration.status), '_blank')}>
                        <MessageCircle className="mr-1 h-3.5 w-3.5" />WhatsApp
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Aucune demande trouvée.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier la demande d'inscription</DialogTitle>
            <DialogDescription>Corrigez les informations de la demande, le statut et les remarques.</DialogDescription>
          </DialogHeader>
          {selectedRegistration ? (
            <form onSubmit={handleSaveRegistration} className="space-y-4">
              <div className="grid gap-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="firstName" className="text-right">Prénom</Label>
                  <Input id="firstName" name="firstName" defaultValue={selectedRegistration.firstName} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="lastName" className="text-right">Nom</Label>
                  <Input id="lastName" name="lastName" defaultValue={selectedRegistration.lastName} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="phone" className="text-right">Téléphone</Label>
                  <Input id="phone" name="phone" defaultValue={selectedRegistration.phone} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="requestedClass" className="text-right">Classe demandée</Label>
                  <Input id="requestedClass" name="requestedClass" defaultValue={selectedRegistration.requestedClass} className="col-span-3" required />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="birthPlace" className="text-right">Lieu de naissance</Label>
                  <Input id="birthPlace" name="birthPlace" defaultValue={selectedRegistration.birthPlace ?? ''} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="birthDate" className="text-right">Date de naissance</Label>
                  <Input id="birthDate" name="birthDate" type="date" defaultValue={selectedRegistration.birthDate ?? ''} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="remarks" className="text-right">Remarques</Label>
                  <Input id="remarks" name="remarks" defaultValue={selectedRegistration.remarks ?? ''} className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button type="button" variant="secondary">Annuler</Button>
                </DialogClose>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">Sauvegarder</Button>
              </DialogFooter>
            </form>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
