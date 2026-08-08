'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { CheckCircle2, AlertCircle, Loader2, BookOpen, Calendar } from 'lucide-react';

type Student = {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  classId: string;
  sex: string;
  status?: string;
};

type Class = {
  id: string;
  name: string;
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

export default function StudentPublicScanPage() {
  const params = useParams();
  const studentId = params.studentId as string;
  const [student, setStudent] = useState<Student | null>(null);
  const [studentClass, setStudentClass] = useState<Class | null>(null);
  const [payments, setPayments] = useState<{ [monthCode: string]: 'Payé' | 'En attente' }>({});
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentDoc = await getDoc(doc(db, 'students', studentId));
        if (!studentDoc.exists()) {
          setNotFound(true);
          setLoading(false);
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

        const paymentsSnap = await getDocs(query(collection(db, 'payments'), where('studentId', '==', studentId)));
        const paymentsMap: { [monthCode: string]: 'Payé' | 'En attente' } = {};
        paymentsSnap.docs.forEach((d) => {
          const data = d.data();
          const monthStr = String(data.month || '');
          const monthCode = monthStr.includes('-') ? monthStr.split('-')[1] : monthStr;
          if (monthCode) {
            paymentsMap[monthCode] = data.status === 'Payé' ? 'Payé' : 'En attente';
          }
        });
        setPayments(paymentsMap);
      } catch (error) {
        console.error('Erreur chargement:', error);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    if (studentId) fetchData();
  }, [studentId]);

  const paidCount = schoolMonths.filter((m) => payments[m.value] === 'Payé').length;
  const pendingCount = schoolMonths.length - paidCount;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-white">
          <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
          <p className="text-sm font-medium text-emerald-300">Vérification du dossier élève...</p>
        </div>
      </div>
    );
  }

  if (notFound || !student) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-950 flex items-center justify-center px-4">
        <div className="text-center text-white space-y-4">
          <AlertCircle className="h-16 w-16 text-rose-400 mx-auto" />
          <h1 className="text-2xl font-bold">Élève introuvable</h1>
          <p className="text-sm text-slate-400">Ce code QR ne correspond à aucun dossier enregistré.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 px-4 py-10 flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-8 space-y-3">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-3xl overflow-hidden border-2 border-emerald-500/50 shadow-2xl shadow-emerald-900/50">
            <img
              src="https://res.cloudinary.com/dm6yuokre/image/upload/v1762822007/IMG-20250924-WA0009_1_psprih.jpg"
              alt="Logo C2IAHS"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-emerald-400">Vérification Officielle</p>
          <h1 className="text-2xl font-extrabold text-white mt-1">Centre Islamique Al Housseynou Sow</h1>
          <p className="text-xs text-slate-400 font-medium">C2IAHS — Carte de Suivi des Paiements</p>
        </div>
      </div>

      {/* Student Card */}
      <div className="w-full max-w-md space-y-4">
        {/* Identity Card */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-6 text-white shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">Élève Vérifié ✓</p>
              <h2 className="text-2xl font-extrabold mt-0.5">{student.firstName} {student.lastName}</h2>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Matricule : <span className="text-emerald-300 font-bold">{student.matricule}</span>
              </p>
            </div>
            <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl text-xs font-bold border ${
              paidCount === schoolMonths.length
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                : pendingCount <= 2
                ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
                : 'bg-rose-500/20 text-rose-400 border-rose-500/50'
            }`}>
              <span className="text-2xl font-black leading-tight">{paidCount}</span>
              <span className="text-[9px]">/ {schoolMonths.length}</span>
              <span className="text-[9px] font-medium">Réglés</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white/5 rounded-xl px-3 py-2">
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Classe</span>
              <span className="font-bold text-emerald-300">{studentClass?.name || 'N/A'}</span>
            </div>
            <div className="bg-white/5 rounded-xl px-3 py-2">
              <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Sexe</span>
              <span className="font-bold">{student.sex}</span>
            </div>
          </div>
        </div>

        {/* Payment Status Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-center">
            <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto mb-1" />
            <div className="text-3xl font-black text-emerald-400">{paidCount}</div>
            <div className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">Mois Réglés</div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 text-center">
            <AlertCircle className="h-6 w-6 text-amber-400 mx-auto mb-1" />
            <div className="text-3xl font-black text-amber-400">{pendingCount}</div>
            <div className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">En Attente</div>
          </div>
        </div>

        {/* Monthly Payment Grid */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Détail Mois par Mois</h3>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {schoolMonths.map((m) => {
              const isPaid = payments[m.value] === 'Payé';
              return (
                <div
                  key={m.value}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold border ${
                    isPaid
                      ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                      : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                  }`}
                >
                  <span>{m.name}</span>
                  <span className="text-[10px]">{isPaid ? '✓ RÉGLÉ' : '⚠ EN ATTENTE'}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center space-y-2 pb-6">
          <div className="flex items-center justify-center gap-1.5 text-emerald-400/70">
            <BookOpen className="h-3.5 w-3.5" />
            <span className="text-[11px] font-medium">Informations vérifiées en temps réel</span>
          </div>
          <p className="text-[10px] text-slate-600 font-mono">C2IAHS • Tivaouane Peulh, QRT Bayal Ba</p>
        </div>
      </div>
    </div>
  );
}
