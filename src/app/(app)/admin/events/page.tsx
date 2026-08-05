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

type EventItem = {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
};

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(query(collection(db, 'events'), orderBy('date', 'asc')));
      setEvents(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as EventItem[]);
    } catch (error) {
      console.error('Erreur récupération événements :', error);
      toast({ title: 'Erreur', description: 'Impossible de charger les événements.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleAddEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const title = (form.elements.namedItem('title') as HTMLInputElement).value.trim();
    const date = (form.elements.namedItem('date') as HTMLInputElement).value;
    const location = (form.elements.namedItem('location') as HTMLInputElement).value.trim();
    const description = (form.elements.namedItem('description') as HTMLInputElement).value.trim();

    if (!title || !date || !location || !description) {
      toast({ title: 'Champs requis', description: 'Veuillez remplir tous les champs.', variant: 'destructive' });
      return;
    }

    try {
      await addDoc(collection(db, 'events'), {
        title,
        date,
        location,
        description,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast({ title: 'Événement ajouté', description: `${title} est programmé.` });
      form.reset();
      setOpen(false);
      fetchEvents();
    } catch (error) {
      console.error('Erreur ajout événement :', error);
      toast({ title: 'Erreur', description: 'Impossible d’ajouter l’événement.', variant: 'destructive' });
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'events', id));
      toast({ title: 'Événement supprimé', description: 'L’événement a été retiré.' });
      fetchEvents();
    } catch (error) {
      console.error('Erreur suppression événement :', error);
      toast({ title: 'Erreur', description: 'Impossible de supprimer l’événement.', variant: 'destructive' });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Événements</h1>
          <p className="text-muted-foreground">Gérez le calendrier et les annonces des événements.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Nouvel événement
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un événement</DialogTitle>
              <DialogDescription>Publiez une date d’activité ou un programme public.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddEvent} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Titre</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" name="date" type="date" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Lieu</Label>
                <Input id="location" name="location" required />
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
          <div className="rounded-3xl border border-dashed border-slate-300/40 bg-slate-50 p-12 text-center text-slate-500">Chargement des événements...</div>
        ) : events.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300/40 bg-slate-50 p-12 text-center text-slate-500">Aucun événement programmé.</div>
        ) : (
          events.map((event) => (
            <Card key={event.id} className="rounded-3xl">
              <CardHeader className="flex flex-wrap items-center justify-between gap-4 p-6">
                <div>
                  <CardTitle>{event.title}</CardTitle>
                  <CardDescription>{event.description}</CardDescription>
                </div>
                <div className="space-y-1 text-right text-sm text-muted-foreground">
                  <div>{event.date}</div>
                  <div>{event.location}</div>
                </div>
              </CardHeader>
              <CardContent className="flex justify-end gap-2">
                <Button variant="destructive" onClick={() => handleDeleteEvent(event.id)}>
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
