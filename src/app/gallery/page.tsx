'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, Maximize2, ImageIcon } from 'lucide-react';

type GalleryItem = {
  id: string;
  title: string;
  imageUrl: string;
  description?: string;
};

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);
      try {
        const snapshot = await getDocs(query(collection(db, 'gallery'), orderBy('createdAt', 'desc')));
        const fetchedItems = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as GalleryItem[];
        setItems(fetchedItems);
      } catch (error) {
        console.error('Erreur chargement galerie :', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGallery();
  }, []);

  const selectedItem = selectedIndex !== null ? items[selectedIndex] : null;

  const handlePrev = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex === 0 ? items.length - 1 : selectedIndex - 1);
  };

  const handleNext = () => {
    if (selectedIndex === null) return;
    setSelectedIndex(selectedIndex === items.length - 1 ? 0 : selectedIndex + 1);
  };

  return (
    <main className="container mx-auto px-4 py-10 lg:px-6">
      {/* Header Banner */}
      <section className="mb-10 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-12 text-white shadow-xl shadow-slate-900/20">
        <div className="max-w-3xl">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-400 font-semibold">Galerie Photos</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Voyez la vie au centre.</h1>
          <p className="mt-4 text-base text-slate-200">
            Une sélection des meilleurs moments, activités et événements partagés par nos élèves et enseignants. Cliquez sur une photo pour l&apos;agrandir.
          </p>
        </div>
      </section>

      {/* Grid */}
      {loading ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-500">
          Chargement de la galerie...
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center text-slate-500">
          Aucune photo disponible dans la galerie pour le moment.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => (
            <Card
              key={item.id}
              onClick={() => setSelectedIndex(index)}
              className="group overflow-hidden rounded-3xl border border-slate-200 shadow-sm cursor-pointer hover:shadow-xl hover:border-emerald-500/50 transition-all duration-300"
            >
              <div className="relative h-64 w-full overflow-hidden bg-slate-900 flex items-center justify-center">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title || 'Photo galerie'}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-500 gap-2">
                    <ImageIcon className="h-10 w-10 opacity-40" />
                    <span className="text-xs">Photo non disponible</span>
                  </div>
                )}
                {/* Overlay hover effect */}
                <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="bg-white/90 text-slate-900 rounded-full px-4 py-2 text-xs font-bold flex items-center gap-1.5 shadow-lg">
                    <Maximize2 className="h-3.5 w-3.5" /> Agrandir
                  </span>
                </div>
              </div>
              <CardContent className="p-5 bg-white">
                <CardTitle className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                  {item.title || 'Sans titre'}
                </CardTitle>
                {item.description && (
                  <CardDescription className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {item.description}
                  </CardDescription>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Lightbox / Modal for Enlarged Photo */}
      <Dialog open={selectedIndex !== null} onOpenChange={(open) => { if (!open) setSelectedIndex(null); }}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-slate-950 border-slate-800 text-white rounded-3xl">
          {selectedItem && (
            <div className="relative flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-800/80 bg-slate-900/50">
                <div className="flex flex-col">
                  <h3 className="font-bold text-base text-white">{selectedItem.title}</h3>
                  {selectedItem.description && (
                    <p className="text-xs text-slate-400 mt-0.5">{selectedItem.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-medium px-2 py-1 bg-slate-800 rounded-full">
                    {(selectedIndex ?? 0) + 1} / {items.length}
                  </span>
                </div>
              </div>

              {/* Main Image View */}
              <div className="relative min-h-[350px] max-h-[70vh] flex items-center justify-center p-4 bg-black/60">
                {selectedItem.imageUrl ? (
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.title}
                    className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
                  />
                ) : (
                  <div className="py-20 text-slate-400 text-sm">Image non disponible</div>
                )}

                {/* Navigation Controls */}
                {items.length > 1 && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handlePrev}
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/80 hover:bg-emerald-600 text-white h-10 w-10 shadow-lg"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleNext}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-slate-900/80 hover:bg-emerald-600 text-white h-10 w-10 shadow-lg"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
