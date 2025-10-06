
import { GraduationCap, BookOpen, ArrowLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';

export default function ProgramsPage() {
  return (
    <div className="bg-background text-foreground min-h-screen">
      <header className="bg-card shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 lg:px-6">
          <div className="flex items-center justify-between h-20">
            <Link href="/" className="flex items-center" prefetch={false}>
              <Image src="https://res.cloudinary.com/dm6yuokre/image/upload/v1759771147/IMG-20250924-WA0009_3_efzfrh.jpg" alt="Logo" width={48} height={48} />
              <span className="ml-3 text-xl font-bold">Centre Islamique Imam Al Housseynou Sow</span>
            </Link>
            <Button asChild variant="outline">
              <Link href="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour à l'accueil
              </Link>
            </Button>
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 md:px-6 py-12 md:py-24">
        <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-primary mb-4">Nos Programmes</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Nous offrons un enseignement bilingue de qualité qui prépare nos élèves à un avenir brillant, enraciné dans des valeurs solides.
            </p>
        </div>
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="text-center p-6 transform hover:scale-105 transition-transform duration-300">
                <CardHeader className="items-center">
                    <GraduationCap className="size-16 text-primary"/>
                    <CardTitle className="mt-4 text-2xl font-bold">Le Français</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600">
                        Notre cursus suit le programme officiel du Sénégal, de la classe de CI au CM2. Nous mettons l'accent sur un enseignement moderne et des méthodes pédagogiques innovantes pour garantir une maîtrise parfaite de la langue française.
                    </p>
                </CardContent>
            </Card>
             <Card className="text-center p-6 transform hover:scale-105 transition-transform duration-300">
                <CardHeader className="items-center">
                    <BookOpen className="size-16 text-primary"/>
                    <CardTitle className="mt-4 text-2xl font-bold">L'Arabe et le Coran</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-gray-600">
                        Nous offrons un programme intensif d'enseignement de la langue arabe et de mémorisation du Saint Coran. Notre objectif est de permettre à chaque enfant de devenir un mémorisateur du Coran (Hafiz) tout en comprenant ses enseignements.
                    </p>
                </CardContent>
            </Card>
        </div>
      </main>

      <footer className="bg-gray-800 text-gray-300 py-12 mt-16">
        <div className="container mx-auto px-4 md:px-6 text-center text-xs">
            <p>&copy; {new Date().getFullYear()} Centre Islamique Imam Al Housseynou Sow. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}

    