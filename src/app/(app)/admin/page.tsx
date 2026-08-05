'use client';

import Link from 'next/link';
import { BookCopy, CalendarDays, ImageIcon, Megaphone, LayoutDashboard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AdminHomePage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-primary">Espace Administration</p>
            <h1 className="text-3xl font-bold tracking-tight">Tableau de bord administratif</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">Gérez les programmes, annonces, événements et la galerie depuis un seul endroit.</p>
          </div>
          <Button asChild>
            <Link href="/dashboard">Retour au tableau de bord</Link>
          </Button>
        </div>
      </header>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-primary" /> Annonces</CardTitle>
            <CardDescription>Publiez et mettez à jour les actualités officielles.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">Contrôlez le contenu de la section annonces visibles sur le site public.</p>
            <Button asChild>
              <Link href="/admin/announcements">Gérer les annonces</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookCopy className="h-5 w-5 text-primary" /> Programmes</CardTitle>
            <CardDescription>Ajoutez des formations et parcours pédagogiques.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">Mettez à jour les programmes disponibles et les informations de chaque filière.</p>
            <Button asChild>
              <Link href="/admin/programs">Gérer les programmes</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" /> Événements</CardTitle>
            <CardDescription>Planifiez et publiez les événements du centre.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">Organisez les activités, conférences et journées portes ouvertes.</p>
            <Button asChild>
              <Link href="/admin/events">Gérer les événements</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ImageIcon className="h-5 w-5 text-primary" /> Galerie</CardTitle>
            <CardDescription>Publiez des photos et images d’événements.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">Ajoutez des images pour illustrer la vie du centre et les activités.</p>
            <Button asChild>
              <Link href="/admin/gallery">Gérer la galerie</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
