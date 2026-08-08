'use client';

import { useEffect, useState } from 'react';
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { CloudinaryImageUpload } from '@/components/cloudinary-upload';
import { PlusCircle, Trash2 } from 'lucide-react';

type Announcement = {
  id: string;
  title: string;
  content?: string;
  date?: string;
  images?: string[];
};

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const { toast } = useToast();

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(query(collection(db, 'announcements'), orderBy('createdAt', 'desc')));
      setAnnouncements(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Announcement[]);
    } catch (error) {
      console.error('Erreur chargement annonces:', error);
      toast({ title: 'Erreur', description: 'Impossible de charger les annonces.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const title = (form.elements.namedItem('title') as HTMLInputElement).value.trim();
    const content = (form.elements.namedItem('content') as HTMLTextAreaElement).value.trim();

    if (!title) {
      toast({ title: 'Titre requis', description: 'Veuillez saisir au moins le titre.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, 'announcements'), {
        title,
        content: content || '',
        date: new Date().toLocaleDateString('fr-FR'),
        images: images,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast({ title: 'Annonce publiée', description: title + ' est visible sur le site.' });
      form.reset();
      setImages([]);
      setOpen(false);
      fetchAnnouncements();
    } catch (error) {
      console.error('Erreur ajout annonce:', error);
      toast({ title: 'Erreur', description: String(error), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    try {
      await deleteDoc(doc(db, 'announcements', id));
      toast({ title: 'Supprimé', description: title + ' a été retiré.' });
      fetchAnnouncements();
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast({ title: 'Erreur', description: String(error), variant: 'destructive' });
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Annonces</h1>
          <p className="text-muted-foreground">Publiez les communications officielles de l&apos;établissement.</p>
        </div>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setImages([]); }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <PlusCircle className="mr-2 h-4 w-4" /> Nouvelle Annonce
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Publier une Annonce</DialogTitle>
              <DialogDescription>Seul le titre est obligatoire.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Titre de l&apos;annonce *</Label>
                <Input id="title" name="title" placeholder="Ex: Réunion des parents..." required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Contenu (optionnel)</Label>
                <Textarea id="content" name="content" placeholder="Détails de l'annonce..." rows={4} />
              </div>
              <div className="grid gap-2">
                <Label>Images (optionnel)</Label>
                <CloudinaryImageUpload value={images} onChange={setImages} multiple={true} maxFiles={4} />
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

      <div className="grid gap-4">
        {loading ? (
          <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-500">Chargement...</div>
        ) : announcements.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-500">Aucune annonce publiée.</div>
        ) : (
          announcements.map((item) => (
            <Card key={item.id} className="rounded-2xl">
              <CardHeader className="flex flex-row items-start justify-between gap-4 p-6 pb-2">
                <div>
                  <CardTitle className="text-xl font-bold">{item.title}</CardTitle>
                  {item.date && <CardDescription className="text-xs text-emerald-600 font-semibold">{item.date}</CardDescription>}
                </div>
                <Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50" onClick={() => handleDelete(item.id, item.title)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-6 pt-2 space-y-4">
                {item.content && <p className="text-sm text-slate-700 whitespace-pre-line">{item.content}</p>}
                {item.images && item.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {item.images.map((imgUrl, idx) => (
                      <div key={idx} className="h-24 w-24 rounded-xl overflow-hidden border border-slate-200">
                        <img src={imgUrl} alt="Annonce photo" className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
