'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { exportJsonToExcel } from '@/lib/export';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Printer, Download, CheckCircle2, AlertCircle, CreditCard, ShieldCheck, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import QRCode from 'qrcode';

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
  academicYearId?: string;
  status?: 'Actif' | 'Inactif';
};

type Class = {
  id: string;
  name: string;
  monthlyFee?: number;
};

type Payment = {
  id?: string;
  studentId: string;
  month: string; // e.g. "2026-10" or month code "10"
  amount: number;
  status: 'Payé' | 'En attente';
  paymentDate: string;
};

const schoolMonths = [

  { value: '11', name: 'Novembre' },
  { value: '12', name: 'Décembre' },
  { value: '01', name: 'Janvier' },
  { value: '02', name: 'Février' },
  { value: '03', name: 'Mars' },
  { value: '04', name: 'Avril' },
  { value: '05', name: 'Mai' },
  { value: '06', name: 'Juin' },
  { value: '07', name: 'Juillet' },
];

export default function StudentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string;
  const { toast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [studentClass, setStudentClass] = useState<Class | null>(null);
  const [payments, setPayments] = useState<{ [monthCode: string]: { id?: string; status: 'Payé' | 'En attente' } }>({});
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [updatingMonth, setUpdatingMonth] = useState<string | null>(null);

  const fetchStudentData = async () => {
    try {
      const studentDoc = await getDoc(doc(db, 'students', studentId));
      if (!studentDoc.exists()) {
        toast({ title: 'Introuvable', description: 'Élève non trouvé.', variant: 'destructive' });
        router.push('/students');
        return;
      }

      const studentData = { id: studentDoc.id, status: 'Actif', ...studentDoc.data() } as Student;
      setStudent(studentData);

      if (studentData.classId) {
        const classDoc = await getDoc(doc(db, 'classes', studentData.classId));
        if (classDoc.exists()) {
          setStudentClass({ id: classDoc.id, ...classDoc.data() } as Class);
        }
      }

      // Fetch student payments
      const paymentsQuery = query(collection(db, 'payments'), where('studentId', '==', studentId));
      const paymentsSnap = await getDocs(paymentsQuery);
      
      const paymentsMap: { [monthCode: string]: { id?: string; status: 'Payé' | 'En attente' } } = {};
      paymentsSnap.docs.forEach((d) => {
        const data = d.data();
        const monthStr = String(data.month || '');
        // Extract month code (e.g. "10" from "2026-10" or "10")
        const monthCode = monthStr.includes('-') ? monthStr.split('-')[1] : monthStr;
        if (monthCode) {
          paymentsMap[monthCode] = {
            id: d.id,
            status: data.status === 'Payé' ? 'Payé' : 'En attente',
          };
        }
      });
      setPayments(paymentsMap);

      // Generate QR Code with full details verification link
      const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://c2iahs.com';
      const scanUrl = `${currentOrigin}/scan/${studentId}`;
      const qrUrl = await QRCode.toDataURL(scanUrl, { margin: 1, width: 220 });
      setQrCodeUrl(qrUrl);
    } catch (error) {
      console.error(error);
      toast({ title: 'Erreur', description: 'Impossible de charger la fiche élève.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) fetchStudentData();
  }, [studentId]);

  // Toggle payment status for a given month
  const handleTogglePaymentStatus = async (monthCode: string, monthName: string) => {
    if (!student) return;
    setUpdatingMonth(monthCode);

    const existingPayment = payments[monthCode];
    const currentYear = new Date().getFullYear();
    const fullMonthStr = `${currentYear}-${monthCode}`;

    try {
      if (existingPayment?.status === 'Payé') {
        // Switch from Réglé to En attente
        if (existingPayment.id) {
          await updateDoc(doc(db, 'payments', existingPayment.id), {
            status: 'En attente',
            updatedAt: serverTimestamp(),
          });
        }
        toast({
          title: `Mois de ${monthName}`,
          description: 'Statut mis à jour : En attente',
        });
      } else {
        // Switch to Réglé (Payé)
        if (existingPayment?.id) {
          await updateDoc(doc(db, 'payments', existingPayment.id), {
            status: 'Payé',
            paymentDate: new Date().toISOString().split('T')[0],
            updatedAt: serverTimestamp(),
          });
        } else {
          await addDoc(collection(db, 'payments'), {
            studentId,
            month: fullMonthStr,
            amount: studentClass?.monthlyFee || 15000,
            status: 'Payé',
            paymentDate: new Date().toISOString().split('T')[0],
            createdAt: serverTimestamp(),
          });
        }
        toast({
          title: `Mois de ${monthName}`,
          description: 'Paiement enregistré : Réglé ✓',
        });
      }
      await fetchStudentData();
    } catch (error) {
      console.error('Erreur changement statut paiement:', error);
      toast({ title: 'Erreur', description: 'Impossible de modifier le statut.', variant: 'destructive' });
    } finally {
      setUpdatingMonth(null);
    }
  };

  // Calculate payment stats
  const paidCount = schoolMonths.filter((m) => payments[m.value]?.status === 'Payé').length;
  const totalMonthsCount = schoolMonths.length;

  const handlePrintCard = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !student) return;

    const html = `
      <html>
      <head>
        <title>Carte élève - ${student.matricule}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 24px; color: #1e293b; }
          .card { width: 360px; border: 2px solid #0b573a; padding: 20px; border-radius: 20px; background: #ffffff; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 16px; border-bottom: 1px border-slate-200; padding-bottom: 12px; }
          .logo { width: 60px; height: 60px; border-radius: 12px; object-fit: cover; margin: 0 auto 8px; border: 1px solid #e2e8f0; }
          .title { font-size: 16px; font-weight: 800; color: #0b573a; margin-bottom: 2px; }
          .subtitle { font-size: 11px; color: #64748b; margin-bottom: 8px; font-weight: 600; }
          .status-badge { display: inline-block; background: #dcfce7; color: #15803d; font-size: 10px; font-weight: bold; padding: 3px 12px; border-radius: 9999px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; border-bottom: 1px dashed #f1f5f9; padding-bottom: 4px; }
          .label { color: #64748b; font-size: 12px; }
          .value { color: #0f172a; font-weight: 700; }
          .qr-container { text-align: center; margin-top: 16px; background: #f8fafc; padding: 12px; border-radius: 12px; border: 1px solid #e2e8f0; }
          .qr { width: 120px; height: 120px; object-fit: cover; margin: 0 auto; }
          .bilan { font-size: 11px; font-weight: 700; color: #0b573a; margin-top: 6px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <img class="logo" src="https://res.cloudinary.com/dm6yuokre/image/upload/v1762822007/IMG-20250924-WA0009_1_psprih.jpg" alt="Logo" />
            <div class="title">Centre Islamique Al Housseynou Sow</div>
            <div class="subtitle">Carte d'Élève Officielle ${new Date().getFullYear()}</div>
            <div class="status-badge">ÉLÈVE ACTIF — INSCRIT</div>
          </div>
          <div class="row"><span class="label">Matricule</span><span class="value">${student.matricule}</span></div>
          <div class="row"><span class="label">Nom & Prénom</span><span class="value">${student.firstName} ${student.lastName}</span></div>
          <div class="row"><span class="label">Classe</span><span class="value">${studentClass?.name || 'N/A'}</span></div>
          <div class="row"><span class="label">Date de Naissance</span><span class="value">${student.dob}</span></div>
          <div class="row"><span class="label">Lieu</span><span class="value">${student.pob || 'N/A'}</span></div>
          <div class="row"><span class="label">Tél. Parent</span><span class="value">${student.parentPhone || 'N/A'}</span></div>
          <div class="qr-container">
            <img class="qr" src="${qrCodeUrl}" alt="QR Code" />
            <div class="bilan">Bilan Scolarité : ${paidCount} / ${totalMonthsCount} mois réglés</div>
            <div style="font-size: 9px; color: #64748b; margin-top: 2px;">Scanner avec un téléphone pour vérifier le statut direct</div>
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

  const handleExportStudent = () => {
    if (!student) return;
    exportJsonToExcel([
      {
        Matricule: student.matricule,
        Prénom: student.firstName,
        Nom: student.lastName,
        Classe: studentClass?.name || '',
        DateDeNaissance: student.dob,
        LieuDeNaissance: student.pob,
        Sexe: student.sex,
        Adresse: student.address || '',
        TelephoneParent: student.parentPhone || '',
        DateInscription: student.registrationDate,
        MoisPayés: `${paidCount} / ${totalMonthsCount}`,
      },
    ], 'Fiche Élève', `fiche-eleve-${student?.matricule}.xlsx`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-slate-500 font-medium gap-2">
        <Loader2 className="h-5 w-5 animate-spin text-emerald-600" /> Chargement de la fiche élève...
      </div>
    );
  }

  if (!student) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/students" className="inline-flex items-center rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium hover:bg-slate-100 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold text-slate-900">{student.firstName} {student.lastName}</h1>
              <Badge className="bg-emerald-600 text-white font-bold"><CheckCircle2 className="h-3 w-3 mr-1" /> Actif</Badge>
            </div>
            <p className="text-xs text-muted-foreground font-mono">Matricule : {student.matricule}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="border-emerald-300 text-emerald-800 hover:bg-emerald-50" onClick={handleExportStudent}>
            <Download className="mr-2 h-4 w-4" /> Exporter Fiche
          </Button>
          <Button className="bg-primary hover:bg-primary/90 text-white" onClick={handlePrintCard}>
            <Printer className="mr-2 h-4 w-4" /> Imprimer Carte &amp; QR
          </Button>
        </div>
      </div>

      {/* Bilan Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border-l-4 border-l-emerald-600 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Statut Élève</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-emerald-700 flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-emerald-600" /> Actif &amp; Inscrit
            </div>
            <p className="text-xs text-slate-500 mt-1">Classe : <span className="font-bold text-slate-800">{studentClass?.name || 'N/A'}</span></p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-emerald-500 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mois Réglés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-emerald-700">
              {paidCount} / {totalMonthsCount} Mois
            </div>
            <p className="text-xs text-emerald-600 font-medium mt-1">
              {paidCount > 0 ? `${paidCount} mois enregistrés comme réglés` : 'Aucun mois réglé pour le moment'}
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500 bg-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Mois En Attente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-amber-700">
              {totalMonthsCount - paidCount} Mois
            </div>
            <p className="text-xs text-slate-500 mt-1">Cliquez sur un mois ci-dessous pour changer son statut</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          {/* GESTION ET INTERACTION SUR LES 10 MOIS (REGLE / EN ATTENTE) */}
          <Card className="border-emerald-200 shadow-md">
            <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 rounded-t-xl">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-emerald-950">
                    <CreditCard className="h-5 w-5 text-emerald-700" /> Gestion Directe des Paiements (10 Mois)
                  </CardTitle>
                  <CardDescription className="text-emerald-800 text-xs">
                    Cliquez sur n&apos;importe quel mois pour basculer directement entre <strong className="text-emerald-700">Réglé</strong> et <strong className="text-amber-700">En attente</strong>.
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" onClick={fetchStudentData} className="text-emerald-700 hover:bg-emerald-100">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {schoolMonths.map((m) => {
                  const isPaid = payments[m.value]?.status === 'Payé';
                  const isUpdating = updatingMonth === m.value;

                  return (
                    <button
                      key={m.value}
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleTogglePaymentStatus(m.value, m.name)}
                      className={`relative p-4 rounded-2xl border text-center transition-all duration-200 cursor-pointer shadow-sm hover:scale-[1.03] active:scale-[0.98] ${
                        isPaid
                          ? 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 shadow-emerald-600/20'
                          : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      {isUpdating ? (
                        <div className="flex items-center justify-center py-2">
                          <Loader2 className="h-5 w-5 animate-spin" />
                        </div>
                      ) : (
                        <>
                          <div className="text-sm font-extrabold">{m.name}</div>
                          <div className="mt-2 inline-flex items-center justify-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-white/20">
                            {isPaid ? '✓ RÉGLÉ' : '⚠ EN ATTENTE'}
                          </div>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* INFORMATIONS PERSONNELLES */}
          <Card>
            <CardHeader>
              <CardTitle>Dossier Élève &amp; Tuteur</CardTitle>
              <CardDescription>Informations administratives enregistrées.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Prénom &amp; Nom</span>
                <p className="text-base font-bold text-slate-900">{student.firstName} {student.lastName}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Classe</span>
                <p className="text-base font-bold text-emerald-700">{studentClass?.name || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Date de Naissance</span>
                <p className="text-sm font-medium">{student.dob}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Lieu de Naissance</span>
                <p className="text-sm font-medium">{student.pob || 'N/A'}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Sexe</span>
                <p className="text-sm font-medium">{student.sex}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground">Téléphone Parent / Tuteur</span>
                <p className="text-sm font-bold text-slate-800">{student.parentPhone || 'N/A'}</p>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <span className="text-xs text-muted-foreground">Adresse</span>
                <p className="text-sm font-medium">{student.address || 'N/A'}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CARTE ET QR CODE SCANNER */}
        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Carte Élève &amp; QR Code</CardTitle>
            <CardDescription>Scanner le code QR pour vérifier l&apos;état en direct.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 items-center text-center">
            {qrCodeUrl ? (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl inline-block mx-auto shadow-inner">
                <img className="h-44 w-44 rounded-xl" src={qrCodeUrl} alt="QR Code élève" />
              </div>
            ) : (
              <div className="py-8 text-xs text-slate-400">Génération du QR code...</div>
            )}
            
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left text-xs space-y-2">
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-muted-foreground">Matricule :</span>
                <span className="font-bold text-emerald-800 font-mono">{student.matricule}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5">
                <span className="text-muted-foreground">Classe :</span>
                <span className="font-bold">{studentClass?.name || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bilan Paiements :</span>
                <span className="font-extrabold text-emerald-700">{paidCount} / {totalMonthsCount} Mois réglés</span>
              </div>
            </div>

            <Button variant="outline" className="w-full text-xs font-semibold" onClick={handlePrintCard}>
              <Printer className="mr-2 h-3.5 w-3.5" /> Imprimer Carte Officielle
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
