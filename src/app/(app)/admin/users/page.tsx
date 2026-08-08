'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { logAuditAction } from '@/lib/audit';
import { Shield, UserPlus, Trash2, ShieldCheck, UserCheck } from 'lucide-react';

type UserRole = 'SuperAdmin' | 'Directeur' | 'Secrétaire' | 'Comptable';

type AppUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  createdAt?: any;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as AppUser[];
      setUsers(list);
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSaveUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value.trim().toLowerCase();
    const name = (form.elements.namedItem('name') as HTMLInputElement).value.trim();
    const role = (form.elements.namedItem('role') as HTMLInputElement).value as UserRole;
    const phone = (form.elements.namedItem('phone') as HTMLInputElement).value.trim();

    if (!email || !name || !role) {
      toast({ title: 'Erreur', description: 'Veuillez remplir tous les champs obligatoires.', variant: 'destructive' });
      return;
    }

    try {
      const docId = email.replace(/[^a-zA-Z0-9]/g, '_');
      await setDoc(doc(db, 'users', docId), {
        email,
        name,
        role,
        phone: phone || '',
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
      await logAuditAction('user_role_updated', `Attribution du rôle ${role} à l'utilisateur ${email}`);
      toast({ title: 'Utilisateur enregistré', description: `Compte ${role} configuré avec succès.` });
      form.reset();
      setOpen(false);
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast({ title: 'Erreur', description: 'Impossible d’enregistrer l’utilisateur.', variant: 'destructive' });
    }
  };

  const handleDeleteUser = async (id: string, email: string) => {
    try {
      await deleteDoc(doc(db, 'users', id));
      await logAuditAction('user_role_updated', `Suppression de l'accès de ${email}`);
      toast({ title: 'Utilisateur retiré' });
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast({ title: 'Erreur', description: 'Impossible de supprimer.', variant: 'destructive' });
    }
  };

  const getRoleBadgeVariant = (role: UserRole) => {
    switch (role) {
      case 'SuperAdmin': return 'destructive';
      case 'Directeur': return 'default';
      case 'Secrétaire': return 'secondary';
      case 'Comptable': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestion des Rôles & Permissions</h1>
          <p className="text-muted-foreground">Définissez les droits d'accès pour la direction, le secrétariat et la comptabilité.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-white">
              <UserPlus className="mr-2 h-4 w-4" /> Ajouter un Utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un Accès Utilisateur</DialogTitle>
              <DialogDescription>Associez un rôle d'administration à une adresse email.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSaveUser} className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nom Complet</Label>
                <Input id="name" name="name" placeholder="Mamadou Sow" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Adresse Email</Label>
                <Input id="email" name="email" type="email" placeholder="directeur@c2iahs.com" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Numéro Téléphone</Label>
                <Input id="phone" name="phone" placeholder="+221 77 000 00 00" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Rôle / Habilitation</Label>
                <Select name="role" defaultValue="Secrétaire">
                  <SelectTrigger><SelectValue placeholder="Choisir un rôle" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SuperAdmin">Super Administrateur (Accès total)</SelectItem>
                    <SelectItem value="Directeur">Directeur (Gestion globale & validation)</SelectItem>
                    <SelectItem value="Secrétaire">Secrétaire (Inscriptions & dossiers élèves)</SelectItem>
                    <SelectItem value="Comptable">Comptable (Suivi des paiements & reçu)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-primary hover:bg-primary/90">Enregistrer</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card className="border-l-4 border-l-rose-500">
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground">SuperAdmin</div>
            <div className="text-2xl font-bold mt-1">{users.filter(u => u.role === 'SuperAdmin').length}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-emerald-600">
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground">Directeurs</div>
            <div className="text-2xl font-bold mt-1">{users.filter(u => u.role === 'Directeur').length}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-sky-500">
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground">Secrétaires</div>
            <div className="text-2xl font-bold mt-1">{users.filter(u => u.role === 'Secrétaire').length}</div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="pt-6">
            <div className="text-sm font-medium text-muted-foreground">Comptables</div>
            <div className="text-2xl font-bold mt-1">{users.filter(u => u.role === 'Comptable').length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" /> Utilisateurs Habilités
          </CardTitle>
          <CardDescription>Liste des comptes disposant d'un accès au logiciel de gestion.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Téléphone</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">Chargement...</TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                    Aucun utilisateur enregistré dans la base des rôles.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-semibold">{user.name}</TableCell>
                    <TableCell className="font-mono text-sm">{user.email}</TableCell>
                    <TableCell>{user.phone || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)}>{user.role}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => handleDeleteUser(user.id, user.email)}>
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
