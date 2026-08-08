'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { logAuditAction } from '@/lib/audit';
import { Calendar, PlusCircle, CheckCircle2, Trash2, UserCheck, Users, ArrowRight, Loader2 } from 'lucide-react';

type AcademicYear = {
  id: string;
  year: string;
  isCurrent: boolean;
  startDate?: string;
  endDate?: string;
};

type Student = {
  id: string;
  matricule: string;
  firstName: string;
  lastName: string;
  classId: string;
  academicYearId?: string;
};

type ClassItem = {
  id: string;
  name: string;
};

export default function AcademicYearsPage() {
  const [years, setYears] = useState<AcademicYear[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAddYear, setOpenAddYear] = useState(false);
  
  // Re-enrollment state
  const [openPromoteModal, setOpenPromoteModal] = useState(false);
  const [targetYearId, setTargetYearId] = useState<string>('');
  const [targetClassId, setTargetClassId] = useState<string>('same');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [promoting, setPromoting] = useState(false);
  const { toast } = useToast();

  const fetchYearsAndStudents = async () => {
    setLoading(true);
    try {
      const yearsSnap = await getDocs(query(collection(db, 'academicYears'), orderBy('year', 'desc')));
      const yearsList = yearsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as AcademicYear[];
      setYears(yearsList);

      const studentsSnap = await getDocs(collection(db, 'students'));
      const studentsList = studentsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Student[];
      setStudents(studentsList);

      const classesSnap = await getDocs(collection(db, 'classes'));
      const classesList = classesSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as ClassItem[];
      setClasses(classesList);
    } catch (error) {
      console.error('Erreur chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchYearsAndStudents();
  }, []);

  const handleAddYear = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const year = (form.elements.namedItem('year') as HTMLInputElement).value.trim();
    const startDate = (form.elements.namedItem('startDate') as HTMLInputElement).value;
    const endDate = (form.elements.namedItem('endDate') as HTMLInputElement).value;

    if (!year) return;

    try {
      const isFirst = years.length === 0;
      await addDoc(collection(db, 'academicYears'), {
        year,
        startDate: startDate || null,
        endDate: endDate || null,
        isCurrent: isFirst,
        createdAt: serverTimestamp(),
      });
      await logAuditAction('settings_updated', `Ajout de l'année scolaire ${year}`);
      toast({ title: 'Année scolaire ajoutée', description: `L'année ${year} a bien été enregistrée.` });
      form.reset();
      setOpenAddYear(false);
      fetchYearsAndStudents();
    } catch (error) {
      console.error(error);
      toast({ title: 'Erreur', description: 'Impossible d’ajouter l’année.', variant: 'destructive' });
    }
  };

  const handleSetCurrent = async (id: string, yearName: string) => {
    try {
      for (const y of years) {
        if (y.isCurrent) {
          await updateDoc(doc(db, 'academicYears', y.id), { isCurrent: false });
        }
      }
      await updateDoc(doc(db, 'academicYears', id), { isCurrent: true });
      await logAuditAction('settings_updated', `Année scolaire en cours définie sur ${yearName}`);
      toast({ title: 'Année active mise à jour', description: `${yearName} est maintenant l’année en cours.` });
      fetchYearsAndStudents();
    } catch (error) {
      console.error(error);
      toast({ title: 'Erreur', description: 'Impossible de modifier l’année active.', variant: 'destructive' });
    }
  };

  const handleDeleteYear = async (id: string, yearName: string) => {
    try {
      await deleteDoc(doc(db, 'academicYears', id));
      await logAuditAction('settings_updated', `Suppression de l'année scolaire ${yearName}`);
      toast({ title: 'Année supprimée' });
      fetchYearsAndStudents();
    } catch (error) {
      console.error(error);
      toast({ title: 'Erreur', description: 'Impossible de supprimer.', variant: 'destructive' });
    }
  };

  // Select all students toggle
  const handleToggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudentIds(students.map((s) => s.id));
    } else {
      setSelectedStudentIds([]);
    }
  };

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  // Bulk Re-enrollment process
  const handleBulkReenroll = async () => {
    if (!targetYearId) {
      toast({ title: 'Année requise', description: 'Veuillez sélectionner l’année cible.', variant: 'destructive' });
      return;
    }
    if (selectedStudentIds.length === 0) {
      toast({ title: 'Élèves requis', description: 'Sélectionnez au moins un élève à réinscrire.', variant: 'destructive' });
      return;
    }

    setPromoting(true);
    try {
      const batch = writeBatch(db);
      const targetYearObj = years.find((y) => y.id === targetYearId);

      for (const sId of selectedStudentIds) {
        const studentRef = doc(db, 'students', sId);
        const updatePayload: any = {
          academicYearId: targetYearId,
          academicYearName: targetYearObj?.year || '',
          updatedAt: serverTimestamp(),
        };

        if (targetClassId !== 'same') {
          updatePayload.classId = targetClassId;
        }

        batch.update(studentRef, updatePayload);
      }

      await batch.commit();
      await logAuditAction('settings_updated', `Réinscription en masse de ${selectedStudentIds.length} élève(s) pour l'année ${targetYearObj?.year}`);
      
      toast({
        title: 'Réinscription réussie !',
        description: `${selectedStudentIds.length} élève(s) sont maintenant réinscrits pour l'année ${targetYearObj?.year}.`,
      });

      setOpenPromoteModal(false);
      setSelectedStudentIds([]);
      fetchYearsAndStudents();
    } catch (error) {
      console.error('Erreur réinscription:', error);
      toast({ title: 'Erreur', description: 'Impossible de procéder à la réinscription.', variant: 'destructive' });
    } finally {
      setPromoting(false);
    }
  };

  const getClassName = (classId?: string) => {
    return classes.find((c) => c.id === classId)?.name || 'N/A';
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Années Scolaires &amp; Réinscriptions</h1>
          <p className="text-muted-foreground">Définissez l&apos;année active et passez les élèves d&apos;une année à l&apos;autre en 1 clic.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Re-enrollment Action Button */}
          <Dialog open={openPromoteModal} onOpenChange={setOpenPromoteModal}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-emerald-600 text-emerald-800 hover:bg-emerald-50 font-semibold">
                <UserCheck className="mr-2 h-4 w-4 text-emerald-600" /> Réinscription / Passage d&apos;Année
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-emerald-600" /> Réinscription &amp; Passage en Masse des Élèves
                </DialogTitle>
                <DialogDescription>
                  Sélectionnez les élèves de l&apos;année précédente et basculez-les dans la nouvelle année scolaire sans ressaisir leurs données.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">Année Scolaire Cible *</Label>
                    <Select value={targetYearId} onValueChange={setTargetYearId}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Sélectionner l'année" />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((y) => (
                          <SelectItem key={y.id} value={y.id}>
                            {y.year} {y.isCurrent ? '(Active)' : ''}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">Nouvelle Classe (Optionnel)</Label>
                    <Select value={targetClassId} onValueChange={setTargetClassId}>
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Conserver classe actuelle" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="same">Conserver la même classe</SelectItem>
                        {classes.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-bold">Sélectionner les Élèves ({selectedStudentIds.length} sélectionné(s))</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleSelectAll(selectedStudentIds.length !== students.length)}
                      className="text-xs text-emerald-700"
                    >
                      {selectedStudentIds.length === students.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                    </Button>
                  </div>

                  <div className="border rounded-2xl max-h-[300px] overflow-y-auto divide-y">
                    {students.length === 0 ? (
                      <div className="p-6 text-center text-slate-500 text-xs">Aucun élève enregistré.</div>
                    ) : (
                      students.map((s) => (
                        <label
                          key={s.id}
                          className="flex items-center justify-between p-3 hover:bg-slate-50 cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <Checkbox
                              checked={selectedStudentIds.includes(s.id)}
                              onCheckedChange={() => handleToggleStudent(s.id)}
                            />
                            <div>
                              <div className="font-bold text-slate-900">{s.firstName} {s.lastName}</div>
                              <div className="text-[10px] text-slate-500 font-mono">Matricule : {s.matricule}</div>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[10px]">
                            {getClassName(s.classId)}
                          </Badge>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button
                  onClick={handleBulkReenroll}
                  disabled={promoting || selectedStudentIds.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
                >
                  {promoting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enregistrement...
                    </>
                  ) : (
                    <>
                      <UserCheck className="mr-2 h-4 w-4" /> Valider la Réinscription ({selectedStudentIds.length})
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Create New Year Button */}
          <Dialog open={openAddYear} onOpenChange={setOpenAddYear}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white">
                <PlusCircle className="mr-2 h-4 w-4" /> Nouvelle Année
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter une Année Scolaire</DialogTitle>
                <DialogDescription>Format recommandé : 2026-2027</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddYear} className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="year">Libellé (ex: 2026-2027)</Label>
                  <Input id="year" name="year" placeholder="2026-2027" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="startDate">Date Début</Label>
                    <Input id="startDate" name="startDate" type="date" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="endDate">Date Fin</Label>
                    <Input id="endDate" name="endDate" type="date" />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="bg-primary hover:bg-primary/90">Créer</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Main Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> Liste des Années Scolaires
          </CardTitle>
          <CardDescription>
            L&apos;année active est appliquée par défaut pour toutes les nouvelles inscriptions et recherches.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Année Scolaire</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Période</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-slate-500">Chargement...</TableCell>
                </TableRow>
              ) : years.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                    Aucune année scolaire créée. Ajoutez 2026-2027 pour commencer.
                  </TableCell>
                </TableRow>
              ) : (
                years.map((y) => (
                  <TableRow key={y.id}>
                    <TableCell className="font-bold text-base">{y.year}</TableCell>
                    <TableCell>
                      {y.isCurrent ? (
                        <Badge className="bg-emerald-600 text-white hover:bg-emerald-700">En cours (Active)</Badge>
                      ) : (
                        <Badge variant="outline">Archivée</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {y.startDate && y.endDate ? `${y.startDate} → ${y.endDate}` : 'Non spécifiée'}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {!y.isCurrent && (
                        <Button size="sm" variant="outline" onClick={() => handleSetCurrent(y.id, y.year)}>
                          <CheckCircle2 className="mr-1.5 h-4 w-4 text-emerald-600" /> Définir comme active
                        </Button>
                      )}
                      <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteYear(y.id, y.year)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
