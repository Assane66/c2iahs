'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CalendarDays, MapPin, ArrowRight, Eye } from 'lucide-react';

type EventItem = {
  id: string;
  title: string;
  date?: string;
  location?: string;
  description?: string;
  images?: string[];
};

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(query(collection(db, 'events'), orderBy('createdAt', 'desc')));
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
      {/* Header Banner */}
      <section className="mb-10 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-12 text-white shadow-xl shadow-slate-900/20">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400 font-semibold flex items-center gap-2">
            <CalendarDays className="h-4 w-4" /> Événements & Calendrier
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Participez aux activités de l&apos;institut.</h1>
          <p className="mt-4 text-base text-slate-200">
            Découvrez les cérémonies, conférences, rassemblements et journées portes ouvertes organisés pour les élèves et les familles.
          </p>
        </div>
      </section>

      {/* Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {loading ? (
          <div className="col-span-2 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-500">
            Chargement des événements...
          </div>
        ) : events.length === 0 ? (
          <div className="col-span-2 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-500">
            Aucun événement programmé pour le moment.
          </div>
        ) : (
          events.map((event) => (
            <Card 
              key={event.id} 
              onClick={() => setSelectedEvent(event)}
              className="group overflow-hidden rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-500/50 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <CardHeader className="bg-slate-50/80 p-6 pb-4 border-b border-slate-100">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {event.title}
                  </CardTitle>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 mt-2">
                  {event.date && (
                    <span className="flex items-center gap-1 text-emerald-700 font-bold">
                      <CalendarDays className="h-3.5 w-3.5" /> {event.date}
                    </span>
                  )}
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-slate-400" /> {event.location}
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {event.description && (
                  <p className="text-sm leading-relaxed text-slate-700 line-clamp-3">
                    {event.description}
                  </p>
                )}

                {/* Attached photos preview */}
                {event.images && event.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {event.images.slice(0, 3).map((imgUrl, idx) => (
                      <div key={idx} className="h-16 w-16 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                        <img src={imgUrl} alt="Photo" className="h-full w-full object-cover" />
                      </div>
                    ))}
                    {event.images.length > 3 && (
                      <div className="h-16 w-16 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                        +{event.images.length - 3}
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
                  Voir les détails &amp; photos <ArrowRight className="ml-1.5 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Event Detail Modal */}
      <Dialog open={selectedEvent !== null} onOpenChange={(open) => { if (!open) setSelectedEvent(null); }}>
        <DialogContent className="max-w-2xl bg-white rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
          {selectedEvent && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-slate-900 leading-snug">
                  {selectedEvent.title}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 pt-1">
                  {selectedEvent.date && (
                    <span className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                      <CalendarDays className="h-3.5 w-3.5" /> {selectedEvent.date}
                    </span>
                  )}
                  {selectedEvent.location && (
                    <span className="flex items-center gap-1 bg-slate-100 px-3 py-1 rounded-full">
                      <MapPin className="h-3.5 w-3.5 text-slate-500" /> {selectedEvent.location}
                    </span>
                  )}
                </div>
              </DialogHeader>

              {selectedEvent.description && (
                <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line border-t border-b border-slate-100 py-4">
                  {selectedEvent.description}
                </div>
              )}

              {/* Photos Gallery in Modal */}
              {selectedEvent.images && selectedEvent.images.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Photos de l&apos;événement</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedEvent.images.map((imgUrl, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => setActiveImageIndex(idx)}
                        className="relative h-28 rounded-2xl overflow-hidden border border-slate-200 cursor-pointer group shadow-sm"
                      >
                        <img src={imgUrl} alt={`Photo ${idx+1}`} className="h-full w-full object-cover group-hover:scale-105 transition-transform" />
                        <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Eye className="h-5 w-5" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Fullscreen Photo Lightbox inside Event Modal */}
      <Dialog open={activeImageIndex !== null} onOpenChange={(open) => { if (!open) setActiveImageIndex(null); }}>
        <DialogContent className="max-w-4xl p-2 bg-slate-950 border-slate-800 rounded-3xl">
          {selectedEvent && selectedEvent.images && activeImageIndex !== null && (
            <div className="relative flex flex-col items-center justify-center p-4">
              <img
                src={selectedEvent.images[activeImageIndex]}
                alt="Photo grand format"
                className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
