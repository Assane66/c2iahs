'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { QrCode, Search, UserCheck, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ScanPage() {
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;

    setLoading(true);
    try {
      const cleanQuery = searchInput.trim();

      // If full URL was scanned
      if (cleanQuery.includes('/students/')) {
        const parts = cleanQuery.split('/students/');
        const targetId = parts[parts.length - 1];
        router.push(`/students/${targetId}`);
        return;
      }

      // Try searching by matricule or ID
      const studentsRef = collection(db, 'students');
      const q = query(studentsRef, where('matricule', '==', cleanQuery));
      const snap = await getDocs(q);

      if (!snap.empty) {
        const foundStudent = snap.docs[0];
        router.push(`/students/${foundStudent.id}`);
        return;
      }

      // Fallback search by ID directly
      router.push(`/students/${cleanQuery}`);
    } catch (error) {
      console.error(error);
      toast({ title: 'Erreur', description: 'Élève non trouvé avec ce QR code ou matricule.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto py-8">
      <div className="text-center space-y-2">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800 mb-2">
          <QrCode className="h-8 w-8" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Scanner de Carte Élève</h1>
        <p className="text-muted-foreground text-sm">
          Scannez le QR Code de la carte élève ou saisissez son matricule pour vérifier son statut d'inscription et de règlement des scolarités.
        </p>
      </div>

      <Card className="rounded-3xl shadow-md border-emerald-100">
        <CardHeader>
          <CardTitle className="text-lg text-center">Vérification Instantanée</CardTitle>
          <CardDescription className="text-center text-xs">
            Pointez votre lecteur de code QR ou collez le lien/matricule ci-dessous.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="scannerInput" className="text-xs font-semibold">
                Données du QR Code ou Matricule (ex: ELV2026-001)
              </Label>
              <div className="flex gap-2">
                <Input
                  id="scannerInput"
                  placeholder="Scanner ou coller le contenu du QR..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="h-11 text-sm"
                  autoFocus
                />
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white h-11 px-6 font-semibold" disabled={loading}>
                  {loading ? 'Recherche...' : <><Search className="mr-2 h-4 w-4" /> Vérifier</>}
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-8 border-t pt-6 space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">Ce que le scan affiche :</div>
            <div className="grid gap-2.5 text-xs">
              <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Statut de validité du dossier élève (Actif / Inactif)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Nombre de mois de scolarité déjà payés sur l'année</span>
              </div>
              <div className="flex items-center gap-2 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>Mois restants à régler ou impayés éventuels</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
