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

  const handlePrintCard = async () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !student) return;

    const logoUrl = 'https://res.cloudinary.com/dm6yuokre/image/upload/v1762822007/IMG-20250924-WA0009_1_psprih.jpg';
    
    // Ensure QR Code URL exists
    let finalQrUrl = qrCodeUrl;
    if (!finalQrUrl) {
      try {
        const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://c2iahs.com';
        const scanUrl = `${currentOrigin}/scan/${studentId}`;
        finalQrUrl = await QRCode.toDataURL(scanUrl, { margin: 1, width: 220 });
      } catch (err) {
        console.error('Erreur QR Code:', err);
      }
    }

    // Convert logo to Base64 to ensure instant rendering without network lag
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
      console.warn('Fallback URL logo:', e);
    }

    const className = studentClass?.name || 'N/A';

    const html = `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <title>Carte Élève - ${student.matricule}</title>
        <style>
          @page {
            size: 85mm 55mm;
            margin: 0;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            background: #ffffff;
            color: #0f172a;
            width: 85mm;
            height: 55mm;
            overflow: hidden;
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
          }
          .card-header {
            background: #047857 !important;
            color: #ffffff !important;
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
            color: #ffffff !important;
          }
          .card-title {
            font-size: 4.8pt;
            font-weight: 700;
            color: #a7f3d0 !important;
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
            background: #f1f5f9 !important;
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
        <script>
          function autoPrint() {
            const images = Array.from(document.images);
            let loaded = 0;
            if (images.length === 0) {
              setTimeout(() => { window.print(); }, 200);
              return;
            }
            images.forEach(img => {
              if (img.complete && img.naturalWidth !== 0) {
                loaded++;
                if (loaded >= images.length) setTimeout(() => { window.print(); }, 300);
              } else {
                img.onload = img.onerror = () => {
                  loaded++;
                  if (loaded >= images.length) setTimeout(() => { window.print(); }, 300);
                };
              }
            });
          }
          window.addEventListener('load', autoPrint);
        </script>
      </head>
      <body>
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
                <span class="info-val matricule">${student.matricule}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Nom & Prénom:</span>
                <span class="info-val name">${student.firstName} ${student.lastName}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Classe:</span>
                <span class="info-val">${className}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Né(e) le:</span>
                <span class="info-val">${student.dob || 'N/A'}${student.pob ? ` à ${student.pob}` : ''}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Tél. Parent:</span>
                <span class="info-val">${student.parentPhone || 'N/A'}</span>
              </div>
            </div>
            <div class="card-qr-box">
              <img src="${finalQrUrl}" class="qr-img" alt="QR Code" />
              <div class="qr-label">SCANNER QR</div>
            </div>
          </div>
          <div class="card-footer">
            <span>Tivaouane Peulh, QRT Bayal Ba • C2IAHS</span>
          </div>
        </div>
      </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 600);
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
