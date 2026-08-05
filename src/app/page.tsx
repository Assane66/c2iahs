
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Award, ArrowRight, BookOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase';

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.2
    }
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
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
        {/* Hero Section */}
        <section id="home" className="w-full relative bg-card py-20">
            <div className="container mx-auto px-4 md:px-6 grid md:grid-cols-2 items-center gap-8">
                <motion.div 
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="max-w-2xl text-left"
                >
                    <p className="text-primary font-semibold tracking-wider">BIENVENUE AU</p>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mt-2 text-gray-800">
                        Centre Islamique Imam Al Housseynou Sow
                    </h1>
                    <Button className="mt-6 bg-primary hover:bg-primary/90 text-lg px-8 py-6" onClick={() => setIsFormOpen(true)}>
                        S'INSCRIRE <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                </motion.div>
                 <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                     className="relative h-64 md:h-[450px] rounded-lg overflow-hidden"
                 >
                    <Image
                      src="https://res.cloudinary.com/dm6yuokre/image/upload/v1759195047/1758764881367_2_gbnpjm.jpg"
                      alt="Students in graduation gowns"
                      fill
                      className="object-cover"
                      data-ai-hint="students graduation"
                    />
                 </motion.div>
            </div>
        </section>

        {/* About Preview Section */}
        <motion.section 
            className="w-full py-12 md:py-24"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
        >
          <div className="container mx-auto px-4 md:px-6 grid md:grid-cols-2 gap-12 items-center">
            <motion.div variants={itemVariants}>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-gray-800">Un Lieu d'Apprentissage et de Foi</h2>
               <p className="mt-4 text-gray-600 leading-relaxed">
                Fondé en 2021, notre institut est né d'une vision simple : créer un environnement où l'excellence académique et l'enseignement islamique authentique se rencontrent. Nous formons des esprits brillants et des cœurs fidèles.
              </p>
               <Button asChild className="mt-6">
                <Link href="/about">
                  En savoir plus <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </motion.div>
            <motion.div 
              className="relative h-80 w-full lg:h-96"
              variants={itemVariants}
            >
              <Image
                src="https://res.cloudinary.com/dm6yuokre/image/upload/v1759775671/1759775403161_2_opz6ot.jpg"
                alt="Élèves du centre"
                fill
                className="rounded-xl object-cover shadow-lg"
                data-ai-hint="students school community"
              />
            </motion.div>
          </div>
        </motion.section>

        {/* Results Section */}
        <motion.section 
            className="w-full py-12 md:py-24 lg:py-32 bg-secondary"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
        >
            <div className="container mx-auto px-4 md:px-6 text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-gray-800">Résultats de l'Entrée en 6ème</h2>
                <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <Card>
                        <CardHeader className="items-center">
                            <Award className="h-12 w-12 text-primary mb-4" />
                            <CardTitle>2022</CardTitle>
                            <CardDescription>17 élèves - 100% admis</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card>
                        <CardHeader className="items-center">
                            <Award className="h-12 w-12 text-primary mb-4" />
                            <CardTitle>2023</CardTitle>
                            <CardDescription>17 élèves - 88% admis</CardDescription>
                        </CardHeader>
                    </Card>
                     <Card>
                        <CardHeader className="items-center">
                            <Award className="h-12 w-12 text-primary mb-4" />
                            <CardTitle>2024</CardTitle>
                            <CardDescription>25 élèves - 100% admis</CardDescription>
                        </CardHeader>
                    </Card>
                     <Card>
                        <CardHeader className="items-center">
                            <Award className="h-12 w-12 text-primary mb-4" />
                            <CardTitle>2025</CardTitle>
                            <CardDescription>20 élèves - 85% admis</CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        </motion.section>
        
      </main>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-card">
          <DialogHeader>
            <DialogTitle>Formulaire d'Inscription</DialogTitle>
            <DialogDescription>
              Veuillez remplir les informations ci-dessous. Elles seront envoyées via WhatsApp.
            </DialogDescription>
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
                <Input id="niveau" name="niveau" placeholder="ex: CM2" className="col-span-3" required />
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
