
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Award, GraduationCap, Phone, MapPin, Mail, ArrowRight, Facebook, Twitter, Instagram, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';


const FrenchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
);

const QuranIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
);

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
    const [open, setOpen] = React.useState(false);
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
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <header className="bg-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-6">
            <div className="hidden md:flex justify-between items-center py-2 text-xs text-gray-400">
                <div>
                    <span>Contactez-nous : +221 78 430 30 18 / +221 78 163 52 09 Email : -</span>
                </div>
                <div className="flex gap-4">
                    <Facebook className="h-4 w-4" />
                    <Twitter className="h-4 w-4" />
                    <Instagram className="h-4 w-4" />
                </div>
            </div>
             <hr className="border-gray-700 hidden md:block" />
            <div className="flex items-center justify-between h-20">
                <Link href="#" className="flex items-center" prefetch={false}>
                    <GraduationCap className="h-8 w-8 text-primary" />
                    <span className="ml-3 text-xl font-bold">Institut Al Housseynou</span>
                </Link>
                <nav className="hidden lg:flex gap-6 items-center">
                    <Link href="#home" className="text-sm font-medium hover:text-primary" prefetch={false}>Accueil</Link>
                    <Link href="#about" className="text-sm font-medium hover:text-primary" prefetch={false}>À propos</Link>
                    <Link href="#programs" className="text-sm font-medium hover:text-primary" prefetch={false}>Programmes</Link>
                    <Link href="#contact" className="text-sm font-medium hover:text-primary" prefetch={false}>Contact</Link>
                </nav>
                 <div className="hidden lg:flex items-center">
                    <Button asChild className="bg-primary hover:bg-primary/90">
                        <Link href="/login">Espace Admin</Link>
                    </Button>
                </div>

                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="lg:hidden bg-transparent border-gray-600">
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">Ouvrir le menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="bg-gray-900/95 border-gray-800 text-white">
                         <nav className="grid gap-6 text-lg font-medium mt-16">
                            <Link href="#home" onClick={() => setOpen(false)} className="hover:text-primary">Accueil</Link>
                            <Link href="#about" onClick={() => setOpen(false)} className="hover:text-primary">À propos</Link>
                            <Link href="#programs" onClick={() => setOpen(false)} className="hover:text-primary">Programmes</Link>
                            <Link href="#contact" onClick={() => setOpen(false)} className="hover:text-primary">Contact</Link>
                             <Button asChild className="bg-primary hover:bg-primary/90 mt-4">
                                <Link href="/login">Espace Admin</Link>
                            </Button>
                        </nav>
                    </SheetContent>
                </Sheet>
            </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section id="home" className="w-full h-[70vh] relative">
            <Image
              src="https://res.cloudinary.com/dm6yuokre/image/upload/v1759771147/IMG-20250924-WA0009_3_efzfrh.jpg"
              alt="Students in classroom"
              fill
              className="object-cover"
              data-ai-hint="students classroom"
            />
            <div className="absolute inset-0 bg-black/60 flex items-center">
                <div className="container mx-auto px-4 md:px-6">
                    <motion.div 
                        initial={{ opacity: 0, x: -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-2xl"
                    >
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">
                            OPTEZ POUR L'EXCELLENCE ÉDUCATIVE!
                        </h1>
                        <Button className="mt-6 bg-primary hover:bg-primary/90 text-lg px-8 py-6" onClick={() => setIsFormOpen(true)}>
                            Obtenir mon formulaire d'inscription <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </motion.div>
                </div>
            </div>
        </section>

        {/* About Us Section */}
        <motion.section 
            id="about" 
            className="w-full py-12 md:py-24 lg:py-32 bg-gray-900"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
        >
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <Image
                  src="https://res.cloudinary.com/dm6yuokre/image/upload/v1759771147/IMG-20250924-WA0009_3_efzfrh.jpg"
                  alt="Children playing"
                  width={600}
                  height={600}
                  className="rounded-xl"
                  data-ai-hint="children playground"
                />
                <div className="absolute top-4 left-4 bg-primary text-white p-4 rounded-xl text-center w-24">
                    <p className="text-4xl font-bold">+3</p>
                    <p className="text-lg">ans</p>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-primary">À PROPOS DE NOUS</h2>
                 <p className="mt-4 text-gray-400">
                  Le Centre Imam Al Housseynou Sow est un lieu de croissance et d'épanouissement. Fondé en hommage à l'Imam Al Housseynou Sow, ce centre a pour vocation d'offrir une éducation complète dès les premières années du primaire, du C1 à la CM2. L'objectif est de poser les fondations solides qui soutiendront les enfants tout au long de leur vie.
                </p>
                <Button asChild className="mt-6 bg-primary hover:bg-primary/90">
                    <Link href="/about">En savoir plus <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Results Section */}
        <motion.section 
            className="w-full py-12 md:py-24 lg:py-32 bg-primary/10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
        >
            <div className="container mx-auto px-4 md:px-6 text-center">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-primary">Résultats de l'Entrée en 6ème</h2>
                <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <Card className="bg-primary/20 border-primary">
                        <CardHeader className="items-center">
                            <Award className="h-12 w-12 text-primary mb-4" />
                            <CardTitle>2022</CardTitle>
                            <CardDescription className="text-gray-300">17 élèves - 100% admis</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="bg-primary/20 border-primary">
                        <CardHeader className="items-center">
                            <Award className="h-12 w-12 text-primary mb-4" />
                            <CardTitle>2023</CardTitle>
                            <CardDescription className="text-gray-300">17 élèves - 88% admis</CardDescription>
                        </CardHeader>
                    </Card>
                     <Card className="bg-primary/20 border-primary">
                        <CardHeader className="items-center">
                            <Award className="h-12 w-12 text-primary mb-4" />
                            <CardTitle>2024</CardTitle>
                            <CardDescription className="text-gray-300">25 élèves - 100% admis</CardDescription>
                        </CardHeader>
                    </Card>
                     <Card className="bg-primary/20 border-primary">
                        <CardHeader className="items-center">
                            <Award className="h-12 w-12 text-primary mb-4" />
                            <CardTitle>2025</CardTitle>
                            <CardDescription className="text-gray-300">20 élèves - 85% admis</CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </div>
        </motion.section>

        {/* Programs Section */}
        <motion.section 
            id="programs" 
            className="w-full py-12 md:py-24 lg:py-32 bg-gray-900"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
        >
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
                 <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-primary">NOS PROGRAMMES</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
                <Card className="bg-gray-800 border-gray-700 text-center p-6">
                    <CardHeader className="items-center">
                        <FrenchIcon />
                        <CardTitle className="mt-4">Le Français :</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-400">Enseignement moderne programme officiel (CI au CM2).</p>
                    </CardContent>
                </Card>
                 <Card className="bg-gray-800 border-gray-700 text-center p-6">
                    <CardHeader className="items-center">
                        <QuranIcon />
                        <CardTitle className="mt-4">L'Arabe et le Coran :</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-400">Enseignement de l'arabe et mémorisation du Coran. Notre programme permet aux enfants d'être mémorisateurs.</p>
                    </CardContent>
                </Card>
            </div>
          </div>
        </motion.section>
        
      </main>
      
      {/* Registration Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-gray-800 border-gray-700 text-white">
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
                <Input id="prenom" name="prenom" className="col-span-3 bg-gray-700 border-gray-600" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nom" className="text-right">Nom</Label>
                <Input id="nom" name="nom" className="col-span-3 bg-gray-700 border-gray-600" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="telephone" className="text-right">Téléphone</Label>
                <Input id="telephone" name="telephone" type="tel" className="col-span-3 bg-gray-700 border-gray-600" required />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="niveau" className="text-right">Niveau</Label>
                <Input id="niveau" name="niveau" placeholder="ex: CI, CM2..." className="col-span-3 bg-gray-700 border-gray-600" required />
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

      <footer id="contact" className="bg-black py-12">
        <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-4 gap-8 text-gray-400">
                <div>
                    <h3 className="font-bold text-white mb-4">CONTACTEZ-NOUS</h3>
                    <div className="flex flex-col gap-2">
                        <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> <span>+221 78 430 30 18 / +221 78 163 52 09</span></p>
                        <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> <span>contact@alhousseynou.sn</span></p>
                        <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> <span>Tivaouane Peulh, QRT Bayal Ba</span></p>
                    </div>
                </div>
                 <div>
                    <h3 className="font-bold text-white mb-4">À PROPOS DE NOUS</h3>
                     <ul className="flex flex-col gap-2 text-sm">
                        <li><Link href="#" className="hover:text-primary">Missions et visions</Link></li>
                        <li><Link href="#" className="hover:text-primary">Mot du directeur</Link></li>
                        <li><Link href="#" className="hover:text-primary">Infrastructures</Link></li>
                        <li><Link href="#" className="hover:text-primary">Contact</Link></li>
                    </ul>
                </div>
                 <div>
                    <h3 className="font-bold text-white mb-4">ACTUALITÉS ET ÉVÉNEMENTS</h3>
                    <ul className="flex flex-col gap-2 text-sm">
                         <li><Link href="#" className="hover:text-primary">Ziarra Annuelle Tivaouane</Link></li>
                         <li><Link href="#" className="hover:text-primary">Conférence Islamique</Link></li>
                         <li><Link href="#" className="hover:text-primary">Journée portes ouvertes</Link></li>
                    </ul>
                </div>
                <div>
                     <div className="bg-primary/20 border border-primary p-6 rounded-lg">
                        <h4 className="font-bold text-white mb-2">Abonnez-vous à notre newsletter</h4>
                        <div className="flex gap-2">
                            <Input type="email" placeholder="Votre email" className="bg-gray-800 border-gray-700" />
                            <Button className="bg-primary hover:bg-primary/90">Envoyer</Button>
                        </div>
                        <div className="mt-4">
                            <h4 className="font-bold text-white mb-2">Suivez-nous</h4>
                             <div className="flex gap-4">
                                <Facebook className="h-5 w-5 hover:text-primary cursor-pointer" />
                                <Twitter className="h-5 w-5 hover:text-primary cursor-pointer" />
                                <Instagram className="h-5 w-5 hover:text-primary cursor-pointer" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-12 border-t border-gray-800 pt-6 text-center text-xs text-gray-500">
                <p>&copy; {new Date().getFullYear()} Institut Imame Al Housseynou Sow. Tous droits réservés.</p>
            </div>
        </div>
      </footer>

      <Link href="https://wa.me/781635209" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50">
        <Image
          src="https://res.cloudinary.com/dm6yuokre/image/upload/v1752163214/Pngtree_whatsapp_icon_whatsapp_logo_3584844_qnvcmv.png"
          alt="WhatsApp"
          width={60}
          height={60}
          className="rounded-full shadow-lg hover:scale-110 transition-transform"
        />
      </Link>
    </div>
  );
}
