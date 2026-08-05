'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type GalleryItem = {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
};

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(query(collection(db, 'gallery'), orderBy('createdAt', 'desc')));
        setItems(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as GalleryItem[]);
      } catch (error) {
        console.error('Erreur chargement galerie :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  return (
    <main className="container mx-auto px-4 py-10 lg:px-6">
      <section className="mb-10 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-12 text-white shadow-xl shadow-slate-900/20">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">Galerie</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Voyez la vie au centre.</h1>
          <p className="mt-4 text-base text-slate-200">Une sélection des meilleurs moments, activités et événements partagés par nos élèves et enseignants.</p>
        </div>
      </section>

      {loading ? (
        <div className="rounded-3xl border border-dashed border-slate-300/40 bg-slate-50 p-12 text-center text-slate-500">Chargement de la galerie...</div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300/40 bg-slate-50 p-12 text-center text-slate-500">Aucune image disponible pour le moment.</div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden rounded-3xl border border-slate-200 shadow-sm">
              <div className="relative h-64 w-full overflow-hidden">
                <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover transition duration-300 hover:scale-105" />
              </div>
              <CardContent className="p-6">
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
