
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ArrowRight, BookOpen, GraduationCap, Users, Phone, MapPin, Mail, BookCopy } from 'lucide-react';
import { placeholderImages } from '@/lib/placeholder-images';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="px-4 lg:px-6 h-14 flex items-center bg-background/80 backdrop-blur-sm sticky top-0 z-50 border-b">
        <Link href="#" className="flex items-center justify-center" prefetch={false}>
          <BookCopy className="h-6 w-6" />
          <span className="sr-only">Institut Imame Al Housseynou Sow</span>
        </Link>
         <h1 className="ml-4 text-lg font-semibold">Institut Imame Al Housseynou Sow</h1>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            href="/login"
            className="text-sm font-medium hover:underline underline-offset-4"
            prefetch={false}
          >
            Connexion Admin
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Bienvenue à l'Institut Imame Al Housseynou Sow
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Un lieu d'excellence pour l'éducation, la foi et la communauté.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="#contact" passHref>
                    <Button>Nous Contacter</Button>
                  </Link>
                </div>
              </div>
               <Carousel className="w-full max-w-xl mx-auto">
                <CarouselContent>
                  {placeholderImages.map((img, index) => (
                    <CarouselItem key={index}>
                      <div className="p-1">
                        <Card>
                          <CardContent className="flex aspect-video items-center justify-center p-0 overflow-hidden rounded-lg">
                            <Image
                              src={img.imageUrl}
                              alt={img.description}
                              width={600}
                              height={400}
                              className="w-full h-full object-cover"
                              data-ai-hint={img.imageHint}
                            />
                          </CardContent>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2" />
                <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2" />
              </Carousel>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Nos Programmes</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Nous offrons une éducation complète qui nourrit l'esprit, le corps et l'âme.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3 lg:max-w-none mt-12">
              <Card>
                <CardHeader>
                    <div className="flex items-center justify-center bg-primary rounded-md w-12 h-12 mb-4">
                        <BookOpen className="h-6 w-6 text-primary-foreground" />
                    </div>
                  <CardTitle>Programme Académique</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Un curriculum rigoureux aligné sur les normes nationales, préparant les élèves à un avenir brillant.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                    <div className="flex items-center justify-center bg-primary rounded-md w-12 h-12 mb-4">
                         <GraduationCap className="h-6 w-6 text-primary-foreground" />
                    </div>
                  <CardTitle>Enseignement Religieux</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Des cours approfondis sur les valeurs et les enseignements islamiques pour guider nos élèves.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                    <div className="flex items-center justify-center bg-primary rounded-md w-12 h-12 mb-4">
                         <Users className="h-6 w-6 text-primary-foreground" />
                    </div>
                  <CardTitle>Activités Parascolaires</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Développement des talents à travers le sport, les arts et les clubs pour un épanouissement complet.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        
        <section id="contact" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Contactez-Nous</h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Nous sommes là pour répondre à toutes vos questions.
              </p>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-6">
                <div className="flex items-center gap-2">
                    <Phone className="h-5 w-5 text-primary" />
                    <span>78 451 36 33</span>
                </div>
                 <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-primary" />
                    <span>Tivaouane Peulh, QRT Bayal Ba</span>
                </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
        <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Institut Imame Al Housseynou Sow. Tous droits réservés.</p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Termes & Conditions
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4" prefetch={false}>
            Politique de confidentialité
          </Link>
        </nav>
      </footer>
    </div>
  );
}
