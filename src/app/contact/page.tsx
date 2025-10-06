
'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Phone, Mail, MapPin } from 'lucide-react';
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

export default function ContactPage() {
  return (
    <div className="w-full py-12 md:py-24 lg:py-32">
      <motion.div 
        className="container mx-auto px-4 md:px-6"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-gray-800">Contactez-nous</h1>
          <p className="mt-4 text-lg text-gray-600">Nous sommes là pour répondre à toutes vos questions.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          <Card>
            <CardHeader>
              <CardTitle>Nos Coordonnées</CardTitle>
              <CardDescription>N'hésitez pas à nous appeler, nous envoyer un e-mail ou nous rendre visite.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                    <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Téléphone</h3>
                  <p className="text-muted-foreground">+221 78 430 30 18</p>
                  <p className="text-muted-foreground">+221 78 163 52 09</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                    <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Email</h3>
                  <p className="text-muted-foreground">c2iahs@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-full">
                    <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Adresse</h3>
                  <p className="text-muted-foreground">Tivaouane Peulh, Quartier Bayal Ba, Dakar, Sénégal</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="rounded-lg overflow-hidden h-96 md:h-full">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3857.264585141071!2d-17.26527298515712!3d14.811198989670054!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xec1a3b8d3b8f8a7%3A0x6b8f3b8d3b8f8a7!2sTivaouane%20Peulh-Niaga!5e0!3m2!1sfr!2ssn!4v1678886400000!5m2!1sfr!2ssn"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Carte de localisation"
            ></iframe>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
