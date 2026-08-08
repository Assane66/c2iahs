'use client';

import { useState } from 'react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { logAuditAction } from '@/lib/audit';
import { Database, Download, Upload, AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function AdminBackupPage() {
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();

  const handleExportBackup = async () => {
    setExporting(true);
    try {
      const collectionsToExport = ['students', 'classes', 'registrations', 'payments', 'academicYears', 'siteSettings', 'announcements', 'programs', 'events', 'gallery'];
      const backupData: Record<string, any[]> = {};

      for (const colName of collectionsToExport) {
        const snapshot = await getDocs(collection(db, colName));
        backupData[colName] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));
      }

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `c2iahs-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      await logAuditAction('settings_updated', 'Génération et téléchargement d’une sauvegarde de la base de données');
      toast({ title: 'Sauvegarde téléchargée', description: 'Le fichier JSON de sauvegarde est enregistré.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Erreur', description: 'Échec de l’exportation de la base.', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmRestore = window.confirm(
      "ATTENTION : Cette action va réécrire les données de la base. Souhaitez-vous vraiment continuer ?"
    );
    if (!confirmRestore) return;

    setImporting(true);
    try {
      const text = await file.text();
      const backupData = JSON.parse(text);

      for (const colName of Object.keys(backupData)) {
        const items = backupData[colName];
        if (Array.isArray(items)) {
          for (const item of items) {
            const { id, ...data } = item;
            if (id) {
              await setDoc(doc(db, colName, id), data, { merge: true });
            }
          }
        }
      }

      await logAuditAction('backup_restored', 'Restauration complète effectuée depuis un fichier de sauvegarde');
      toast({ title: 'Restauration réussie', description: 'Toutes les collections ont été mises à jour.' });
    } catch (error) {
      console.error(error);
      toast({ title: 'Erreur de restauration', description: 'Fichier JSON invalide ou échec réseau.', variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sauvegarde & Restauration</h1>
        <p className="text-muted-foreground">Sécurisez vos données en téléchargeant des copies de sauvegarde intégrales.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-emerald-200 bg-emerald-50/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-800">
              <Download className="h-5 w-5 text-emerald-600" /> Exporter la Base de Données
            </CardTitle>
            <CardDescription>Téléchargez l'intégralité des élèves, inscriptions, paiements, classes et contenus au format JSON.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground">
              Recommandé une fois par semaine pour prévenir toute perte de données accidentelle.
            </p>
            <Button className="w-full bg-emerald-700 hover:bg-emerald-800 text-white" onClick={handleExportBackup} disabled={exporting}>
              <Database className="mr-2 h-4 w-4" />
              {exporting ? 'Génération en cours...' : 'Télécharger le fichier de Sauvegarde'}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-800">
              <Upload className="h-5 w-5 text-amber-600" /> Restaurer la Base de Données
            </CardTitle>
            <CardDescription>Rechargez des données depuis un fichier JSON de sauvegarde précédemment généré.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-100/60 p-2.5 rounded-md border border-amber-200">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              Action puissante : Les enregistrements existants seront mis à jour avec le contenu du fichier.
            </div>
            <label className="block w-full">
              <span className="sr-only">Choisir le fichier JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportBackup}
                disabled={importing}
                className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-amber-100 file:text-amber-800 hover:file:bg-amber-200 cursor-pointer"
              />
            </label>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
