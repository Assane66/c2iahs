'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { collection, getDocs, addDoc, query, orderBy, limit } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { logAuditAction } from '@/lib/audit';
import { exportJsonToExcel } from '@/lib/export';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle2, Download, FileSpreadsheet, Loader2, Upload } from 'lucide-react';

type ClassInfo = {
  id: string;
  name: string;
};

type ParsedStudent = {
  firstName: string;
  lastName: string;
  className: string;
  dob: string;
  pob: string;
  sex: 'Masculin' | 'Féminin';
  address: string;
  parentPhone: string;
  registrationDate: string;
  generatedMatricule: string;
  numericId: number;
  isMatriculeAuto: boolean;
};

type StudentImportDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  classes: ClassInfo[];
  onImportSuccess: () => void;
};

export function StudentImportDialog({ open, onOpenChange, classes, onImportSuccess }: StudentImportDialogProps) {
  const [parsedStudents, setParsedStudents] = useState<ParsedStudent[]>([]);
  const [fileName, setFileName] = useState<string>('');
  const [isReading, setIsReading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        Matricule: '',
        Prénom: 'Alhassane',
        Nom: 'Ba',
        Classe: 'CM2',
        DateDeNaiss: '2002-05-19',
        LieuDeNaiss: 'TIVAOUANE PEULH',
        Sexe: 'Masculin',
        Adresse: 'TIVAOUANE PEULH',
        TelephonePa: '770000000',
        DateInscriptio: '2026-08-10',
      },
    ];

    exportJsonToExcel(templateData, 'Élèves', 'modele-import-eleves.xlsx');
    toast({
      title: 'Modèle téléchargé',
      description: 'Le fichier modèle avec l’exemple unique de Alhassane Ba a été enregistré.',
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsReading(true);

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array', cellDates: true });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const rawData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

      if (!rawData || rawData.length === 0) {
        toast({
          title: 'Fichier vide',
          description: 'Aucune donnée trouvée dans le fichier sélectionné.',
          variant: 'destructive',
        });
        setParsedStudents([]);
        setIsReading(false);
        return;
      }

      // Fetch current max numericId from Firestore
      const lastStudentQuery = query(collection(db, 'students'), orderBy('numericId', 'desc'), limit(1));
      const lastStudentSnap = await getDocs(lastStudentQuery);
      let currentMaxId = 0;
      if (!lastStudentSnap.empty) {
        currentMaxId = lastStudentSnap.docs[0].data().numericId || 0;
      }

      const currentYear = new Date().getFullYear();
      const yearPrefix = `ELV${currentYear}`;
      let runningId = currentMaxId;

      const formattedList: ParsedStudent[] = [];

      for (let i = 0; i < rawData.length; i++) {
        const row = rawData[i];

        // Normalize keys
        const getVal = (...keys: string[]) => {
          for (const k of Object.keys(row)) {
            const cleanKey = k.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            for (const searchKey of keys) {
              if (cleanKey === searchKey.toLowerCase()) {
                return String(row[k] || '').trim();
              }
            }
          }
          return '';
        };

        const rawFirstName = getVal('prenom', 'firstname', 'first_name');
        const rawLastName = getVal('nom', 'lastname', 'last_name');

        // Skip rows without name or surname
        if (!rawFirstName && !rawLastName) continue;

        const rawClass = getVal('classe', 'class', 'classid', 'nomclasse');
        const rawDob = getVal('datedenaiss', 'datedenaissance', 'datenaiss', 'dob', 'date_naiss');
        const rawPob = getVal('lieudenaiss', 'lieudenaissance', 'lieunaiss', 'pob', 'lieu_naiss');
        const rawSex = getVal('sexe', 'sex', 'gender');
        const rawAddress = getVal('adresse', 'address');
        const rawPhone = getVal('telephonepa', 'telephoneparent', 'telephone', 'tel', 'parentphone', 'telparent');
        const rawRegDate = getVal('dateinscriptio', 'dateinscription', 'registrationdate', 'date_inscription');
        const rawMatricule = getVal('matricule');

        // Determine sex
        let cleanSex: 'Masculin' | 'Féminin' = 'Masculin';
        if (rawSex.toLowerCase().startsWith('f') || rawSex.toLowerCase().includes('fem')) {
          cleanSex = 'Féminin';
        }

        // Format dates
        const formatDate = (val: any) => {
          if (!val) return '';
          if (val instanceof Date) {
            return val.toISOString().split('T')[0];
          }
          const str = String(val).trim();
          if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
          // Handles DD/MM/YYYY
          if (/^\d{1,2}[\/-]\d{1,2}[\/-]\d{4}$/.test(str)) {
            const parts = str.split(/[\/-]/);
            return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
          return str;
        };

        let assignedMatricule = '';
        let assignedNumericId = 0;
        let isMatriculeAuto = false;

        if (rawMatricule) {
          assignedMatricule = rawMatricule;
          // Extract numbers if present
          const matchNum = rawMatricule.match(/\d+/);
          assignedNumericId = matchNum ? parseInt(matchNum[0], 10) : runningId + 1;
        } else {
          runningId += 1;
          assignedNumericId = runningId;
          assignedMatricule = `${yearPrefix}-${String(runningId).padStart(3, '0')}`;
          isMatriculeAuto = true;
        }

        formattedList.push({
          firstName: rawFirstName,
          lastName: rawLastName,
          className: rawClass || 'Non attribuée',
          dob: formatDate(rawDob) || new Date().toISOString().split('T')[0],
          pob: rawPob || 'N/A',
          sex: cleanSex,
          address: rawAddress || '',
          parentPhone: rawPhone || '',
          registrationDate: formatDate(rawRegDate) || new Date().toISOString().split('T')[0],
          generatedMatricule: assignedMatricule,
          numericId: assignedNumericId,
          isMatriculeAuto,
        });
      }

      setParsedStudents(formattedList);
      if (formattedList.length === 0) {
        toast({
          title: 'Aucun élève trouvé',
          description: 'Vérifiez les noms de colonnes dans votre fichier (Prénom, Nom, Classe, etc.).',
          variant: 'destructive',
        });
      } else {
        toast({
          title: `${formattedList.length} élève(s) lue(s)`,
          description: 'Vérifiez la liste et les matricules auto-générés avant d’enregistrer.',
        });
      }
    } catch (error) {
      console.error('Erreur lecture fichier Excel:', error);
      toast({
        title: 'Erreur de lecture',
        description: 'Impossible de lire le fichier Excel / CSV. Assurez-vous qu’il s’agit d’un fichier valide.',
        variant: 'destructive',
      });
    } finally {
      setIsReading(false);
    }
  };

  const handleConfirmImport = async () => {
    if (parsedStudents.length === 0) return;

    setIsImporting(true);
    try {
      // Build a map of existing classes name -> id
      const existingClassesMap = new Map<string, string>();
      classes.forEach((c) => existingClassesMap.set(c.name.trim().toLowerCase(), c.id));

      // Import each student
      let importedCount = 0;

      for (const st of parsedStudents) {
        let targetClassId = existingClassesMap.get(st.className.trim().toLowerCase());

        // If class does not exist yet in DB, create it automatically
        if (!targetClassId && st.className && st.className !== 'Non attribuée') {
          const newClassRef = await addDoc(collection(db, 'classes'), {
            name: st.className.trim(),
            createdAt: new Date().toISOString(),
          });
          targetClassId = newClassRef.id;
          existingClassesMap.set(st.className.trim().toLowerCase(), targetClassId);
        }

        await addDoc(collection(db, 'students'), {
          firstName: st.firstName,
          lastName: st.lastName,
          classId: targetClassId || '',
          dob: st.dob,
          pob: st.pob,
          sex: st.sex,
          address: st.address,
          parentPhone: st.parentPhone,
          registrationDate: st.registrationDate,
          matricule: st.generatedMatricule,
          numericId: st.numericId,
        });

        importedCount++;
      }

      await logAuditAction(
        'student_created',
        `Importation Excel de ${importedCount} élève(s) avec génération automatique de matricules`
      );

      toast({
        title: 'Importation réussie !',
        description: `${importedCount} élève(s) ont été importé(s) avec succès.`,
      });

      onImportSuccess();
      onOpenChange(false);
      setParsedStudents([]);
      setFileName('');
    } catch (error) {
      console.error('Erreur importation élèves:', error);
      toast({
        title: 'Erreur lors de l’importation',
        description: 'Une erreur s’est produite lors de l’enregistrement en base de données.',
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-gray-800">
            <FileSpreadsheet className="h-6 w-6 text-emerald-600" />
            Importer des Élèves via Excel / CSV
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Sélectionnez un fichier Excel. Les <strong>matricules seront générés automatiquement</strong> si la colonne est vide ou absente.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2 overflow-y-auto pr-1">
          {/* Top Actions: Template & File Upload */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1">1. Fichier Modèle</p>
              <p className="text-[11px] text-slate-500 mb-2">
                Téléchargez notre modèle Excel prétraité sans matricule à remplir.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs border-emerald-600 text-emerald-800 hover:bg-emerald-50 h-8"
                onClick={handleDownloadTemplate}
              >
                <Download className="mr-1.5 h-3.5 w-3.5 text-emerald-700" />
                Télécharger le Modèle Excel
              </Button>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-700 mb-1">2. Sélectionner votre fichier</p>
              <label className="block w-full">
                <input
                  type="file"
                  accept=".xlsx, .xls, .csv"
                  onChange={handleFileSelect}
                  disabled={isReading || isImporting}
                  className="block w-full text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                />
              </label>
              {fileName && (
                <p className="text-[11px] text-emerald-700 font-medium mt-1 truncate">
                  Fichier sélectionné : {fileName}
                </p>
              )}
            </div>
          </div>

          {/* Loading state */}
          {isReading && (
            <div className="flex items-center justify-center py-8 gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
              Lecture et génération automatique des matricules en cours...
            </div>
          )}

          {/* Preview Table */}
          {!isReading && parsedStudents.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  Aperçu des données à importer ({parsedStudents.length} élèves) :
                </p>
                <span className="text-[11px] text-muted-foreground">
                  * Les matricules surlignés en vert ont été générés automatiquement.
                </span>
              </div>

              <div className="border rounded-md max-h-64 overflow-y-auto">
                <Table>
                  <TableHeader className="bg-slate-50 sticky top-0 z-10">
                    <TableRow>
                      <TableHead className="text-[11px] py-2">Matricule</TableHead>
                      <TableHead className="text-[11px] py-2">Nom & Prénom</TableHead>
                      <TableHead className="text-[11px] py-2">Classe</TableHead>
                      <TableHead className="text-[11px] py-2">Naissance</TableHead>
                      <TableHead className="text-[11px] py-2">Sexe</TableHead>
                      <TableHead className="text-[11px] py-2">Tél Parent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedStudents.map((st, idx) => (
                      <TableRow key={idx} className="hover:bg-slate-50/70 text-xs">
                        <TableCell className="py-1.5 font-mono font-bold">
                          <span
                            className={
                              st.isMatriculeAuto
                                ? 'bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded border border-emerald-300'
                                : 'text-slate-800'
                            }
                          >
                            {st.generatedMatricule}
                          </span>
                        </TableCell>
                        <TableCell className="py-1.5 font-semibold text-slate-800">
                          {st.firstName} {st.lastName}
                        </TableCell>
                        <TableCell className="py-1.5 text-slate-600">{st.className}</TableCell>
                        <TableCell className="py-1.5 text-slate-500">{st.dob}</TableCell>
                        <TableCell className="py-1.5 text-slate-600">{st.sex}</TableCell>
                        <TableCell className="py-1.5 text-slate-600">{st.parentPhone || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2 pt-2 border-t mt-auto">
          <Button
            type="button"
            variant="ghost"
            className="text-xs"
            onClick={() => onOpenChange(false)}
            disabled={isImporting}
          >
            Annuler
          </Button>
          <Button
            type="button"
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs"
            onClick={handleConfirmImport}
            disabled={parsedStudents.length === 0 || isImporting}
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importation en cours...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Confirmer et Importer ({parsedStudents.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
