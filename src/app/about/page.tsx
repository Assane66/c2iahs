
'use client';

import Image from 'next/image';
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

export default function AboutPage() {
  return (
    <motion.section 
        id="about" 
        className="w-full py-12 md:py-24 lg:py-32"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-gray-800">Bienvenue au Centre Imam Al Housseynou Sow</h2>
             <p className="mt-4 text-gray-600">
              Fondé en 2021 et fort de plus de 3 ans d'expérience, notre institut se consacre à offrir une éducation islamique et académique de qualité, préparant nos élèves à devenir des leaders éclairés et des citoyens responsables.
            </p>
          </div>
          <div className="relative h-80 w-full">
            <Image
              src="https://res.cloudinary.com/dm6yuokre/image/upload/v1759775671/1759775403161_2_opz6ot.jpg"
              alt="Students eating together"
              fill
              className="rounded-xl object-cover"
              data-ai-hint="students community"
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
}

    