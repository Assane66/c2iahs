'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import { PlusCircle, Search, Trash2, Download, Eye, Printer, Loader2, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportJsonToExcel } from '@/lib/export';
import { logAuditAction } from '@/lib/audit';
import { StudentImportDialog } from '@/components/student-import-dialog';
import QRCode from 'qrcode';
import { Checkbox } from '@/components/ui/checkbox';
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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [printingBatch, setPrintingBatch] = useState(false);
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

  const getClassName = (classId?: string, fallbackName?: string) => {
    return classes.find(c => c.id === (classId || ''))?.name || fallbackName || 'N/A';
  };

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
      
      await logAuditAction('student_created', `Création manuelle fiche élève ${newStudentData.firstName} ${newStudentData.lastName} (${formattedId})`);
      toast({ title: 'Succès', description: `Élève ajouté avec le matricule : ${formattedId}` });
      fetchStudentsAndClasses();
      setOpen(false);
      form.reset();
    } catch (error) {
      console.error("Erreur: ", error);
      toast({ title: 'Erreur', description: "Action impossible.", variant: 'destructive' });
    }
  };

  const handleDeleteStudent = async (student: Student) => {
    try {
      const paymentsRef = collection(db, 'payments');
      const q = query(paymentsRef, where('studentId', '==', student.id));
      const paymentsSnapshot = await getDocs(q);
      
      const deletePromises = paymentsSnapshot.docs.map(paymentDoc => deleteDoc(paymentDoc.ref));
      await Promise.all(deletePromises);

      await deleteDoc(doc(db, 'students', student.id));
      await logAuditAction('student_deleted', `Suppression du dossier élève ${student.firstName} ${student.lastName} (${student.matricule})`);

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
  
  const filteredStudents = students.filter(student => {
    const q = searchQuery.toLowerCase();
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    const matricule = student.matricule.toLowerCase();
    const phone = (student.parentPhone || '').toLowerCase();
    const className = getClassName(student.classId).toLowerCase();
    return fullName.includes(q) || matricule.includes(q) || phone.includes(q) || className.includes(q);
  });

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredStudents.map(s => s.id));
    }
  };

  const toggleSelectStudent = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleExportStudents = () => {
    exportJsonToExcel(
      filteredStudents.map((student) => ({
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

  // Print cards in batch: 8 cards per A4 page (85x55 mm standard size)
  const handleBatchPrintCards = async () => {
    const targetStudents = selectedIds.length > 0
      ? students.filter(s => selectedIds.includes(s.id))
      : filteredStudents;

    if (targetStudents.length === 0) {
      toast({ title: 'Attention', description: 'Aucun élève à imprimer.', variant: 'destructive' });
      return;
    }

    setPrintingBatch(true);
    try {
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://c2iahs.com';
      const logoUrl = 'https://res.cloudinary.com/dm6yuokre/image/upload/v1762822007/IMG-20250924-WA0009_1_psprih.jpg';

      // Convert logo to Base64 to avoid network loading delay in print popup
      let base64Logo = logoUrl;
      try {
        const res = await fetch(logoUrl);
        const blob = await res.blob();
        base64Logo = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => resolve(logoUrl);
          reader.readAsDataURL(blob);
        });
      } catch (e) {
        console.warn('Fallback logo URL:', e);
      }

      // Generate QR code for each student
      const cardsData = await Promise.all(
        targetStudents.map(async (student) => {
          const scanUrl = `${currentOrigin}/scan/${student.id}`;
          const qrCodeUrl = await QRCode.toDataURL(scanUrl, { margin: 1, width: 180 });
          return {
            student,
            className: getClassName(student.classId),
            qrCodeUrl,
          };
        })
      );

      // HTML template for individual card (85mm x 55mm)
      const renderCardHtml = (item: typeof cardsData[0]) => `
        <div class="card-wrapper">
          <div class="card-header">
            <img src="${base64Logo}" class="card-logo" alt="Logo" />
            <div class="card-header-text">
              <div class="school-name">CENTRE ISLAMIQUE AL HOUSSEYNOU SOW</div>
              <div class="card-title">CARTE D'ÉLÈVE OFFICIELLE</div>
            </div>
          </div>
          <div class="card-body">
            <div class="card-info">
              <div class="info-row">
                <span class="info-label">Matricule:</span>
                <span class="info-val matricule">${item.student.matricule}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Nom & Prénom:</span>
                <span class="info-val name">${item.student.firstName} ${item.student.lastName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Classe:</span>
                <span class="info-val">${item.className}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Né(e) le:</span>
                <span class="info-val">${item.student.dob || 'N/A'}${item.student.pob ? ` à ${item.student.pob}` : ''}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Tél. Parent:</span>
                <span class="info-val">${item.student.parentPhone || 'N/A'}</span>
              </div>
            </div>
            <div class="card-qr-box">
              <img src="${item.qrCodeUrl}" class="qr-img" alt="QR Code" />
              <div class="qr-label">SCANNER QR</div>
            </div>
          </div>
          <div class="card-footer">
            <span>Tivaouane Peulh, QRT Bayal Ba • C2IAHS</span>
          </div>
        </div>
      `;

      // Split into pages of 8 cards each
      const pages: string[][] = [];
      for (let i = 0; i < cardsData.length; i += 8) {
        const pageCards = cardsData.slice(i, i + 8).map(renderCardHtml);
        pages.push(pageCards);
      }

      const pagesHtml = pages.map((pageCards) => `
        <div class="a4-page">
          ${pageCards.join('')}
        </div>
      `).join('');

      const fullDocumentHtml = `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <title>Cartes Élèves - ${targetStudents.length} carte(s) [8 par page A4]</title>
          <style>
            @page {
              size: A4 portrait;
              margin: 8mm 10mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              background: #f8fafc;
              color: #0f172a;
            }
            @media print {
              body {
                background: transparent;
                padding: 0;
                margin: 0;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              .a4-page {
                box-shadow: none !important;
                background: transparent !important;
                margin: 0 !important;
                page-break-after: always;
              }
              .a4-page:last-child {
                page-break-after: auto;
              }
            }
            .a4-page {
              width: 190mm;
              min-height: 275mm;
              margin: 15px auto;
              background: #ffffff;
              box-shadow: 0 4px 15px rgba(0,0,0,0.1);
              display: grid;
              grid-template-columns: repeat(2, 85mm);
              grid-template-rows: repeat(4, 55mm);
              gap: 6mm 10mm;
              justify-content: center;
              align-content: start;
              padding-top: 3mm;
            }
            .card-wrapper {
              width: 85mm;
              height: 55mm;
              background: #ffffff;
              border: 1px dashed #cbd5e1;
              border-radius: 3.5mm;
              overflow: hidden;
              display: flex;
              flex-direction: column;
              position: relative;
              page-break-inside: avoid;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .card-header {
              background: #047857;
              color: #ffffff;
              padding: 1.8mm 2.5mm;
              display: flex;
              align-items: center;
              gap: 2mm;
              height: 11.5mm;
            }
            .card-logo {
              width: 7.8mm;
              height: 7.8mm;
              border-radius: 1.5mm;
              object-fit: cover;
              border: 1px solid rgba(255,255,255,0.6);
              background: #ffffff;
              flex-shrink: 0;
            }
            .card-header-text {
              flex: 1;
              overflow: hidden;
            }
            .school-name {
              font-size: 5.8pt;
              font-weight: 800;
              letter-spacing: 0.1px;
              text-transform: uppercase;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              color: #ffffff;
            }
            .card-title {
              font-size: 4.8pt;
              font-weight: 700;
              color: #a7f3d0;
              letter-spacing: 0.3px;
              text-transform: uppercase;
            }
            .card-body {
              flex: 1;
              padding: 2mm 2.5mm 1mm 2.5mm;
              display: flex;
              gap: 2mm;
              align-items: center;
            }
            .card-info {
              flex: 1;
              display: flex;
              flex-direction: column;
              gap: 0.8mm;
              overflow: hidden;
            }
            .info-row {
              display: flex;
              align-items: baseline;
              gap: 1mm;
              line-height: 1.1;
            }
            .info-label {
              font-size: 5pt;
              color: #64748b;
              font-weight: 600;
              white-space: nowrap;
            }
            .info-val {
              font-size: 6pt;
              font-weight: 700;
              color: #1e293b;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
            .info-val.matricule {
              color: #047857;
              font-family: monospace;
              font-size: 6.8pt;
              font-weight: 800;
            }
            .info-val.name {
              font-size: 6.5pt;
              font-weight: 800;
              color: #0f172a;
            }
            .card-qr-box {
              width: 22mm;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 1.5mm;
              padding: 1mm;
              flex-shrink: 0;
            }
            .qr-img {
              width: 19mm;
              height: 19mm;
              object-fit: contain;
            }
            .qr-label {
              font-size: 3.8pt;
              font-weight: 800;
              color: #047857;
              text-align: center;
              margin-top: 0.5mm;
              letter-spacing: 0.1px;
            }
            .card-footer {
              height: 4mm;
              background: #f1f5f9;
              border-top: 1px solid #e2e8f0;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 0 2mm;
              font-size: 4.2pt;
              color: #475569;
              font-weight: 600;
            }
          </style>
        </head>
        <body>
          ${pagesHtml}
        </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        toast({ title: 'Erreur', description: 'Veuillez autoriser les fenêtres surgissantes (popups).', variant: 'destructive' });
        return;
      }
      printWindow.document.write(fullDocumentHtml);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } catch (err) {
      console.error('Erreur génération cartes:', err);
      toast({ title: 'Erreur', description: 'Échec lors de la préparation des cartes.', variant: 'destructive' });
    } finally {
      setPrintingBatch(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-800">Gestion des Élèves</h1>
          <p className="text-muted-foreground text-sm">Gérez la liste complète des élèves et imprimez leurs cartes officielles.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            className="border-emerald-600 text-emerald-800 hover:bg-emerald-50"
            onClick={handleBatchPrintCards}
            disabled={printingBatch}
          >
            {printingBatch ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin text-emerald-700" />
            ) : (
              <Printer className="mr-2 h-4 w-4 text-emerald-700" />
            )}
            Imprimer Cartes (8/A4) {selectedIds.length > 0 && `(${selectedIds.length})`}
          </Button>

          <Button
            variant="outline"
            className="hidden sm:inline-flex border-emerald-600 text-emerald-800 hover:bg-emerald-50"
            onClick={() => setImportOpen(true)}
          >
            <Upload className="mr-2 h-4 w-4 text-emerald-700" />
            Importer Excel/CSV
          </Button>

          <Button variant="outline" className="hidden sm:inline-flex border-slate-300 text-slate-800 hover:bg-slate-50" onClick={handleExportStudents}>
            <Download className="mr-2 h-4 w-4" />Exporter Excel
          </Button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white"><PlusCircle className="mr-2 h-4 w-4" /> Ajouter un Élève</Button>
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
                      <SelectTrigger className="col-span-3 h-9 text-xs"><SelectValue placeholder="Choisir une classe" /></SelectTrigger>
                      <SelectContent>{classes.map(c => <SelectItem key={c.id} value={c.id} className="text-xs">{c.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right text-xs">Sexe</Label>
                    <Select name="sex" required defaultValue="Masculin">
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
                  <Button type="submit" className="bg-primary hover:bg-primary/90 text-white text-xs">Enregistrer</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="shadow-sm border-gray-100">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="text-lg">Répertoire des élèves</CardTitle>
              <CardDescription className="text-xs">
                Total: {filteredStudents.length} élèves affichés {selectedIds.length > 0 && `• ${selectedIds.length} sélectionné(s)`}.
              </CardDescription>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input type="search" placeholder="Recherche par matricule, nom, tél, classe..." className="pl-8 h-9 text-xs" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10 text-center">
                  <Checkbox
                    checked={selectedIds.length > 0 && selectedIds.length === filteredStudents.length}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Tout sélectionner"
                  />
                </TableHead>
                <TableHead className="text-xs">Matricule</TableHead>
                <TableHead className="text-xs">Nom & Prénom</TableHead>
                <TableHead className="text-xs">Classe</TableHead>
                <TableHead className="text-xs">Date Naissance</TableHead>
                <TableHead className="text-xs">Tél Parent</TableHead>
                <TableHead className="text-right text-xs">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={7} className="h-24 text-center text-xs">Chargement...</TableCell></TableRow>
              ) : filteredStudents.length > 0 ? (
                filteredStudents.map((student) => {
                  const isSelected = selectedIds.includes(student.id);
                  return (
                    <TableRow key={student.id} className={isSelected ? 'bg-emerald-50/60' : 'hover:bg-gray-50/50'}>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelectStudent(student.id)}
                          aria-label={`Sélectionner ${student.firstName}`}
                        />
                      </TableCell>
                      <TableCell className="text-xs text-primary font-mono font-bold">{student.matricule}</TableCell>
                      <TableCell className="font-semibold text-xs text-gray-800">{`${student.firstName} ${student.lastName}`}</TableCell>
                      <TableCell className="text-xs text-gray-600 font-medium">{getClassName(student.classId)}</TableCell>
                      <TableCell className="text-xs text-gray-500">{student.dob}</TableCell>
                      <TableCell className="text-xs text-gray-600">{student.parentPhone || 'N/A'}</TableCell>
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
                                    <AlertDialogAction onClick={() => handleDeleteStudent(student)} className="bg-destructive hover:bg-destructive/90 text-xs">Supprimer définitivement</AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                         </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow><TableCell colSpan={7} className="h-24 text-center text-xs text-muted-foreground">Aucun élève trouvé.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <StudentImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        classes={classes}
        onImportSuccess={fetchStudentsAndClasses}
      />
    </div>
  );
}
