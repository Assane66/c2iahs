
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Award, GraduationCap, Phone, MapPin, Mail, Bus, Utensils, BedDouble, ArrowRight, Facebook, Twitter, Instagram } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

const FrenchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
);

const QuranIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg>
);

const ComputerIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
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
  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <header className="bg-black/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-6">
            <div className="flex justify-between items-center py-2 text-xs text-gray-400">
                <div>
                    <span>Contactez-nous : +221 33 835 91 51 / 77 788 44 44</span>
                </div>
                <div className="flex gap-4">
                    <Facebook className="h-4 w-4" />
                    <Twitter className="h-4 w-4" />
                    <Instagram className="h-4 w-4" />
                </div>
            </div>
             <hr className="border-gray-700" />
            <div className="flex items-center justify-between h-20">
                <Link href="#" className="flex items-center" prefetch={false}>
                    <GraduationCap className="h-8 w-8 text-primary" />
                    <span className="ml-3 text-xl font-bold">Institut Al Housseynou</span>
                </Link>
                <nav className="hidden lg:flex gap-6 items-center">
                    <Link href="#" className="text-sm font-medium hover:text-primary" prefetch={false}>Accueil</Link>
                    <Link href="#about" className="text-sm font-medium hover:text-primary" prefetch={false}>À propos</Link>
                    <Link href="#programs" className="text-sm font-medium hover:text-primary" prefetch={false}>Programmes</Link>
                    <Link href="#contact" className="text-sm font-medium hover:text-primary" prefetch={false}>Contact</Link>
                </nav>
                 <Button asChild className="bg-primary hover:bg-primary/90">
                    <Link href="/login">Espace Admin</Link>
                </Button>
            </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full h-[70vh] relative">
            <Image
              src="https://picsum.photos/seed/1/1200/800"
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
                        <p className="mt-4 text-lg text-gray-300">
                            Notre mission est de former des leaders de demain en offrant une éducation de qualité, alliant savoir moderne et valeurs islamiques.
                        </p>
                        <Button className="mt-6 bg-primary hover:bg-primary/90 text-lg px-8 py-6">
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
                  src="https://picsum.photos/seed/2/600/600"
                  alt="Children playing"
                  width={600}
                  height={600}
                  className="rounded-xl"
                  data-ai-hint="children playground"
                />
                <div className="absolute -top-8 -left-8 bg-primary text-white p-6 rounded-xl text-center w-32">
                    <p className="text-4xl font-bold">+25</p>
                    <p className="text-lg">ans</p>
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-primary">À PROPOS DE NOUS</h2>
                <p className="mt-4 text-gray-400">
                  Fondée en 1994 par Serigne Moustapha SY (fils de Serigne Abdoul Aziz SY Dabakh), la Fédération Islamique du Sénégal (FIS) a pour mission de promouvoir un islam de paix, de tolérance et de développement.
                </p>
                <p className="mt-4 text-gray-400">
                  Le complexe Cheikh Alhousseynou SY « NDIAMÉ » – CCAHS/N est le major secteur de la FIS. Il est composé d’un internat, d’une mosquée, de classes, de terrains de sports, d’un dispensaire, d’une bibliothèque, etc.
                </p>
                 <Button variant="outline" className="mt-6 border-primary text-primary hover:bg-primary hover:text-white">
                    En savoir plus
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
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-primary">RÉSULTATS 2021 / 2022</h2>
                <div className="mt-12 grid sm:grid-cols-3 gap-8">
                    <Card className="bg-primary/20 border-primary">
                        <CardHeader className="items-center">
                            <Award className="h-12 w-12 text-primary mb-4" />
                            <CardTitle>CFEE</CardTitle>
                            <CardDescription className="text-gray-300">104 admis sur 109 candidats</CardDescription>
                        </CardHeader>
                    </Card>
                    <Card className="bg-primary/20 border-primary">
                        <CardHeader className="items-center">
                            <Award className="h-12 w-12 text-primary mb-4" />
                            <CardTitle>BFEM</CardTitle>
                            <CardDescription className="text-gray-300">46 admis sur 75 candidats</CardDescription>
                        </CardHeader>
                    </Card>
                     <Card className="bg-primary/20 border-primary">
                        <CardHeader className="items-center">
                            <Award className="h-12 w-12 text-primary mb-4" />
                            <CardTitle>BAC</CardTitle>
                            <CardDescription className="text-gray-300">30 admis, 4 mentions bien, 6 assez-bien</CardDescription>
                        </CardHeader>
                    </Card>
                </div>
                 <div className="mt-12 max-w-2xl mx-auto">
                    <p className="font-semibold">TAUX DE RÉUSSITE INTERNAT :</p>
                    <Progress value={80} className="mt-2 h-4 bg-gray-700" />
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
            <div className="grid md:grid-cols-3 gap-8">
                <Card className="bg-gray-800 border-gray-700 text-center p-6">
                    <CardHeader className="items-center">
                        <FrenchIcon />
                        <CardTitle className="mt-4">Le Français :</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-400">Enseignement moderne et laïque, programme officiel (CI au CM2).</p>
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
                 <Card className="bg-gray-800 border-gray-700 text-center p-6">
                    <CardHeader className="items-center">
                        <ComputerIcon />
                        <CardTitle className="mt-4">L'informatique :</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-400">Initiation aux nouvelles technologies, à l'informatique et au digital.</p>
                    </CardContent>
                </Card>
            </div>
          </div>
        </motion.section>
        
        {/* Services Section */}
         <motion.section 
            id="services" 
            className="w-full py-12 md:py-24 lg:py-32 bg-primary/10"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
         >
          <div className="container mx-auto px-4 md:px-6">
             <div className="text-center mb-12">
                 <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-primary">NOS SERVICES</h2>
            </div>
             <div className="grid md:grid-cols-3 gap-8">
                <Card className="bg-primary/20 border-primary p-6">
                    <CardHeader>
                        <Bus className="h-10 w-10 text-primary mb-2" />
                        <CardTitle>TRANSPORT</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-300">Pour déposer et reprendre les élèves à la descente, un système de transport est mis en place.</p>
                    </CardContent>
                </Card>
                 <Card className="bg-accent/20 border-accent p-6">
                    <CardHeader>
                        <Utensils className="h-10 w-10 text-accent mb-2" />
                        <CardTitle>CANTINE</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-300">Les externes ont la possibilité de s'inscrire à la cantine avec un menu varié et des repas équilibrés.</p>
                    </CardContent>
                </Card>
                 <Card className="bg-primary/20 border-primary p-6">
                    <CardHeader>
                        <BedDouble className="h-10 w-10 text-primary mb-2" />
                        <CardTitle>INTERNAT</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-300">Notre internat offre un cadre de vie sécurisé, paisible et un accompagnement de proximité.</p>
                    </CardContent>
                </Card>
            </div>
          </div>
        </motion.section>

        {/* Testimonials */}
        <motion.section 
            id="testimonials" 
            className="w-full py-12 md:py-24 lg:py-32 bg-gray-900"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
        >
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-primary">TÉMOIGNAGES</h2>
            </div>
            <Card className="bg-gray-800 border-gray-700 max-w-3xl mx-auto p-8">
                <CardContent className="flex gap-6">
                    <Image src="https://picsum.photos/seed/avatar/100/100" alt="Parent avatar" width={80} height={80} className="rounded-full" data-ai-hint="person face" />
                    <div>
                        <h3 className="font-bold">Maman Bineta DIOP, Parente d'élève</h3>
                        <p className="text-sm text-gray-400 mb-4">Ingénieur - Chef de projet</p>
                        <blockquote className="italic text-gray-300">
                           "J'ai inscrit mes deux enfants au CCAHS/N. Ils y ont appris le Coran, le français et la sociabilité. Aujourd'hui, je suis fière de leur cursus. L'un est ingénieur et l'autre médecin. Je recommande vivement cet établissement d'excellence."
                        </blockquote>
                    </div>
                </CardContent>
            </Card>
          </div>
        </motion.section>
        
      </main>

      <footer id="contact" className="bg-black py-12">
        <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-4 gap-8 text-gray-400">
                <div>
                    <h3 className="font-bold text-white mb-4">CONTACTEZ-NOUS</h3>
                    <div className="flex flex-col gap-2">
                        <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> <span>+221 78 451 36 33</span></p>
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
    </div>
  );
}
