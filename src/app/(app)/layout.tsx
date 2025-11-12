
'use client';

import * as React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  BookCopy,
  CreditCard,
  LayoutDashboard,
  Users,
  School,
  UserX,
} from 'lucide-react';
import Image from 'next/image';

import {
  Sidebar,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarContent,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2">
              <Image src="https://res.cloudinary.com/dm6yuokre/image/upload/v1759773957/logo_iiahs_vflfla.png" alt="Logo" width={40} height={40} />
              <span className="text-lg font-semibold text-sidebar-foreground">
                Centre Islamique
              </span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Link href="/dashboard" passHref>
                  <SidebarMenuButton
                    isActive={isActive('/dashboard')}
                    tooltip="Tableau de Bord"
                  >
                    <LayoutDashboard />
                    Tableau de Bord
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/students" passHref>
                  <SidebarMenuButton
                    isActive={isActive('/students')}
                    tooltip="Élèves"
                  >
                    <Users />
                    Élèves
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <Link href="/classes" passHref>
                  <SidebarMenuButton
                    isActive={isActive('/classes')}
                    tooltip="Classes"
                  >
                    <School />
                    Classes
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <Link href="/payments" passHref>
                  <SidebarMenuButton
                    isActive={isActive('/payments')}
                    tooltip="Paiements"
                  >
                    <CreditCard />
                    Paiements
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
               <SidebarMenuItem>
                <Link href="/unpaid" passHref>
                  <SidebarMenuButton
                    isActive={isActive('/unpaid')}
                    tooltip="Non Payé"
                  >
                    <UserX />
                    Non Payé
                  </SidebarMenuButton>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            {/* You can add footer content here if needed */}
          </SidebarFooter>
        </Sidebar>
        <div className="flex flex-1 flex-col overflow-y-auto">
          <header className="flex h-14 items-center justify-end gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
            <SidebarTrigger className="md:hidden" />
            <UserNav />
          </header>
          <main className="flex-1 p-4 sm:p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
