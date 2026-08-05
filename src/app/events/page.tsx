'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarDays } from 'lucide-react';

type EventItem = {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
};

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(query(collection(db, 'events'), orderBy('date', 'asc')));
        setEvents(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as EventItem[]);
      } catch (error) {
        console.error('Erreur chargement événements :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <main className="container mx-auto px-4 py-10 lg:px-6">
      <section className="mb-10 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-12 text-white shadow-xl shadow-slate-900/20">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">Événements</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Participez aux activités de l'institut.</h1>
          <p className="mt-4 text-base text-slate-200">Découvrez les conférences, rassemblements et journées portes ouvertes planifiés pour les familles et élèves.</p>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {loading ? (
          <div className="col-span-2 rounded-3xl border border-dashed border-slate-300/40 bg-slate-50 p-12 text-center text-slate-500">Chargement des événements...</div>
        ) : events.length === 0 ? (
          <div className="col-span-2 rounded-3xl border border-dashed border-slate-300/40 bg-slate-50 p-12 text-center text-slate-500">Aucun événement programmé pour le moment.</div>
        ) : (
          events.map((event) => (
            <Card key={event.id} className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
              <CardHeader className="bg-slate-50 p-6">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-6 w-6 text-primary" />
                  <CardTitle className="text-xl font-semibold">{event.title}</CardTitle>
                </div>
                <CardDescription className="mt-3 text-sm text-slate-600">{event.location} — {event.date}</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <p className="text-sm leading-7 text-slate-700">{event.description}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </main>
  );
}
