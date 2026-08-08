'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Phone, Mail, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';

const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
};

export default function ContactPage() {
  return (
    <div className="w-full py-12 md:py-20 bg-slate-50/50">
      <motion.div 
        className="container mx-auto px-4 md:px-6"
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
      >
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100/80 px-3 py-1 rounded-full">
            Localisation & Contacts
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mt-3">Contactez-nous</h1>
          <p className="mt-2 text-sm text-slate-600">Nous sommes à votre disposition pour toute information ou visite du centre.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 items-stretch">
          <Card className="shadow-sm border-slate-200 flex flex-col justify-between">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-slate-900">Nos Coordonnées</CardTitle>
              <CardDescription className="text-xs">N'hésitez pas à nous contacter directement ou nous rendre visite sur place.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 text-sm py-4">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
                  <Phone className="h-6 w-6 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Téléphone</h3>
                  <p className="text-slate-600 text-xs mt-0.5">+221 75 336 25 39</p>
                  <p className="text-slate-600 text-xs">+221 78 163 52 09</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20">
                  <Mail className="h-6 w-6 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Adresse Email</h3>
                  <p className="text-slate-600 text-xs mt-0.5 font-medium">c2iahs@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/20 mt-1">
                  <MapPin className="h-6 w-6 text-emerald-700" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Emplacement Exact</h3>
                  <p className="text-emerald-800 font-bold text-xs mt-0.5">Centre islamique Imam Alhousseynou Sow</p>
                  <p className="text-slate-600 text-xs">Tivaouane Peulh, Quartier Bayal Ba, Dakar, Sénégal</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Real Google Maps Embed */}
          <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200 min-h-[400px] w-full bg-slate-100">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d241.0831759427286!2d-17.282506387371075!3d14.806680150937696!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xec1a18fcbe6c387%3A0x91e2fc2f1dadd024!2sCentre%20islamique%20Imam%20Alhousseynou%20Sow!5e0!3m2!1sfr!2ssn!4v1786222641363!5m2!1sfr!2ssn"
              width="100%"
              height="100%"
              style={{ border: 0, minHeight: '400px' }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title="Localisation Google Maps - Centre islamique Imam Alhousseynou Sow"
            ></iframe>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
