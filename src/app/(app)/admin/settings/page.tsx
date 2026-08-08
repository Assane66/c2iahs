'use client';

import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { logAuditAction } from '@/lib/audit';
import { Building2, Save, Globe, Phone, Mail, MapPin, MessageSquare, Share2 } from 'lucide-react';

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    schoolName: 'Centre Islamique Institut Al Housseynou Sow',
    shortName: 'C2IAHS',
    address: 'Tivaouane Peulh, QRT Bayal Ba',
    phone1: '+221 78 163 52 09',
    phone2: '+221 75 336 25 39',
    whatsappNumber: '221781635209',
    email: 'c2iahs@gmail.com',
    logoUrl: 'https://res.cloudinary.com/dm6yuokre/image/upload/v1762822007/IMG-20250924-WA0009_1_psprih.jpg',
    heroSubtitle: 'Une éducation islamique moderne, structurée et bienveillante pour vos enfants.',
    facebookUrl: '#',
    instagramUrl: '#',
    twitterUrl: '#',
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'siteSettings', 'main');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData((prev) => ({ ...prev, ...docSnap.data() }));
        }
      } catch (error) {
        console.error('Erreur chargement paramètres:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'siteSettings', 'main'), {
        ...formData,
        updatedAt: serverTimestamp(),
      });
      await logAuditAction('settings_updated', 'Mise à jour des informations générales de l’établissement');
      toast({
        title: 'Paramètres enregistrés',
        description: 'Les informations du site ont été mises à jour avec succès.',
      });
    } catch (error) {
      console.error('Erreur sauvegarde:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder les modifications.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Chargement des paramètres...</div>;
  }

  return (
    <div className="flex flex-col gap-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres du Site & Établissement</h1>
        <p className="text-muted-foreground">Gérez l'ensemble des informations de contact et d'affichage visibles sur le site public.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" /> Informations Générales
            </CardTitle>
            <CardDescription>Nom de l'école, sous-titre et logo principal.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="schoolName">Nom Officiel de l'Établissement</Label>
              <Input id="schoolName" name="schoolName" value={formData.schoolName} onChange={handleChange} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="shortName">Nom Court / Sigle</Label>
              <Input id="shortName" name="shortName" value={formData.shortName} onChange={handleChange} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="logoUrl">URL du Logo (Cloudinary / Image URL)</Label>
              <Input id="logoUrl" name="logoUrl" value={formData.logoUrl} onChange={handleChange} required />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="heroSubtitle">Phrase de Présentation (Page d'accueil)</Label>
              <Textarea id="heroSubtitle" name="heroSubtitle" value={formData.heroSubtitle} onChange={handleChange} rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-primary" /> Coordonnées & Contacts
            </CardTitle>
            <CardDescription>Téléphones, WhatsApp et Adresse de l'établissement.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="phone1">Téléphone Principal</Label>
              <Input id="phone1" name="phone1" value={formData.phone1} onChange={handleChange} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone2">Téléphone Secondaire</Label>
              <Input id="phone2" name="phone2" value={formData.phone2} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="whatsappNumber">Numéro WhatsApp (sans + ni espaces, ex: 221781635209)</Label>
              <Input id="whatsappNumber" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleChange} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Adresse Email Officielle</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="address">Adresse Physique</Label>
              <Input id="address" name="address" value={formData.address} onChange={handleChange} required />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" /> Réseaux Sociaux
            </CardTitle>
            <CardDescription>Liens vers vos pages officielles.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div className="grid gap-2">
              <Label htmlFor="facebookUrl">Page Facebook</Label>
              <Input id="facebookUrl" name="facebookUrl" value={formData.facebookUrl} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="instagramUrl">Compte Instagram</Label>
              <Input id="instagramUrl" name="instagramUrl" value={formData.instagramUrl} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="twitterUrl">Compte X (Twitter)</Label>
              <Input id="twitterUrl" name="twitterUrl" value={formData.twitterUrl} onChange={handleChange} />
            </div>
          </CardContent>
        </Card>



        <div className="flex justify-end">
          <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90 text-white min-w-[200px]" disabled={saving}>
            <Save className="mr-2 h-5 w-5" /> {saving ? 'Sauvegarde...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </div>
  );
}
