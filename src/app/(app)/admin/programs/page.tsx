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

type Program = {
  id: string;
  title: string;
  summary: string;
  level: string;
};

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(query(collection(db, 'programs'), orderBy('createdAt', 'desc')));
      setPrograms(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Program[]);
    } catch (error) {
      console.error('Erreur récupération programmes :', error);
      toast({ title: 'Erreur', description: 'Impossible de charger les programmes.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleAddProgram = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const title = (form.elements.namedItem('title') as HTMLInputElement).value.trim();
    const summary = (form.elements.namedItem('summary') as HTMLInputElement).value.trim();
    const level = (form.elements.namedItem('level') as HTMLInputElement).value.trim();

    if (!title || !summary || !level) {
      toast({ title: 'Champs requis', description: 'Veuillez remplir tous les champs.', variant: 'destructive' });
      return;
    }

    try {
      await addDoc(collection(db, 'programs'), {
        title,
        summary,
        level,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast({ title: 'Programme ajouté', description: `${title} est maintenant publié.` });
      setOpen(false);
      form.reset();
      fetchPrograms();
    } catch (error) {
      console.error('Erreur ajout programme :', error);
      toast({ title: 'Erreur', description: 'Impossible d’ajouter le programme.', variant: 'destructive' });
    }
  };

  const handleDeleteProgram = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'programs', id));
      toast({ title: 'Programme supprimé', description: 'Le programme a été retiré.' });
      fetchPrograms();
    } catch (error) {
      console.error('Erreur suppression programme :', error);
      toast({ title: 'Erreur', description: 'Impossible de supprimer le programme.', variant: 'destructive' });
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Programmes</h1>
          <p className="text-muted-foreground">Gérez les formations disponibles sur le site.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Nouveau programme
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un programme</DialogTitle>
              <DialogDescription>Créez un nouveau parcours pédagogique.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddProgram} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Titre</Label>
                <Input id="title" name="title" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="summary">Résumé</Label>
                <Input id="summary" name="summary" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="level">Niveau</Label>
                <Input id="level" name="level" placeholder="Ex: Primaire, Secondaire" required />
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
          <div className="rounded-3xl border border-dashed border-slate-300/40 bg-slate-50 p-12 text-center text-slate-500">Chargement des programmes...</div>
        ) : programs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300/40 bg-slate-50 p-12 text-center text-slate-500">Aucun programme enregistré.</div>
        ) : (
          programs.map((program) => (
            <Card key={program.id} className="rounded-3xl">
              <CardHeader className="flex flex-wrap items-center justify-between gap-4 p-6">
                <div>
                  <CardTitle>{program.title}</CardTitle>
                  <CardDescription>{program.summary}</CardDescription>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">{program.level}</span>
              </CardHeader>
              <CardContent className="flex justify-end gap-2">
                <Button variant="destructive" onClick={() => handleDeleteProgram(program.id)}>
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
