
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

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  },
};

export default function LandingPage() {
    const [isFormOpen, setIsFormOpen] = React.useState(false);

    const handleRegistrationSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const form = e.currentTarget;
      const prenom = (form.elements.namedItem('prenom') as HTMLInputElement).value;
      const nom = (form.elements.namedItem('nom') as HTMLInputElement).value;
      const telephone = (form.elements.namedItem('telephone') as HTMLInputElement).value;
      const niveau = (form.elements.namedItem('niveau') as HTMLInputElement).value;

      const message = `
        Nouvelle demande d'inscription:
        Prénom: ${prenom}
        Nom: ${nom}
        Téléphone: ${telephone}
        Niveau: ${niveau}
      `;

      const whatsappUrl = `https://wa.me/221781635209?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      setIsFormOpen(false);
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

        {/* About Us Section */}
        <motion.section 
            id="about" 
            className="w-full py-12 md:py-24 lg:py-32"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
        >
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-gray-800">Bienvenue au Centre Imam Al Housseynou Sow</h2>
                 <p className="mt-4 text-gray-600">
                  Fondé en 2021 et fort de plus de 3 ans d'expérience, notre institut se consacre à offrir une éducation islamique et académique de qualité, préparant nos élèves à devenir des leaders éclairés et des citoyens responsables.
                </p>
              </div>
              <div className="relative h-80 w-full">
                <Image
                  src="https://res.cloudinary.com/dm6yuokre/image/upload/v1759775671/1759775403161_2_opz6ot.jpg"
                  alt="Students eating together"
                  fill
                  className="rounded-xl object-cover"
                  data-ai-hint="students community"
                />
              </div>
            </div>
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
        
        {/* Programs Section */}
        <motion.section
          id="programs"
          className="w-full py-12 md:py-24 lg:py-32"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
        >
          <div className="container mx-auto px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-gray-800">Nos Programmes</h2>
            <div className="mt-12 grid sm:grid-cols-1 lg:grid-cols-2 gap-8">
              <Card>
                <CardHeader className="items-center">
                  <BookOpen className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>L'Arabe et le Coran</CardTitle>
                  <CardDescription>Mémorisation du Coran, études arabes approfondies.</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader className="items-center">
                  <Award className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>Système Français</CardTitle>
                  <CardDescription>De la maternelle au lycée, suivant le programme national.</CardDescription>
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
                <Label htmlFor="niveau" className="text-right">Niveau</Label>
                <Input id="niveau" name="niveau" placeholder="ex: CI, CM2..." className="col-span-3" required />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="secondary">Annuler</Button>
              </DialogClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90">Envoyer via WhatsApp</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
