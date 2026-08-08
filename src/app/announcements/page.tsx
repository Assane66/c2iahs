'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Megaphone, Calendar, ArrowRight, Eye, Sparkles } from 'lucide-react';
import Link from 'next/link';

type Announcement = {
  id: string;
  title: string;
  content: string;
  date?: string;
  images?: string[];
  createdAt?: any;
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

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
      {/* Header Banner */}
      <section className="mb-10 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-12 text-white shadow-xl shadow-slate-900/20">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400 font-semibold flex items-center gap-2">
            <Megaphone className="h-4 w-4" /> Annonces officielles
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Restez informé des dernières actualités.</h1>
          <p className="mt-4 text-base text-slate-200">
            Toutes les communications officielles de l&apos;institut : réunions, examens, congés et informations importantes.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/programs" className="rounded-full bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 text-sm font-semibold transition shadow-md">
              Découvrir nos programmes
            </Link>
            <Link href="/events" className="rounded-full border border-white/20 bg-white/10 px-5 py-2.5 text-sm font-semibold transition hover:bg-white/20">
              Événements à venir
            </Link>
          </div>
        </div>
      </section>

      {/* Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {loading ? (
          <div className="col-span-2 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-500">
            Chargement des annonces...
          </div>
        ) : announcements.length === 0 ? (
          <div className="col-span-2 rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-500">
            Aucune annonce publiée pour le moment.
          </div>
        ) : (
          announcements.map((ann) => (
            <Card 
              key={ann.id} 
              onClick={() => setSelectedAnnouncement(ann)}
              className="group overflow-hidden rounded-3xl border border-slate-200 shadow-sm hover:shadow-lg hover:border-emerald-500/50 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              <CardHeader className="bg-slate-50/80 p-6 pb-4 border-b border-slate-100">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {ann.title}
                  </CardTitle>
                  <span className="shrink-0 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold">
                    {ann.date || 'Récemment'}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {ann.content && (
                  <p className="text-sm leading-relaxed text-slate-700 line-clamp-3">
                    {ann.content}
                  </p>
                )}

                {/* Attached photos preview */}
                {ann.images && ann.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {ann.images.slice(0, 3).map((imgUrl, idx) => (
                      <div key={idx} className="h-16 w-16 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                        <img src={imgUrl} alt="Photo" className="h-full w-full object-cover" />
                      </div>
                    ))}
                    {ann.images.length > 3 && (
                      <div className="h-16 w-16 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                        +{ann.images.length - 3}
                      </div>
                    )}
                  </div>
                )}

                <div className="pt-2 flex items-center justify-end text-xs font-bold text-emerald-700 group-hover:translate-x-1 transition-transform">
                  Lire l&apos;annonce complète <ArrowRight className="ml-1.5 h-4 w-4" />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Announcement Detail Modal */}
      <Dialog open={selectedAnnouncement !== null} onOpenChange={(open) => { if (!open) setSelectedAnnouncement(null); }}>
        <DialogContent className="max-w-2xl bg-white rounded-3xl p-6 max-h-[90vh] overflow-y-auto">
          {selectedAnnouncement && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 mb-1">
                  <Calendar className="h-4 w-4" /> {selectedAnnouncement.date || 'Annonce officielle'}
                </div>
                <DialogTitle className="text-2xl font-bold text-slate-900 leading-snug">
                  {selectedAnnouncement.title}
                </DialogTitle>
              </DialogHeader>

              {selectedAnnouncement.content && (
                <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line border-t border-b border-slate-100 py-4">
                  {selectedAnnouncement.content}
                </div>
              )}

              {/* Photos Gallery in Modal */}
              {selectedAnnouncement.images && selectedAnnouncement.images.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Photos rattachées</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {selectedAnnouncement.images.map((imgUrl, idx) => (
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

      {/* Fullscreen Photo Lightbox inside Announcement Modal */}
      <Dialog open={activeImageIndex !== null} onOpenChange={(open) => { if (!open) setActiveImageIndex(null); }}>
        <DialogContent className="max-w-4xl p-2 bg-slate-950 border-slate-800 rounded-3xl">
          {selectedAnnouncement && selectedAnnouncement.images && activeImageIndex !== null && (
            <div className="relative flex flex-col items-center justify-center p-4">
              <img
                src={selectedAnnouncement.images[activeImageIndex]}
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
