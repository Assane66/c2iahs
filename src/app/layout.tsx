'use client';

import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Link from 'next/link';
import Image from 'next/image';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Phone, MapPin, Mail, Menu, Facebook, Twitter, Instagram, ArrowRight, Award, ShieldCheck, HeartHandshake } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type SiteSettings = {
  schoolName: string;
  shortName: string;
  address: string;
  phone1: string;
  phone2: string;
  whatsappNumber: string;
  email: string;
  logoUrl: string;
  facebookUrl?: string;
  instagramUrl?: string;
  twitterUrl?: string;
};

const defaultSettings: SiteSettings = {
  schoolName: 'Centre Islamique Institut Al Housseynou Sow',
  shortName: 'C2IAHS',
  address: 'Tivaouane Peulh, QRT Bayal Ba',
  phone1: '+221 78 163 52 09',
  phone2: '+221 75 336 25 39',
  whatsappNumber: '221781635209',
  email: 'c2iahs@gmail.com',
  logoUrl: 'https://res.cloudinary.com/dm6yuokre/image/upload/v1762822007/IMG-20250924-WA0009_1_psprih.jpg',
  facebookUrl: '#',
  instagramUrl: '#',
  twitterUrl: '#',
};

function SiteHeader({ settings }: { settings: SiteSettings }) {
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="sticky top-0 z-50 transition-all duration-300">
      {/* Top Emerald Bar */}
      <div className="emerald-gradient-bg text-emerald-100 border-b border-emerald-800/40">
        <div className="container mx-auto px-4 lg:px-8 flex justify-between items-center py-2 text-xs">
          <div className="flex flex-wrap gap-6 items-center">
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin className="h-3.5 w-3.5 text-secondary" /> {settings.address}
            </span>
            <span className="hidden md:flex items-center gap-1.5 font-medium">
              <Phone className="h-3.5 w-3.5 text-secondary" /> {settings.phone1}
            </span>
            <span className="hidden lg:flex items-center gap-1.5 font-medium">
              <Mail className="h-3.5 w-3.5 text-secondary" /> {settings.email}
            </span>
          </div>
          <div className="flex gap-4 items-center">
            <a href={settings.facebookUrl} target="_blank" rel="noreferrer" className="hover:text-secondary transition-colors">
              <Facebook className="h-3.5 w-3.5" />
            </a>
            <a href={settings.instagramUrl} target="_blank" rel="noreferrer" className="hover:text-secondary transition-colors">
              <Instagram className="h-3.5 w-3.5" />
            </a>
            <a href={settings.twitterUrl} target="_blank" rel="noreferrer" className="hover:text-secondary transition-colors">
              <Twitter className="h-3.5 w-3.5" />
            </a>
            <span className="gold-badge text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Sénégal
            </span>
          </div>
        </div>
      </div>

      {/* Main Header with Glassmorphism */}
      <div className={`transition-all duration-300 ${scrolled ? 'glass-panel shadow-md py-3' : 'bg-white py-4 shadow-sm'}`}>
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group" prefetch={false}>
              <div className="relative h-12 w-12 rounded-xl overflow-hidden shadow-sm group-hover:scale-105 transition-transform border border-emerald-100">
                <Image src={settings.logoUrl} alt="Logo" fill className="object-cover" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base md:text-lg tracking-tight text-slate-900 leading-tight">
                  {settings.shortName}
                </span>
                <span className="text-[11px] text-muted-foreground font-medium hidden sm:inline-block">
                  Institut Imam Al Housseynou Sow
                </span>
              </div>
            </Link>

            <nav className="hidden lg:flex gap-8 items-center text-sm font-semibold text-slate-700">
              <Link href="/" className="hover:text-primary transition-colors">Accueil</Link>
              <Link href="/about" className="hover:text-primary transition-colors">À Propos</Link>
              <Link href="/programs" className="hover:text-primary transition-colors">Programmes</Link>
              <Link href="/announcements" className="hover:text-primary transition-colors">Annonces</Link>
              <Link href="/events" className="hover:text-primary transition-colors">Événements</Link>
              <Link href="/gallery" className="hover:text-primary transition-colors">Galerie</Link>
              <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
            </nav>

            <div className="hidden lg:flex items-center gap-3">
              <Link href="/login" className="text-xs font-semibold text-slate-600 hover:text-primary transition-colors px-3 py-2">
                Espace Admin
              </Link>
              <Button className="bg-primary hover:bg-primary/90 text-white font-semibold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-emerald-900/10" asChild>
                <Link href="/#inscription">Demande d'Inscription</Link>
              </Button>
            </div>

            {/* Mobile menu trigger */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Ouvrir le menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="bg-white text-slate-900">
                <div className="flex items-center gap-3 mb-8 pt-4">
                  <Image src={settings.logoUrl} alt="Logo" width={40} height={40} className="rounded-lg" />
                  <span className="font-bold text-base">{settings.shortName}</span>
                </div>
                <nav className="grid gap-4 text-base font-semibold">
                  <Link href="/" onClick={() => setOpen(false)} className="hover:text-primary py-2 border-b">Accueil</Link>
                  <Link href="/about" onClick={() => setOpen(false)} className="hover:text-primary py-2 border-b">À Propos</Link>
                  <Link href="/programs" onClick={() => setOpen(false)} className="hover:text-primary py-2 border-b">Programmes</Link>
                  <Link href="/announcements" onClick={() => setOpen(false)} className="hover:text-primary py-2 border-b">Annonces</Link>
                  <Link href="/events" onClick={() => setOpen(false)} className="hover:text-primary py-2 border-b">Événements</Link>
                  <Link href="/gallery" onClick={() => setOpen(false)} className="hover:text-primary py-2 border-b">Galerie</Link>
                  <Link href="/contact" onClick={() => setOpen(false)} className="hover:text-primary py-2 border-b">Contact</Link>
                  <Button asChild className="bg-primary hover:bg-primary/90 text-white mt-4">
                    <Link href="/login">Accès Administrateur</Link>
                  </Button>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}

function SiteFooter({ settings }: { settings: SiteSettings }) {
  return (
    <>
      <footer id="contact" className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
        <div className="container mx-auto px-4 md:px-8">
          <div className="grid md:grid-cols-4 gap-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Image src={settings.logoUrl} alt="Logo" width={44} height={44} className="rounded-xl border border-slate-700" />
                <h3 className="font-bold text-white text-base leading-snug">{settings.schoolName}</h3>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Un établissement d'excellence proposant une formation académique rigoureuse alliée aux valeurs morales et spirituelles islamiques.
              </p>
              <div className="flex gap-3 pt-2">
                <a href={settings.facebookUrl} className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500 transition-colors">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href={settings.instagramUrl} className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500 transition-colors">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href={settings.twitterUrl} className="h-8 w-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-500 transition-colors">
                  <Twitter className="h-4 w-4" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm tracking-wider uppercase mb-4 text-emerald-400">Coordonnées</h4>
              <div className="flex flex-col gap-3 text-xs">
                <p className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{settings.address}</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Phone className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{settings.phone1} / {settings.phone2}</span>
                </p>
                <p className="flex items-center gap-2.5">
                  <Mail className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{settings.email}</span>
                </p>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white text-sm tracking-wider uppercase mb-4 text-emerald-400">Navigation Rapide</h4>
              <ul className="flex flex-col gap-2.5 text-xs">
                <li><Link href="/about" className="hover:text-emerald-400 transition-colors">Missions & Vision</Link></li>
                <li><Link href="/programs" className="hover:text-emerald-400 transition-colors">Programmes Pédagogiques</Link></li>
                <li><Link href="/announcements" className="hover:text-emerald-400 transition-colors">Annonces Officielle</Link></li>
                <li><Link href="/events" className="hover:text-emerald-400 transition-colors">Agenda Événements</Link></li>
                <li><Link href="/gallery" className="hover:text-emerald-400 transition-colors">Galerie Photos</Link></li>
                <li><Link href="/contact" className="hover:text-emerald-400 transition-colors">Nous Contacter</Link></li>
              </ul>
            </div>

            <div>
              <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl">
                <h4 className="font-bold text-white text-sm mb-2">Restez Informés</h4>
                <p className="text-xs text-slate-400 mb-3">Abonnez-vous à notre bulletin d'actualités scolaires.</p>
                <div className="flex gap-2">
                  <Input type="email" placeholder="Votre email" className="bg-slate-950 border-slate-800 text-xs h-9" />
                  <Button size="sm" className="bg-primary hover:bg-primary/90 text-white h-9 text-xs">Ok</Button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12 border-t border-slate-900 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
            <p>&copy; {new Date().getFullYear()} {settings.schoolName}. Tous droits réservés.</p>
            <div className="flex gap-6">
              <Link href="/login" className="hover:underline">Espace Directeur</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${settings.whatsappNumber}?text=Bonjour,%20je%20souhaite%20obtenir%20des%20informations%20sur%20les%20inscriptions%20au%20${encodeURIComponent(settings.shortName)}.`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="WhatsApp Contact"
      >
        <div className="relative">
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <Image
            src="https://res.cloudinary.com/dm6yuokre/image/upload/v1752163214/Pngtree_whatsapp_icon_whatsapp_logo_3584844_qnvcmv.png"
            alt="WhatsApp"
            width={54}
            height={54}
            className="rounded-full shadow-2xl group-hover:scale-110 transition-transform duration-300"
          />
        </div>
      </a>
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'siteSettings', 'main');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings((prev) => ({ ...prev, ...docSnap.data() }));
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchSettings();
  }, []);

  return (
    <html lang="fr" suppressHydrationWarning style={{ overflowX: 'hidden' }}>
      <head>
        <title>{settings.schoolName}</title>
        <meta name="description" content="Une éducation islamique moderne, structurée et bienveillante à Tivaouane Peulh." />
        <meta property="og:title" content={settings.schoolName} />
        <meta property="og:description" content="Une éducation islamique moderne, structurée et bienveillante." />
        <meta property="og:image" content={settings.logoUrl} />
        <link rel="icon" href="https://res.cloudinary.com/dm6yuokre/image/upload/v1762822007/IMG-20250924-WA0009_1_psprih.jpg" />
        <link rel="apple-touch-icon" href="https://res.cloudinary.com/dm6yuokre/image/upload/v1762822007/IMG-20250924-WA0009_1_psprih.jpg" />

        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased flex flex-col min-h-screen bg-background text-foreground" style={{ overflowX: 'hidden' }}>
        <SiteHeader settings={settings} />
        <div className="flex-1">{children}</div>
        <SiteFooter settings={settings} />
        <Toaster />
      </body>
    </html>
  );
}
