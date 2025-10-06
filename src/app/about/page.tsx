
'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Award, BookOpen, Heart, Users, CheckCircle } from 'lucide-react';

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.2
    }
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function AboutPage() {
  return (
    <div className="w-full py-12 md:py-24 lg:py-28 bg-gray-50">
      <div className="container mx-auto px-4 md:px-6">

        {/* --- Header Section --- */}
        <motion.div 
            className="text-center mb-12 md:mb-16"
            initial="hidden"
            animate="visible"
            variants={sectionVariants}
        >
            <motion.h1 
                className="text-4xl md:text-5xl font-bold tracking-tighter text-gray-800"
                variants={itemVariants}
            >
                Notre Histoire, Notre Mission
            </motion.h1>
            <motion.p 
                className="mt-4 max-w-3xl mx-auto text-lg text-gray-600"
                variants={itemVariants}
            >
                Façonner l'avenir par une éducation d'excellence qui unit savoir académique et valeurs islamiques.
            </motion.p>
        </motion.div>

        {/* --- Introduction Section --- */}
        <motion.section 
            className="grid md:grid-cols-2 gap-12 items-center mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
        >
          <motion.div variants={itemVariants}>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-gray-800">Bienvenue au Centre Imam Al Housseynou Sow</h2>
             <p className="mt-4 text-gray-600 leading-relaxed">
              Fondé en 2021, notre institut est né d'une vision simple : créer un environnement où l'excellence académique et l'enseignement islamique authentique se rencontrent. En seulement quelques années, nous sommes devenus une référence, guidés par la conviction que chaque enfant mérite une éducation qui nourrit à la fois son intellect et son âme.
            </p>
             <p className="mt-4 text-gray-600 leading-relaxed">
              Nous préparons nos élèves à devenir des leaders éclairés, des penseurs critiques et des citoyens du monde responsables, fiers de leur identité et prêts à relever les défis de demain.
            </p>
          </motion.div>
          <motion.div 
            className="relative h-80 w-full lg:h-96"
            variants={itemVariants}
          >
            <Image
              src="https://res.cloudinary.com/dm6yuokre/image/upload/v1759775671/1759775403161_2_opz6ot.jpg"
              alt="Des élèves en pleine discussion dans la cour"
              fill
              className="rounded-xl object-cover shadow-lg"
              data-ai-hint="students community"
            />
          </motion.div>
        </motion.section>

        {/* --- Mission & Vision Section --- */}
        <motion.section 
            className="mb-20"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
        >
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div className="bg-white p-8 rounded-lg shadow-md" variants={itemVariants}>
              <div className="flex items-center gap-4 mb-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Notre Mission</h3>
              </div>
              <p className="text-gray-600">Offrir une éducation complète et bilingue (français-arabe) qui forme des individus intellectuellement compétents, spirituellement épanouis et socialement responsables, ancrés dans les enseignements du Coran et de la Sunna.</p>
            </motion.div>
             <motion.div className="bg-white p-8 rounded-lg shadow-md" variants={itemVariants}>
               <div className="flex items-center gap-4 mb-4">
                  <div className="bg-primary/10 p-3 rounded-full">
                    <BookOpen className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Notre Vision</h3>
              </div>
              <p className="text-gray-600">Devenir un pôle d'excellence éducative reconnu au Sénégal et à l'international, formant des générations de leaders musulmans qui contribuent positivement à la société mondiale grâce à leur savoir, leur éthique et leur foi.</p>
            </motion.div>
          </div>
        </motion.section>

        {/* --- Values Section --- */}
        <motion.section
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={sectionVariants}
        >
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-gray-800">Nos Valeurs Fondamentales</h2>
                <p className="mt-3 max-w-2xl mx-auto text-gray-600">Les piliers qui guident chacune de nos actions.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                <motion.div className="text-center p-6" variants={itemVariants}>
                    <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-gray-800 mb-2">Excellence (Ihsan)</h4>
                    <p className="text-gray-600">Nous visons l'excellence dans tous les domaines, académiques et spirituels, en encourageant chaque élève à atteindre son plein potentiel.</p>
                </motion.div>
                 <motion.div className="text-center p-6" variants={itemVariants}>
                    <Heart className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-gray-800 mb-2">Intégrité</h4>
                    <p className="text-gray-600">Nous cultivons l'honnêteté, la responsabilité et une forte éthique morale inspirée des principes islamiques.</p>
                </motion.div>
                <motion.div className="text-center p-6" variants={itemVariants}>
                    <Users className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h4 className="text-xl font-semibold text-gray-800 mb-2">Communauté</h4>
                    <p className="text-gray-600">Nous bâtissons un sentiment d'appartenance et de fraternité, où le respect mutuel et l'entraide sont primordiaux.</p>
                </motion.div>
            </div>
        </motion.section>

      </div>
    </div>
  );
}
