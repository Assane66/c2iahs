
'use client';

import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Link from 'next/link';
import Image from 'next/image';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Phone, MapPin, Mail, Menu, Facebook, Twitter, Instagram } from 'lucide-react';
import React from 'react';

// export const metadata: Metadata = {
//   title: 'SchoolZenith Admin',
//   description: "Panneau d'administration pour SchoolZenith",
// };

function SiteHeader() {
  const [open, setOpen] = React.useState(false);

  return (
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
              <Link href="/" className="flex items-center" prefetch={false}>
                  <Image src="https://res.cloudinary.com/dm6yuokre/image/upload/v1762822007/IMG-20250924-WA0009_1_psprih.jpg" alt="Logo" width={48} height={48} />
              </Link>
              <nav className="hidden lg:flex gap-8 items-center text-sm font-medium">
                  <Link href="/" className="text-foreground hover:text-primary" prefetch={false}>Accueil</Link>
                  <Link href="/about" className="text-foreground hover:text-primary" prefetch={false}>À Propos</Link>
                  <Link href="/programs" className="text-foreground hover:text-primary" prefetch={false}>Programmes</Link>
                  <Link href="/contact" className="text-foreground hover:text-primary" prefetch={false}>Contact</Link>
                  <Link href="/login" className="text-foreground hover:text-primary" prefetch={false}>Espace Admin</Link>
              </nav>
               <div className="hidden lg:flex items-center">
                  <Button className="bg-primary hover:bg-primary/90">
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
                          <Link href="/" onClick={() => setOpen(false)} className="hover:text-primary">Accueil</Link>
                          <Link href="/about" onClick={() => setOpen(false)} className="hover:text-primary">À Propos</Link>
                          <Link href="/programs" onClick={() => setOpen(false)} className="hover:text-primary">Programmes</Link>
                          <Link href="/contact" onClick={() => setOpen(false)} className="hover:text-primary">Contact</Link>
                           <Button asChild className="bg-primary hover:bg-primary/90 mt-4">
                              <Link href="/login">Espace Admin</Link>
                          </Button>
                      </nav>
                  </SheetContent>
              </Sheet>
          </div>
      </div>
    </header>
  );
}


function SiteFooter() {
  return (
    <>
      <footer id="contact" className="bg-gray-800 text-gray-300 py-12">
        <div className="container mx-auto px-4 md:px-6">
            <div className="grid md:grid-cols-4 gap-8">
                <div>
                    <h3 className="font-bold text-white mb-4">CONTACTEZ-NOUS</h3>
                    <div className="flex flex-col gap-2">
                        <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> <span>+221 75 336 25 39 / +221 78 163 52 09</span></p>
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
                        <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
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

      <Link 
        href="https://wa.me/221781635209?text=Bonjour,%20je%20suis%20intéressé(e)%20par%20le%20Centre%20Islamique%20Imam%20Al%20Housseynou%20Sow%20et%20j'aimerais%20avoir%20plus%20d'informations." 
        target="_blank" 
        rel="noopener noreferrer" 
        className="fixed bottom-6 right-6 z-50"
      >
        <Image
          src="https://res.cloudinary.com/dm6yuokre/image/upload/v1752163214/Pngtree_whatsapp_icon_whatsapp_logo_3584844_qnvcmv.png"
          alt="WhatsApp"
          width={50}
          height={50}
          className="rounded-full shadow-lg hover:scale-110 transition-transform"
        />
      </Link>
    </>
  );
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning style={{ overflowX: 'hidden' }}>
      <head>
        <title>Centre Islamique Institut Al Housseynou Sow</title>
        <meta name="description" content="Découvrez notre vision, nos programmes et rejoignez-nous à Tivaouane Peulh." />
        <meta property="og:title" content="Centre Islamique Institut Al Housseynou Sow" />
        <meta property="og:description" content="Découvrez notre vision, nos programmes et rejoignez-nous à Tivaouane Peulh." />
        <meta property="og:url" content="https://c2iahs.com/" />
        <meta property="og:image" content="https://res.cloudinary.com/dm6yuokre/image/upload/v1762822007/IMG-20250924-WA0009_1_psprih.jpg" />
        
        <link rel="apple-touch-icon" sizes="180x180" href="https://res.cloudinary.com/dm6yuokre/image/upload/v1763042585/apple-touch-icon_njjl3z.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="https://res.cloudinary.com/dm6yuokre/image/upload/v1763042648/favicon-32x32_decci4.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="https://res.cloudinary.com/dm6yuokre/image/upload/v1763042637/favicon-16x16_hvgfxd.png" />
        <link rel="icon" type="image/x-icon" href="https://res.cloudinary.com/dm6yuokre/image/upload/v1763042599/favicon_f4hcvq.ico" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen bg-background text-foreground" style={{ overflowX: 'hidden' }}>
        <SiteHeader />
        <div className="flex-1">{children}</div>
        <SiteFooter />
        <Toaster />
      </body>
    </html>
  );
}
