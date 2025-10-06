
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
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="bg-card sticky top-0 z-50 shadow-sm">
        {/* Top bar */}
        <div className="bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 lg:px-6 flex justify-between items-center py-1 text-xs">
              <div className="flex gap-4 items-center">
                  <span className="flex items-center gap-1.5"><MapPin className="size-3" /> Tivaouane Peulh</span>
                   <span className="flex items-center gap-1.5"><Mail className="size-3" /> c2iahs@gmail.com</span>
              </div>
              <div className="flex gap-4 items-center">
                  <Facebook className="h-4 w-4" />
                  <Twitter className="h-4 w-4" />
                  <Instagram className="h-4 w-4" />
                  <span className="text-xs">French v</span>
              </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-4 lg:px-6">
            <div className="flex items-center justify-between h-20">
                <Link href="#" className="flex items-center" prefetch={false}>
                    <Image src="https://res.cloudinary.com/dm6yuokre/image/upload/v1759771147/IMG-20250924-WA0009_3_efzfrh.jpg" alt="Logo" width={48} height={48} />
                </Link>
                <nav className="hidden lg:flex gap-8 items-center text-sm font-medium">
                    <Link href="#home" className="text-foreground hover:text-primary" prefetch={false}>Accueil</Link>
                    <Link href="#about" className="text-foreground hover:text-primary" prefetch={false}>À propos</Link>
                    <Link href="#programs" className="text-foreground hover:text-primary" prefetch={false}>Programmes</Link>
                    <Link href="#contact" className="text-foreground hover:text-primary" prefetch={false}>Contact</Link>
                    <Link href="/login" className="text-foreground hover:text-primary" prefetch={false}>Espace Admin</Link>
                </nav>
                 <div className="hidden lg:flex items-center">
                    <Button onClick={() => setIsFormOpen(true)} className="bg-primary hover:bg-primary/90">
                        S'INSCRIRE
                    </Button>
                </div>

                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" size="icon" className="lg:hidden">
                            <Menu className="h-6 w-6" />
                            <span className="sr-only">Ouvrir le menu</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="bg-card text-foreground">
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
                <Button asChild variant="link" className="mt-4 text-primary px-0">
                    <Link href="/about">En savoir plus sur notre mission <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
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
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
                 <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-gray-800">NOS PROGRAMMES</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
                <Card className="text-center p-6">
                    <CardHeader className="items-center">
                        <GraduationCap className="size-12 text-primary"/>
                        <CardTitle className="mt-4">Le Français :</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600">Enseignement moderne programme officiel (CI au CM2).</p>
                    </CardContent>
                </Card>
                 <Card className="text-center p-6">
                    <CardHeader className="items-center">
                        <CardTitle className="mt-4">L'Arabe et le Coran :</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-600">Enseignement de l'arabe et mémorisation du Coran. Notre programme permet aux enfants d'être mémorisateurs.</p>
                    </CardContent>
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

      <footer id="contact" className="bg-gray-800 text-gray-300 py-12">
        <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-4 gap-8">
                <div>
                    <h3 className="font-bold text-white mb-4">CONTACTEZ-NOUS</h3>
                    <div className="flex flex-col gap-2">
                        <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> <span>+221 78 430 30 18 / +221 78 163 52 09</span></p>
                        <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> <span>c2iahs@gmail.com</span></p>
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
                     <div className="bg-primary/10 border border-primary p-6 rounded-lg">
                        <h4 className="font-bold text-white mb-2">Abonnez-vous à notre newsletter</h4>
                        <div className="flex gap-2">
                            <Input type="email" placeholder="Votre email" className="bg-gray-700 border-gray-600" />
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
            <div className="mt-12 border-t border-gray-700 pt-6 text-center text-xs text-gray-400">
                <p>&copy; {new Date().getFullYear()} Institut Imame Al Housseynou Sow. Tous droits réservés.</p>
            </div>
        </div>
      </footer>

      <Link href="https://wa.me/221781635209" target="_blank" rel="noopener noreferrer" className="fixed bottom-6 right-6 z-50">
        <Image
          src="https://res.cloudinary.com/dm6yuokre/image/upload/v1752163214/Pngtree_whatsapp_icon_whatsapp_logo_3584844_qnvcmv.png"
          alt="WhatsApp"
          width={50}
          height={50}
          className="rounded-full shadow-lg hover:scale-110 transition-transform"
        />
      </Link>
    </div>
  );
}

    