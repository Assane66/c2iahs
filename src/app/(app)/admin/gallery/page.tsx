'use client';

import { useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { CloudinaryImageUpload } from '@/components/cloudinary-upload';
import { PlusCircle, Trash2 } from 'lucide-react';

type GalleryItem = {
  id: string;
  title: string;
  imageUrl: string;
  description?: string;
};

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const { toast } = useToast();

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(query(collection(db, 'gallery'), orderBy('createdAt', 'desc')));
      setItems(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as GalleryItem[]);
    } catch (error) {
      console.error('Erreur chargement galerie:', error);
      toast({ title: 'Erreur', description: 'Impossible de charger la galerie.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const title = (form.elements.namedItem('title') as HTMLInputElement).value.trim();
    const description = (form.elements.namedItem('description') as HTMLInputElement).value.trim();

    if (!title) {
      toast({ title: 'Titre requis', description: 'Veuillez saisir au moins le titre.', variant: 'destructive' });
      return;
    }

    if (images.length === 0) {
      // If no images, just save with empty imageUrl
      setSaving(true);
      try {
        await addDoc(collection(db, 'gallery'), {
          title,
          imageUrl: '',
          description: description || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast({ title: 'Ajouté', description: title + ' ajouté à la galerie.' });
        form.reset();
        setImages([]);
        setOpen(false);
        fetchGallery();
      } catch (error) {
        console.error('Erreur ajout galerie:', error);
        toast({ title: 'Erreur', description: String(error), variant: 'destructive' });
      } finally {
        setSaving(false);
      }
      return;
    }

    setSaving(true);
    try {
      for (const imageUrl of images) {
        await addDoc(collection(db, 'gallery'), {
          title,
          imageUrl,
          description: description || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      toast({ title: 'Photo(s) ajoutée(s)', description: title + ' est visible dans la galerie.' });
      form.reset();
      setImages([]);
      setOpen(false);
      fetchGallery();
    } catch (error) {
      console.error('Erreur ajout galerie:', error);
      toast({ title: 'Erreur', description: String(error), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    try {
      await deleteDoc(doc(db, 'gallery', id));
      toast({ title: 'Supprimé', description: title + ' a été retiré.' });
      fetchGallery();
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast({ title: 'Erreur', description: String(error), variant: 'destructive' });
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Galerie Photos</h1>
          <p className="text-muted-foreground">Publiez les photos officielles des activités.</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setImages([]); }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <PlusCircle className="mr-2 h-4 w-4" /> Télécharger Photos
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Ajouter à la Galerie</DialogTitle>
              <DialogDescription>Seul le titre est obligatoire.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Titre / Légende *</Label>
                <Input id="title" name="title" placeholder="Ex: Cérémonie de remise des prix" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (optionnel)</Label>
                <Input id="description" name="description" placeholder="Ex: Promotion 2026..." />
              </div>
              <div className="grid gap-2">
                <Label>Photos (optionnel)</Label>
                <CloudinaryImageUpload value={images} onChange={setImages} multiple={true} maxFiles={6} />
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white" disabled={saving}>
                  {saving ? 'Publication...' : 'Publier'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
        {loading ? (
          <div className="col-span-full rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-500">Chargement...</div>
        ) : items.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-500">Aucune photo dans la galerie.</div>
        ) : (
          items.map((item) => (
            <Card key={item.id} className="rounded-2xl overflow-hidden group">
              {item.imageUrl && (
                <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                  <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              )}
              <CardHeader className="p-4 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold line-clamp-1">{item.title}</CardTitle>
                  {item.description && <CardDescription className="text-xs line-clamp-1">{item.description}</CardDescription>}
                </div>
                <Button variant="ghost" size="icon" className="text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(item.id, item.title)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
