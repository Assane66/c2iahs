
'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DollarSign, Users, School, AlertCircle, BookCopy } from 'lucide-react';

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
  const [pendingPayments, setPendingPayments] = useState(0);
  const [chartData, setChartData] = useState(initialChartData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Students
        const studentsSnapshot = await getDocs(collection(db, 'students'));
        const studentsCount = studentsSnapshot.size;
        setTotalStudents(studentsCount);

        // Fetch Classes
        const classesSnapshot = await getDocs(collection(db, 'classes'));
        setActiveClasses(classesSnapshot.size);

        // Fetch Payments
        const paymentsSnapshot = await getDocs(collection(db, 'payments'));
        let revenue = 0;
        let pendingCount = 0;
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
          } else if (payment.status === 'En attente') {
            pendingCount++;
          }
        });

        const registrationsSnapshot = await getDocs(collection(db, 'registrations'));
        const pendingRegistrationsCount = registrationsSnapshot.docs.filter((doc) => doc.data().status === 'En attente').length;

        setTotalRevenue(revenue);
        setPendingPayments(pendingCount);
        setPendingRegistrations(pendingRegistrationsCount);

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
        currency: 'XOF', // FCFA currency code is XOF
        minimumFractionDigits: 0,
    }).format(value);
  }

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de Bord</h1>
        <p className="text-muted-foreground">
          Aperçu des activités de votre école.
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des Élèves</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <div className="text-2xl font-bold">...</div> : <div className="text-2xl font-bold">{totalStudents}</div>}
             <p className="text-xs text-muted-foreground">
              Total des élèves inscrits
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Revenu Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <div className="text-2xl font-bold">...</div> : <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>}
            <p className="text-xs text-muted-foreground">
              Basé sur les paiements reçus
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Classes Actives</CardTitle>
            <School className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
             {loading ? <div className="text-2xl font-bold">...</div> : <div className="text-2xl font-bold">{activeClasses}</div>}
            <p className="text-xs text-muted-foreground">
              Total des classes créées
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inscriptions en Attente</CardTitle>
            <BookCopy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <div className="text-2xl font-bold">...</div> : <div className="text-2xl font-bold">{pendingRegistrations}</div>}
            <p className="text-xs text-muted-foreground">
              Demandes d'inscription à traiter
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Paiements en Attente
            </CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? <div className="text-2xl font-bold">...</div> : <div className="text-2xl font-bold">{pendingPayments}</div>}
            <p className="text-xs text-muted-foreground">
             Nombre de paiements non confirmés
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Aperçu des Revenus</CardTitle>
          <CardDescription>Aperçu mensuel des revenus encaissés.</CardDescription>
        </CardHeader>
        <CardContent className="pl-2">
          <ResponsiveContainer width="100%" height={350}>
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
              <Bar
                dataKey="total"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
