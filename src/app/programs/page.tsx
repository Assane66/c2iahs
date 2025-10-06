
'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Award, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut"
    }
  },
};

export default function ProgramsPage() {
  return (
    <motion.section
      id="programs"
      className="w-full py-12 md:py-24 lg:py-32"
      initial="hidden"
      animate="visible"
      variants={sectionVariants}
    >
      <div className="container mx-auto px-4 md:px-6 text-center">
        <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-gray-800">Nos Programmes</h2>
        <div className="mt-12 grid sm:grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader className="items-center">
              <BookOpen className="h-12 w-12 text-primary mb-4" />
              <CardTitle>L'Arabe et le Coran</CardTitle>
              <CardDescription>Mémorisation du Coran, études arabes approfondies.</CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="items-center">
              <Award className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Système Français</CardTitle>
              <CardDescription>De la maternelle au lycée, suivant le programme national.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </motion.section>
  );
}

    