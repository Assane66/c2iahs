'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Printer, Download, Clipboard } from 'lucide-react';
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
};

type Class = {
  id: string;
  name: string;
};

export default function StudentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string;
  const { toast } = useToast();
  const [student, setStudent] = useState<Student | null>(null);
  const [studentClass, setStudentClass] = useState<Class | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentDoc = await getDoc(doc(db, 'students', studentId));
        if (!studentDoc.exists()) {
          toast({ title: 'Introuvable', description: 'Élève non trouvé.', variant: 'destructive' });
          router.push('/students');
          return;
        }

        const studentData = { id: studentDoc.id, ...studentDoc.data() } as Student;
        setStudent(studentData);

        if (studentData.classId) {
          const classDoc = await getDoc(doc(db, 'classes', studentData.classId));
          if (classDoc.exists()) {
            setStudentClass({ id: classDoc.id, ...classDoc.data() } as Class);
          }
        }

        const qrData = `https://c2iahs.com/students/${studentId}`;
        const qrUrl = await QRCode.toDataURL(qrData);
        setQrCodeUrl(qrUrl);
      } catch (error) {
        console.error(error);
        toast({ title: 'Erreur', description: 'Impossible de charger la fiche élève.', variant: 'destructive' });
      } finally {
        setLoading(false);
      }
    };

    if (studentId) fetchData();
  }, [studentId, router, toast]);

  const handlePrintCard = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !student) return;

    const html = `
      <html>
      <head>
        <title>Carte élève - ${student.matricule}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; }
          .card { width: 360px; border: 1px solid #ddd; padding: 16px; border-radius: 16px; }
          .header { text-align: center; margin-bottom: 16px; }
          .logo { width: 64px; height: 64px; border-radius: 9999px; object-fit: cover; margin: 0 auto 12px; }
          .title { font-size: 18px; font-weight: 700; margin-bottom: 6px; }
          .subtitle { font-size: 12px; color: #555; margin-bottom: 16px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .label { color: #444; font-size: 12px; }
          .value { color: #111; font-size: 14px; font-weight: 600; }
          .qr { margin-top: 16px; width: 112px; height: 112px; object-fit: cover; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <img class="logo" src="https://res.cloudinary.com/dm6yuokre/image/upload/v1762822007/IMG-20250924-WA0009_1_psprih.jpg" alt="Logo" />
            <div class="title">Institut Imam Al Housseynou Sow</div>
            <div class="subtitle">Carte d'élève ${new Date().getFullYear()} - ${new Date().getFullYear()+1}</div>
          </div>
          <div class="row"><span class="label">Matricule</span><span class="value">${student.matricule}</span></div>
          <div class="row"><span class="label">Nom</span><span class="value">${student.firstName} ${student.lastName}</span></div>
          <div class="row"><span class="label">Classe</span><span class="value">${studentClass?.name || 'N/A'}</span></div>
          <div class="row"><span class="label">Né(e) le</span><span class="value">${student.dob}</span></div>
          <div class="row"><span class="label">Lieu</span><span class="value">${student.pob || 'N/A'}</span></div>
          <div class="row"><span class="label">Tél. parent</span><span class="value">${student.parentPhone || 'N/A'}</span></div>
          <img class="qr" src="${qrCodeUrl}" alt="QR Code" />
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
      },
    ], 'Fiche Élève', `fiche-eleve-${student?.matricule}.xlsx`);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        Chargement...
      </div>
    );
  }

  if (!student) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Link href="/students" className="inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium hover:bg-muted">
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Fiche Élève</h1>
            <p className="text-muted-foreground">Détails de l'élève {student.firstName} {student.lastName}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={handleExportStudent}>
            <Download className="mr-2 h-4 w-4" />Exporter
          </Button>
          <Button onClick={handlePrintCard}>
            <Printer className="mr-2 h-4 w-4" />Imprimer carte
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader>
            <CardTitle>Informations personnelles</CardTitle>
            <CardDescription>Fiche complète de l'élève</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <span className="text-xs text-muted-foreground">Matricule</span>
              <p className="text-lg font-semibold">{student.matricule}</p>
            </div>
            <div className="grid gap-2">
              <span className="text-xs text-muted-foreground">Nom complet</span>
              <p className="text-lg font-semibold">{student.firstName} {student.lastName}</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 sm:grid-flow-col-dense">
              <div>
                <span className="text-xs text-muted-foreground">Classe</span>
                <p className="font-medium">{studentClass?.name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Date de naissance</span>
                <p className="font-medium">{student.dob}</p>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 sm:grid-flow-col-dense">
              <div>
                <span className="text-xs text-muted-foreground">Lieu de naissance</span>
                <p className="font-medium">{student.pob || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Sexe</span>
                <p className="font-medium">{student.sex}</p>
              </div>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 sm:grid-flow-col-dense">
              <div>
                <span className="text-xs text-muted-foreground">Téléphone parent</span>
                <p className="font-medium">{student.parentPhone || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Adresse</span>
                <p className="font-medium">{student.address || 'N/A'}</p>
              </div>
            </div>
            <div className="grid gap-2">
              <span className="text-xs text-muted-foreground">Date d'inscription</span>
              <p className="font-medium">{student.registrationDate}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle>Carte élève</CardTitle>
            <CardDescription>QR code et résumé imprimable</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 items-center text-center">
            {qrCodeUrl ? <img className="mx-auto h-44 w-44 rounded-xl border p-2" src={qrCodeUrl} alt="QR Code élève" /> : <div>Génération du QR code...</div>}
            <div className="grid gap-2 text-left">
              <div className="text-sm text-muted-foreground">Matricule</div>
              <div className="font-semibold">{student.matricule}</div>
            </div>
            <div className="grid gap-2 text-left">
              <div className="text-sm text-muted-foreground">Classe</div>
              <div className="font-semibold">{studentClass?.name || 'N/A'}</div>
            </div>
            <div className="rounded-lg border border-border bg-muted p-4 text-left text-sm">
              <div><strong>Nom :</strong> {student.firstName} {student.lastName}</div>
              <div><strong>Né(e) le :</strong> {student.dob}</div>
              <div><strong>Lieu :</strong> {student.pob || 'N/A'}</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
