'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DollarSign, Users, School, AlertCircle, BookCopy, Megaphone, CalendarDays, History } from 'lucide-react';
import Link from 'next/link';

const initialChartData = [
  { name: 'Jan', total: 0 },
  { name: 'Fév', total: 0 },
  { name: 'Mar', total: 0 },
  { name: 'Avr', total: 0 },
  { name: 'Mai', total: 0 },
  { name: 'Juin', total: 0 },
  { name: 'Juil', total: 0 },
  { name: 'Août', total: 0 },
  { name: 'Sep', total: 0 },
  { name: 'Oct', total: 0 },
  { name: 'Nov', total: 0 },
  { name: 'Déc', total: 0 },
];

export default function DashboardPage() {
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [activeClasses, setActiveClasses] = useState(0);
  const [pendingRegistrations, setPendingRegistrations] = useState(0);
  const [announcementsCount, setAnnouncementsCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [chartData, setChartData] = useState(initialChartData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Students
        const studentsSnapshot = await getDocs(collection(db, 'students'));
        setTotalStudents(studentsSnapshot.size);

        // Fetch Classes
        const classesSnapshot = await getDocs(collection(db, 'classes'));
        setActiveClasses(classesSnapshot.size);

        // Fetch Content Stats
        const announcementsSnapshot = await getDocs(collection(db, 'announcements'));
        setAnnouncementsCount(announcementsSnapshot.size);

        const eventsSnapshot = await getDocs(collection(db, 'events'));
        setEventsCount(eventsSnapshot.size);

        // Fetch Payments
        const paymentsSnapshot = await getDocs(collection(db, 'payments'));
        let revenue = 0;
        const monthlyRevenue = new Array(12).fill(0);

        paymentsSnapshot.forEach(doc => {
          const payment = doc.data();
          const amount = parseFloat(payment.amount) || 0;
          
          if (payment.status === 'Payé') {
            revenue += amount;
            if (payment.paymentDate) {
              const paymentDate = new Date(payment.paymentDate);
              const month = paymentDate.getMonth();
              monthlyRevenue[month] += amount;
            }
          }
        });

        // Fetch Inscriptions
        const registrationsSnapshot = await getDocs(collection(db, 'registrations'));
        const pendingCount = registrationsSnapshot.docs.filter((doc) => doc.data().status === 'En attente').length;
        setPendingRegistrations(pendingCount);

        // Fetch Recent Logs
        const logsSnapshot = await getDocs(query(collection(db, 'activityLog'), orderBy('timestamp', 'desc'), limit(5)));
        setRecentLogs(logsSnapshot.docs.map(d => ({ id: d.id, ...d.data() })));

        setTotalRevenue(revenue);

        const newChartData = initialChartData.map((monthData, index) => ({
          ...monthData,
          total: monthlyRevenue[index],
        }));
        setChartData(newChartData);

      } catch (error) {
        console.error("Erreur lors de la récupération des données du tableau de bord:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(value);
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de Bord Direction</h1>
          <p className="text-muted-foreground text-sm">
            Vue d'ensemble et métriques clés de l'établissement.
          </p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="border-l-4 border-l-emerald-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold">Total Élèves</CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            {loading ? <div className="text-xl font-bold">...</div> : <div className="text-2xl font-bold text-slate-900">{totalStudents}</div>}
            <p className="text-[11px] text-muted-foreground">Élèves enregistrés</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold">Revenu Encaissement</CardTitle>
            <DollarSign className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            {loading ? <div className="text-xl font-bold">...</div> : <div className="text-xl font-bold text-slate-900">{formatCurrency(totalRevenue)}</div>}
            <p className="text-[11px] text-muted-foreground">Frais perçus</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-sky-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold">Inscriptions Attente</CardTitle>
            <BookCopy className="h-4 w-4 text-sky-600" />
          </CardHeader>
          <CardContent>
            {loading ? <div className="text-xl font-bold">...</div> : <div className="text-2xl font-bold text-slate-900">{pendingRegistrations}</div>}
            <p className="text-[11px] text-muted-foreground">Dossiers à valider</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-teal-600">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold">Classes Actives</CardTitle>
            <School className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            {loading ? <div className="text-xl font-bold">...</div> : <div className="text-2xl font-bold text-slate-900">{activeClasses}</div>}
            <p className="text-[11px] text-muted-foreground">Niveaux & classes</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold">Annonces</CardTitle>
            <Megaphone className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            {loading ? <div className="text-xl font-bold">...</div> : <div className="text-2xl font-bold text-slate-900">{announcementsCount}</div>}
            <p className="text-[11px] text-muted-foreground">Publiées sur le site</p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-indigo-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-semibold">Événements</CardTitle>
            <CalendarDays className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            {loading ? <div className="text-xl font-bold">...</div> : <div className="text-2xl font-bold text-slate-900">{eventsCount}</div>}
            <p className="text-[11px] text-muted-foreground">Au calendrier</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Évolution des Encaissements Mensuels (FCFA)</CardTitle>
            <CardDescription className="text-xs">Historique des recettes sur l'année.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={320}>
              <BarChart data={chartData}>
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value/1000}K`}
                />
                <Tooltip formatter={(value: number) => [`${formatCurrency(value)}`, 'Montant']} />
                <Bar
                  dataKey="total"
                  fill="hsl(var(--primary))"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <History className="h-4 w-4 text-primary" /> Activités Récentes
            </CardTitle>
            <CardDescription className="text-xs">Dernières actions enregistrées.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentLogs.length === 0 ? (
              <p className="text-xs text-muted-foreground">Aucune activité récente.</p>
            ) : (
              recentLogs.map((log) => (
                <div key={log.id} className="border-b pb-2.5 last:border-0 last:pb-0 space-y-0.5">
                  <div className="text-xs font-semibold text-slate-800 line-clamp-1">{log.details}</div>
                  <div className="text-[10px] text-muted-foreground flex justify-between">
                    <span>Par {log.userName || 'Admin'}</span>
                    <span>{log.timestamp ? new Date(log.timestamp.seconds * 1000).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : 'Maintenant'}</span>
                  </div>
                </div>
              ))
            )}
            <div className="pt-2">
              <Link href="/admin/activity-log" className="text-xs font-semibold text-primary hover:underline block text-center">
                Voir tout l'historique →
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
