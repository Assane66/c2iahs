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
import { PlusCircle, Trash2 } from 'lucide-react';

type GalleryItem = {
  id: string;
  title: string;
  imageUrl: string;
  description: string;
};

export default function AdminGalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const fetchGallery = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(query(collection(db, 'gallery'), orderBy('createdAt', 'desc')));
      setItems(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as GalleryItem[]);
    } catch (error) {
      console.error('Erreur récupération galerie :', error);
      toast({ title: 'Erreur', description: 'Impossible de charger la galerie.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleAddGalleryItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const title = (form.elements.namedItem('title') as HTMLInputElement).value.trim();
    const imageUrl = (form.elements.namedItem('imageUrl') as HTMLInputElement).value.trim();
    const description = (form.elements.namedItem('description') as HTMLInputElement).value.trim();

    if (!title || !imageUrl || !description) {
      toast({ title: 'Champs requis', description: 'Veuillez remplir tous les champs.', variant: 'destructive' });
      return;
    }

    try {
      await addDoc(collection(db, 'gallery'), {
        title,
        imageUrl,
        description,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast({ title: 'Image ajoutée', description: `${title} est maintenant visible.` });
      form.reset();
      setOpen(false);
      fetchGallery();
    } catch (error) {
      console.error('Erreur ajout image galerie :', error);
      toast({ title: 'Erreur', description: 'Impossible d’ajouter l’image.', variant: 'destructive' });
    }
  };

  const handleDeleteGalleryItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'gallery', id));
      toast({ title: 'Image supprimée', description: 'L’image a été retirée de la galerie.' });
      fetchGallery();
    } catch (error) {
      console.error('Erreur suppression image galerie :', error);
      toast({ title: 'Erreur', description: 'Impossible de supprimer l’image.', variant: 'destructive' });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Galerie</h1>
          <p className="text-muted-foreground">Publiez des photos et moments forts du centre.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Ajouter une image
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter à la galerie</DialogTitle>
              <DialogDescription>Ajoutez une nouvelle image avec son titre et description.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddGalleryItem} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Titre</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="imageUrl">URL de l'image</Label>
                <Input id="imageUrl" name="imageUrl" type="url" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" required />
              </div>
              <DialogFooter>
                <Button type="submit">Publier</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="rounded-3xl border border-dashed border-slate-300/40 bg-slate-50 p-12 text-center text-slate-500">Chargement de la galerie...</div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300/40 bg-slate-50 p-12 text-center text-slate-500">Aucune image publiée.</div>
        ) : (
          items.map((item) => (
            <Card key={item.id} className="rounded-3xl overflow-hidden">
              <div className="relative h-64 w-full overflow-hidden">
                <img src={item.imageUrl} alt={item.title} className="h-full w-full object-cover" />
              </div>
              <CardHeader className="p-6">
                <CardTitle>{item.title}</CardTitle>
                <CardDescription>{item.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-end gap-2">
                <Button variant="destructive" onClick={() => handleDeleteGalleryItem(item.id)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
