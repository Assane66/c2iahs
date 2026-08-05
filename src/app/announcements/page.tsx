'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type Announcement = {
  id: string;
  title: string;
  summary: string;
  status: string;
  createdAt: any;
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(query(collection(db, 'announcements'), orderBy('createdAt', 'desc')));
        setAnnouncements(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Announcement[]);
      } catch (error) {
        console.error('Erreur chargement annonces :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  return (
    <main className="container mx-auto px-4 py-10 lg:px-6">
      <section className="mb-10 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-12 text-white shadow-xl shadow-slate-900/20">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">Annonces officielles</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Restez informé des dernières actualités.</h1>
          <p className="mt-4 text-base text-slate-200">Toutes les annonces officielles de l'institut sont publiées ici : événements, inscriptions, résultats et informations pratiques.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/programs" className="rounded-full bg-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/20">Découvrir nos programmes</Link>
            <Link href="/events" className="rounded-full border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold transition hover:bg-white/10">Événements à venir</Link>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {loading ? (
          <div className="col-span-2 rounded-3xl border border-dashed border-slate-300/40 bg-slate-50 p-12 text-center text-slate-500">Chargement des annonces...</div>
        ) : announcements.length === 0 ? (
          <div className="col-span-2 rounded-3xl border border-dashed border-slate-300/40 bg-slate-50 p-12 text-center text-slate-500">Aucune annonce publiée pour le moment.</div>
        ) : (
          announcements.map((announcement) => (
            <Card key={announcement.id} className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50 p-6">
                <div className="flex items-center justify-between gap-3">
                  <CardTitle className="text-xl font-semibold">{announcement.title}</CardTitle>
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">{announcement.status || 'Publié'}</span>
                </div>
                <CardDescription className="mt-3 text-sm text-slate-600">{announcement.summary}</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm text-slate-500">Publiée le {announcement.createdAt?.toDate ? announcement.createdAt.toDate().toLocaleDateString('fr-FR') : 'Date non disponible'}</p>
                <div className="mt-4 flex justify-end">
                  <Link href="/admin/announcements" className="text-sm font-semibold text-primary hover:text-primary/80">Voir les détails</Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}
