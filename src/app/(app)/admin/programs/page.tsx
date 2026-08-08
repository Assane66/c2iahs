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
  summary?: string;
  level?: string;
};

export default function AdminProgramsPage() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(query(collection(db, 'programs'), orderBy('createdAt', 'desc')));
      setPrograms(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Program[]);
    } catch (error) {
      console.error('Erreur chargement programmes:', error);
      toast({ title: 'Erreur', description: 'Impossible de charger les programmes.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const title = (form.elements.namedItem('title') as HTMLInputElement).value.trim();
    const summary = (form.elements.namedItem('summary') as HTMLInputElement).value.trim();
    const level = (form.elements.namedItem('level') as HTMLInputElement).value.trim();

    if (!title) {
      toast({ title: 'Titre requis', description: 'Veuillez saisir au moins le titre.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      await addDoc(collection(db, 'programs'), {
        title,
        summary: summary || '',
        level: level || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      toast({ title: 'Programme ajouté', description: title + ' est maintenant publié.' });
      form.reset();
      setOpen(false);
      fetchPrograms();
    } catch (error) {
      console.error('Erreur ajout programme:', error);
      toast({ title: 'Erreur', description: String(error), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    try {
      await deleteDoc(doc(db, 'programs', id));
      toast({ title: 'Supprimé', description: title + ' a été retiré.' });
      fetchPrograms();
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast({ title: 'Erreur', description: String(error), variant: 'destructive' });
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Programmes</h1>
          <p className="text-muted-foreground">Gérez les formations disponibles sur le site.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <PlusCircle className="mr-2 h-4 w-4" /> Nouveau programme
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un programme</DialogTitle>
              <DialogDescription>Seul le titre est obligatoire.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAdd} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Titre *</Label>
                <Input id="title" name="title" placeholder="Ex: Programme Coranique" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="summary">Résumé (optionnel)</Label>
                <Input id="summary" name="summary" placeholder="Description courte du programme" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="level">Niveau (optionnel)</Label>
                <Input id="level" name="level" placeholder="Ex: Primaire, Collège" />
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
        ) : programs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-500">Aucun programme enregistré.</div>
        ) : (
          programs.map((program) => (
            <Card key={program.id} className="rounded-2xl">
              <CardHeader className="flex flex-wrap items-center justify-between gap-4 p-6">
                <div>
                  <CardTitle>{program.title}</CardTitle>
                  {program.summary && <CardDescription>{program.summary}</CardDescription>}
                </div>
                <div className="flex items-center gap-2">
                  {program.level && (
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase text-primary">
                      {program.level}
                    </span>
                  )}
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(program.id, program.title)}>
                    <Trash2 className="mr-1 h-4 w-4" /> Supprimer
                  </Button>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
