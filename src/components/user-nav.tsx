'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { LogOut, User } from 'lucide-react';

type UserRole = 'SuperAdmin' | 'Directeur' | 'Secrétaire' | 'Comptable';

type UserProfile = {
  name: string;
  email: string;
  role: UserRole;
};

export function UserNav() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setProfile(null);
        return;
      }

      try {
        const email = firebaseUser.email?.toLowerCase() || '';
        const docId = email.replace(/[^a-zA-Z0-9]/g, '_');

        // Try to fetch profile by doc ID (email-based)
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('email', '==', email));
        const snap = await getDocs(q);

        if (!snap.empty) {
          const data = snap.docs[0].data();
          setProfile({
            name: data.name || firebaseUser.displayName || email,
            email: data.email || email,
            role: data.role || 'Secrétaire',
          });
        } else {
          // Fallback: just use the Firebase Auth email
          setProfile({
            name: firebaseUser.displayName || email,
            email,
            role: 'Secrétaire',
          });
        }
      } catch (err) {
        console.error('Erreur chargement profil:', err);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (err) {
      console.error('Erreur déconnexion:', err);
    }
  };

  const getRoleBadgeColor = (role?: UserRole) => {
    switch (role) {
      case 'SuperAdmin': return 'destructive';
      case 'Directeur': return 'default';
      case 'Secrétaire': return 'secondary';
      case 'Comptable': return 'outline';
      default: return 'outline';
    }
  };

  const initials = profile?.name
    ? profile.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9 border-2 border-emerald-500/40">
            <AvatarFallback className="bg-emerald-900 text-emerald-200 text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold leading-none truncate">
                {profile?.name || 'Administrateur'}
              </p>
              {profile?.role && (
                <Badge variant={getRoleBadgeColor(profile.role)} className="text-[10px] shrink-0">
                  {profile.role}
                </Badge>
              )}
            </div>
            <p className="text-xs leading-none text-muted-foreground truncate">
              {profile?.email || '...'}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem disabled>
            <User className="mr-2 h-4 w-4" />
            Mon Profil
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Se déconnecter
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
