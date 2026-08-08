'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { History, Search, UserCheck } from 'lucide-react';

type AuditItem = {
  id: string;
  action: string;
  details: string;
  userName: string;
  timestamp?: { seconds: number };
};

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<AuditItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(query(collection(db, 'activityLog'), orderBy('timestamp', 'desc'), limit(100)));
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as AuditItem[];
      setLogs(list);
    } catch (error) {
      console.error('Erreur chargement logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) => {
    const q = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q) ||
      (log.userName && log.userName.toLowerCase().includes(q))
    );
  });

  const getActionBadge = (action: string) => {
    if (action.includes('accepted')) return <Badge className="bg-emerald-600 text-white">Acceptation</Badge>;
    if (action.includes('rejected')) return <Badge variant="destructive">Refus</Badge>;
    if (action.includes('payment')) return <Badge className="bg-sky-600 text-white">Paiement</Badge>;
    if (action.includes('created')) return <Badge variant="secondary">Création</Badge>;
    return <Badge variant="outline">Action</Badge>;
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historique des Actions (Audit Log)</h1>
          <p className="text-muted-foreground">Traçabilité complète des modifications effectuées sur le système.</p>
        </div>
        <div className="relative w-full sm:w-[300px]">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filtrer les événements..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" /> Journal des événements ({filteredLogs.length})
          </CardTitle>
          <CardDescription>Conserve la date, l'auteur et la nature de chaque intervention.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Heure</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Détails de l'action</TableHead>
                <TableHead>Utilisateur</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">Chargement de l'historique...</TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    Aucune action enregistrée pour le moment.
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs font-mono text-muted-foreground">
                      {log.timestamp ? new Date(log.timestamp.seconds * 1000).toLocaleString('fr-FR') : 'Récemment'}
                    </TableCell>
                    <TableCell>{getActionBadge(log.action)}</TableCell>
                    <TableCell className="font-medium text-sm">{log.details}</TableCell>
                    <TableCell className="text-xs flex items-center gap-1 text-slate-700">
                      <UserCheck className="h-3.5 w-3.5 text-primary" /> {log.userName || 'Admin'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
