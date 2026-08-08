'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardDescription, CardTitle } from '@/components/ui/card';
import { Award, ArrowRight, BookOpen, ShieldCheck, CheckCircle2, Star, Sparkles, School, Users, Calendar, PhoneCall, Megaphone } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { addDoc, collection, serverTimestamp, getDocs, query, orderBy, limit, doc, getDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
};

type ProgramItem = {
  id: string;
  title: string;
  summary: string;
  level: string;
};

type AnnouncementItem = {
  id: string;
  title: string;
  content: string;
  date: string;
};

export default function LandingPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [programs, setPrograms] = useState<ProgramItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [whatsappNumber, setWhatsappNumber] = useState('221781635209');
  const { toast } = useToast();

  useEffect(() => {
    const fetchContent = async () => {
      try {
        // Fetch Settings
        const settingsSnap = await getDoc(doc(db, 'siteSettings', 'main'));
        if (settingsSnap.exists() && settingsSnap.data().whatsappNumber) {
          setWhatsappNumber(settingsSnap.data().whatsappNumber);
        }

        // Fetch Programs
        const progSnap = await getDocs(query(collection(db, 'programs'), orderBy('createdAt', 'desc'), limit(6)));
        if (!progSnap.empty) {
          setPrograms(progSnap.docs.map(d => ({ id: d.id, ...d.data() })) as ProgramItem[]);
        }

        // Fetch Announcements
        const annSnap = await getDocs(query(collection(db, 'announcements'), orderBy('createdAt', 'desc'), limit(3)));
        if (!annSnap.empty) {
          setAnnouncements(annSnap.docs.map(d => ({ id: d.id, ...d.data() })) as AnnouncementItem[]);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchContent();
  }, []);

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

      // Notification entry for admin
      await addDoc(collection(db, 'notifications'), {
        title: 'Demande d’inscription en ligne',
        message: `Nouvelle demande de ${prenom} ${nom} pour la classe de ${niveau}.`,
        type: 'info',
        read: false,
        createdAt: serverTimestamp(),
      });

      const message = `Nouvelle demande d'inscription:%0APrénom: ${prenom}%0ANom: ${nom}%0ATéléphone: ${telephone}%0AClasse demandée: ${niveau}%0A${lieuNaissance ? `Lieu de naissance: ${lieuNaissance}%0A` : ''}${dateNaissance ? `Date de naissance: ${dateNaissance}%0A` : ''}`;
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
      window.open(whatsappUrl, '_blank');

      toast({
        title: 'Demande enregistrée',
        description: 'Votre inscription a été sauvegardée dans la base. Ouverture de WhatsApp...',
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
        {/* HERO SECTION - FULL SCREEN BACKGROUND IMAGE */}
        <section className="relative min-h-[92vh] flex items-center text-white overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://res.cloudinary.com/dm6yuokre/image/upload/v1785958291/ChatGPT_Image_Aug_5_2026_08_28_56_PM_imdc92.png"
              alt="Centre Islamique Al Housseynou Sow"
              className="w-full h-full object-cover object-center"
            />
            {/* Strong dark overlay left + bottom */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-900/20" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 mx-auto max-w-7xl w-full px-6 lg:px-12 py-24 lg:py-32">
            <motion.div className="max-w-2xl space-y-7" initial="hidden" animate="visible" variants={sectionVariants}>
              <motion.div variants={itemVariants}>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/50 bg-emerald-900/40 backdrop-blur-sm px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-emerald-300 shadow-md">
                  <Sparkles className="h-3.5 w-3.5 text-emerald-400" /> Excellence & Spiritualité
                </span>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl leading-[1.1]">
                  <span className="block text-white">Institut</span>
                  <span className="block text-white">Islamique</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-emerald-500">
                    C2IAHS
                  </span>
                </h1>
              </motion.div>

              <motion.div variants={itemVariants}>
                <p className="max-w-lg text-base leading-relaxed text-slate-200 sm:text-lg">
                  Éclairer les esprits, nourrir les âmes. Une éducation d'excellence alliant sciences modernes et valeurs coraniques au cœur de Tivaouane Peulh.
                </p>
              </motion.div>

              <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center pt-2">
                <Button 
                  size="lg"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-8 py-6 rounded-xl shadow-xl shadow-emerald-900/40 text-sm tracking-wide uppercase"
                  onClick={() => setIsFormOpen(true)}
                >
                  Rejoindre l'Institut <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-white/30 text-white hover:bg-white/10 backdrop-blur-sm rounded-xl px-8 py-6 text-sm font-semibold tracking-wide uppercase"
                  asChild
                >
                  <Link href="/programs">Découvrir nos Programmes</Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* PILLIERS PÉDAGOGIQUES */}
        <section className="bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <span className="text-xs uppercase tracking-widest text-primary font-bold">Nos Engagements</span>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl">Pourquoi Choisir Notre Établissement ?</h2>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              <Card className="border-0 shadow-md shadow-slate-200/60 rounded-3xl p-8 bg-white hover:-translate-y-1 transition-transform">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800">
                  <BookOpen className="h-7 w-7" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 mb-2">Programmes Équilibrés</CardTitle>
                <CardDescription className="text-sm leading-relaxed text-slate-600">
                  Un cursus complet combinant le programme officiel et l'enseignement coranique avec tajwid et mémorisation.
                </CardDescription>
              </Card>

              <Card className="border-0 shadow-md shadow-slate-200/60 rounded-3xl p-8 bg-white hover:-translate-y-1 transition-transform">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
                  <Award className="h-7 w-7" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 mb-2">Résultats & Rigueur</CardTitle>
                <CardDescription className="text-sm leading-relaxed text-slate-600">
                  Une équipe d'enseignants qualifiés pour assurer la réussite académique de chaque élève aux examens nationaux.
                </CardDescription>
              </Card>

              <Card className="border-0 shadow-md shadow-slate-200/60 rounded-3xl p-8 bg-white hover:-translate-y-1 transition-transform">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-sky-800">
                  <ShieldCheck className="h-7 w-7" />
                </div>
                <CardTitle className="text-xl font-bold text-slate-900 mb-2">Éducation Morale</CardTitle>
                <CardDescription className="text-sm leading-relaxed text-slate-600">
                  Inculquer le respect, la discipline, l'entraide et les valeurs éthiques islamiques fondamentales dès le plus jeune âge.
                </CardDescription>
              </Card>
            </div>
          </div>
        </section>

        {/* SECTION PROGRAMMES DYNAMIQUES */}
        <section className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <span className="text-xs uppercase tracking-widest text-primary font-bold">Offre Éducative</span>
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight sm:text-4xl mt-1">Nos Cursus & Niveaux</h2>
              </div>
              <Button variant="outline" className="border-primary text-primary hover:bg-emerald-50 rounded-xl" asChild>
                <Link href="/programs">Voir Tous les Programmes <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>

            {programs.length === 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <Card className="rounded-3xl border border-slate-200 p-6 shadow-sm">
                  <CardHeader className="p-0">
                    <span className="gold-badge text-[10px] font-bold px-3 py-1 rounded-full w-fit mb-2 uppercase">Coran & Arabe</span>
                    <CardTitle className="text-xl">Enseignement Coranique</CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 pt-3">
                    <CardDescription className="text-sm text-slate-600">Memorisation, Tajwid, règles de récitation et langue arabe appliquée.</CardDescription>
                  </CardContent>
                </Card>
                <Card className="rounded-3xl border border-slate-200 p-6 shadow-sm">
                  <CardHeader className="p-0">
                    <span className="gold-badge text-[10px] font-bold px-3 py-1 rounded-full w-fit mb-2 uppercase">Système Général</span>
                    <CardTitle className="text-xl">Cycle Primaire & Moyen</CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 pt-3">
                    <CardDescription className="text-sm text-slate-600">Mathématiques, Français, Sciences et Éducation Civique conforme au ministère.</CardDescription>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {programs.map((prog) => (
                  <Card key={prog.id} className="rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="p-0">
                      <span className="gold-badge text-[10px] font-bold px-3 py-1 rounded-full w-fit mb-2 uppercase">{prog.level}</span>
                      <CardTitle className="text-xl">{prog.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 pt-3">
                      <CardDescription className="text-sm text-slate-600">{prog.summary}</CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* SECTION ANNONCES / ACTUALITÉS */}
        {announcements.length > 0 && (
          <section className="bg-slate-900 text-white py-20">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
                <div className="flex items-center gap-3">
                  <Megaphone className="h-6 w-6 text-emerald-400" />
                  <h2 className="text-2xl font-bold">Dernières Annonces de l&apos;Institut</h2>
                </div>
                <Button variant="outline" className="border-emerald-500/40 text-emerald-300 hover:bg-emerald-950/60 rounded-xl" asChild>
                  <Link href="/announcements">Toutes les Annonces <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
              </div>
              <div className="grid gap-6 md:grid-cols-3">
                {announcements.map((ann) => (
                  <Link key={ann.id} href="/announcements" className="block group">
                    <div className="bg-slate-800/80 border border-slate-700/80 p-6 rounded-2xl space-y-3 group-hover:border-emerald-500/60 transition-all duration-300">
                      <span className="text-xs text-emerald-400 font-semibold">{ann.date || 'Récemment'}</span>
                      <h3 className="font-bold text-lg text-white group-hover:text-emerald-300 transition-colors">{ann.title}</h3>
                      <p className="text-xs text-slate-300 line-clamp-3">{ann.content}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* BANNIÈRE APPEL À L'ACTION */}
        <section id="inscription" className="emerald-gradient-bg py-20 text-white">
          <div className="mx-auto max-w-5xl px-6 text-center space-y-6">
            <h2 className="text-3xl font-extrabold sm:text-4xl">Prêt à Inscrire Votre Enfant ?</h2>
            <p className="max-w-2xl mx-auto text-emerald-100 text-base leading-relaxed">
              Inscrivez votre enfant directement en ligne. Notre secrétariat validera votre demande et vous recontactera rapidement.
            </p>
            <Button 
              size="lg" 
              className="bg-secondary hover:bg-amber-400 text-slate-950 font-bold px-10 py-6 text-base rounded-2xl shadow-xl shadow-amber-500/20"
              onClick={() => setIsFormOpen(true)}
            >
              Remplir le Formulaire d'Inscription
            </Button>
          </div>
        </section>
      </main>

      {/* FORMULAIRE DIALOG D'INSCRIPTION */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-white max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Demande d'Inscription En Ligne</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Les informations seront enregistrées dans notre base de données avant la redirection vers WhatsApp.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRegistrationSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="prenom" className="text-right text-xs font-semibold">Prénom *</Label>
                <Input id="prenom" name="prenom" className="col-span-3 text-xs h-9" placeholder="Ex: Mouhamed" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nom" className="text-right text-xs font-semibold">Nom *</Label>
                <Input id="nom" name="nom" className="col-span-3 text-xs h-9" placeholder="Ex: Ndiaye" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="telephone" className="text-right text-xs font-semibold">Téléphone Parent *</Label>
                <Input id="telephone" name="telephone" type="tel" className="col-span-3 text-xs h-9" placeholder="Ex: 77 000 00 00" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="niveau" className="text-right text-xs font-semibold">Classe demandée *</Label>
                <Input id="niveau" name="niveau" placeholder="Ex : CM2, 6ème, Coran" className="col-span-3 text-xs h-9" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="lieuNaissance" className="text-right text-xs font-medium">Lieu de naissance</Label>
                <Input id="lieuNaissance" name="lieuNaissance" className="col-span-3 text-xs h-9" placeholder="Dakar (optionnel)" />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="dateNaissance" className="text-right text-xs font-medium">Date de naissance</Label>
                <Input id="dateNaissance" name="dateNaissance" type="date" className="col-span-3 text-xs h-9" />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary" className="text-xs">Annuler</Button>
              </DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white text-xs font-bold" disabled={submitting}>
                {submitting ? 'Envoi...' : 'Valider & Envoyer WhatsApp'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
