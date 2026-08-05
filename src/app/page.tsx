
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { Award, ArrowRight, BookOpen, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';

const sectionVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.65,
      ease: 'easeOut',
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

export default function LandingPage() {
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const { toast } = useToast();

  const handleRegistrationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const prenom = (form.elements.namedItem('prenom') as HTMLInputElement).value.trim();
    const nom = (form.elements.namedItem('nom') as HTMLInputElement).value.trim();
    const telephone = (form.elements.namedItem('telephone') as HTMLInputElement).value.trim();
    const niveau = (form.elements.namedItem('niveau') as HTMLInputElement).value.trim();
    const lieuNaissance = (form.elements.namedItem('lieuNaissance') as HTMLInputElement).value.trim();
    const dateNaissance = (form.elements.namedItem('dateNaissance') as HTMLInputElement).value;

    if (!prenom || !nom || !telephone || !niveau) {
      toast({
        title: 'Champs requis',
        description: 'Veuillez remplir tous les champs obligatoires.',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      await addDoc(collection(db, 'registrations'), {
        firstName: prenom,
        lastName: nom,
        phone: telephone,
        requestedClass: niveau,
        birthPlace: lieuNaissance || null,
        birthDate: dateNaissance || null,
        status: 'En attente',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      const message = `Nouvelle demande d'inscription:%0APrénom: ${prenom}%0ANom: ${nom}%0ATéléphone: ${telephone}%0AClasse demandée: ${niveau}%0A${lieuNaissance ? `Lieu de naissance: ${lieuNaissance}%0A` : ''}${dateNaissance ? `Date de naissance: ${dateNaissance}%0A` : ''}`;
      const whatsappUrl = `https://wa.me/221781635209?text=${message}`;
      window.open(whatsappUrl, '_blank');

      toast({
        title: 'Demande enregistrée',
        description: 'Votre inscription a bien été sauvegardée. Vous êtes redirigé vers WhatsApp.',
      });
      setIsFormOpen(false);
      form.reset();
    } catch (error) {
      console.error('Erreur enregistrement inscription:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible d’enregistrer la demande. Réessayez plus tard.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <main className="flex-1">
        <section className="relative overflow-hidden bg-slate-950 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.32),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.22),_transparent_30%)]" />
          <div className="relative mx-auto flex max-w-7xl flex-col gap-12 px-6 py-20 lg:px-8 xl:flex-row xl:items-center xl:justify-between">
            <motion.div className="max-w-2xl space-y-8" initial="hidden" animate="visible" variants={sectionVariants}>
              <motion.div variants={itemVariants}>
                <span className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold uppercase tracking-[0.28em] text-primary">Institut Imam Al Housseynou Sow</span>
              </motion.div>
              <motion.div variants={itemVariants}>
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">Une éducation islamique moderne, structurée et bienveillante.</h1>
              </motion.div>
              <motion.div variants={itemVariants}>
                <p className="max-w-xl text-base leading-8 text-slate-300 sm:text-lg">Rejoignez un institut où le savoir, la foi et la discipline se rencontrent dans un cadre sécurisé et ambitieux pour chaque élève.</p>
              </motion.div>
              <motion.div variants={itemVariants} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button className="inline-flex items-center justify-center rounded-full bg-primary px-7 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-blue-500/20 transition hover:bg-primary/90" onClick={() => setIsFormOpen(true)}>
                  S'inscrire maintenant
                </Button>
                <Button variant="secondary" className="inline-flex items-center justify-center rounded-full px-7 py-3 text-base font-semibold" asChild>
                  <Link href="/programs">Voir nos programmes</Link>
                </Button>
              </motion.div>
            </motion.div>

            <motion.div variants={itemVariants} className="relative mx-auto w-full max-w-3xl overflow-hidden rounded-[32px] border border-white/10 bg-slate-900/80 p-2 shadow-2xl shadow-slate-950/30">
              <div className="relative h-[420px] sm:h-[520px]">
                <Image
                  src="https://res.cloudinary.com/dm6yuokre/image/upload/v1759775671/1759775403161_2_opz6ot.jpg"
                  alt="Élèves du centre"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute bottom-0 left-0 right-0 rounded-b-[30px] bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent p-6 text-white">
                <p className="text-sm uppercase tracking-[0.24em] text-slate-300">Vie scolaire, pédagogie & spiritualité</p>
                <p className="mt-2 text-xl font-semibold">Un environnement d'apprentissage inspirant.</p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="bg-background py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="border border-slate-200/80 bg-white/95 p-8 shadow-sm shadow-slate-900/5">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                  <BookOpen className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Programmes complets</CardTitle>
                <CardDescription>Un parcours scolaire rigoureux du primaire au secondaire.</CardDescription>
              </Card>
              <Card className="border border-slate-200/80 bg-white/95 p-8 shadow-sm shadow-slate-900/5">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <Award className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Résultats solides</CardTitle>
                <CardDescription>Une réussite académique soutenue et des élèves engagés.</CardDescription>
              </Card>
              <Card className="border border-slate-200/80 bg-white/95 p-8 shadow-sm shadow-slate-900/5">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <CardTitle className="text-xl">Suivi personnalisé</CardTitle>
                <CardDescription>Accompagnement quotidien et pédagogie individualisée.</CardDescription>
              </Card>
            </div>
          </div>
        </section>

        <section className="bg-slate-950 py-16 sm:py-20 text-white">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
              <div className="space-y-6">
                <p className="text-sm uppercase tracking-[0.3em] text-primary">Nos services</p>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Une école moderne avec une offre complète.</h2>
                <p className="max-w-xl text-slate-300 leading-8">Découvrez les programmes, annonces, événements et la galerie qui valorisent la vie du centre et les projets de chaque élève.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <p className="text-xl font-semibold">Programmes</p>
                  <p className="mt-3 text-sm text-slate-300">Parcours éducatifs adaptés au système français et arabe.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <p className="text-xl font-semibold">Annonces</p>
                  <p className="mt-3 text-sm text-slate-300">Actualités officielles et communications importantes.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <p className="text-xl font-semibold">Événements</p>
                  <p className="mt-3 text-sm text-slate-300">Conférences, journées portes ouvertes et rencontres publiques.</p>
                </div>
                <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                  <p className="text-xl font-semibold">Galerie</p>
                  <p className="mt-3 text-sm text-slate-300">Photos et souvenirs des temps forts du centre.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-background py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid gap-12 xl:grid-cols-[1.1fr_0.9fr] xl:items-center">
              <div className="space-y-6">
                <p className="text-sm uppercase tracking-[0.3em] text-primary">Programme phare</p>
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Choisissez le parcours idéal pour votre enfant.</h2>
                <p className="max-w-xl text-muted-foreground leading-8">Nous proposons des parcours équilibrés mêlant excellence académique, langue arabe et enseignement religieux.</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="rounded-3xl border border-slate-200/80 p-6 shadow-sm">
                  <CardHeader className="p-0">
                    <CardTitle className="text-xl">Programme Coranique</CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 pt-4">
                    <CardDescription>Approfondissement du Coran, lecture, tajwid et mémorisation.</CardDescription>
                  </CardContent>
                </Card>
                <Card className="rounded-3xl border border-slate-200/80 p-6 shadow-sm">
                  <CardHeader className="p-0">
                    <CardTitle className="text-xl">Système Français</CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 pt-4">
                    <CardDescription>Enseignement conforme au programme national avec un support en arabe.</CardDescription>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Formulaire d'Inscription</DialogTitle>
            <DialogDescription>Veuillez remplir les informations ci-dessous. Elles seront envoyées via WhatsApp.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegistrationSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="prenom" className="text-right">Prénom</Label>
                <Input id="prenom" name="prenom" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nom" className="text-right">Nom</Label>
                <Input id="nom" name="nom" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="telephone" className="text-right">Téléphone</Label>
                <Input id="telephone" name="telephone" type="tel" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="niveau" className="text-right">Classe demandée</Label>
                <Input id="niveau" name="niveau" placeholder="Ex : CM2" className="col-span-3" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="lieuNaissance" className="text-right">Lieu de naissance</Label>
                <Input id="lieuNaissance" name="lieuNaissance" className="col-span-3" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dateNaissance" className="text-right">Date de naissance</Label>
                <Input id="dateNaissance" name="dateNaissance" type="date" className="col-span-3" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Annuler</Button>
              </DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={submitting}>
                {submitting ? 'Envoi...' : 'Envoyer via WhatsApp'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
