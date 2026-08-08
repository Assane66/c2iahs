'use client';

import React, { useState, useEffect } from 'react';
import { Upload, X, Loader2, AlertCircle } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

type ImageUploaderProps = {
  value: string[];
  onChange: (urls: string[]) => void;
  multiple?: boolean;
  maxFiles?: number;
};

/**
 * Compress an image file using HTML Canvas to keep it small enough for Firestore fallback
 */
async function compressImage(file: File, maxWidth = 800, quality = 0.65): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject('Canvas error'); return; }
        ctx.drawImage(img, 0, 0, width, height);

        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = () => reject('Image load error');
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject('File read error');
    reader.readAsDataURL(file);
  });
}

export function CloudinaryImageUpload({
  value = [],
  onChange,
  multiple = false,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [cloudName, setCloudName] = useState('dm6yuokre');
  const [uploadPreset, setUploadPreset] = useState('c2iahs_uploads');
  const [cloudinaryWarning, setCloudinaryWarning] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'siteSettings', 'main');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.cloudinaryCloudName) setCloudName(data.cloudinaryCloudName);
          if (data.cloudinaryUploadPreset) setUploadPreset(data.cloudinaryUploadPreset);
        }
      } catch (e) {
        console.error('Erreur chargement config Cloudinary:', e);
      }
    };
    fetchSettings();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setCloudinaryWarning(null);
    const newUrls: string[] = [...value];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let uploadedToCloudinary = false;

      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);

        const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: 'POST',
          body: formData,
        });

        if (res.ok) {
          const data = await res.json();
          newUrls.push(data.secure_url);
          uploadedToCloudinary = true;
        } else {
          const errData = await res.json().catch(() => ({}));
          console.warn('Cloudinary upload status:', res.status, errData);
          setCloudinaryWarning(
            `Cloudinary: Le preset "${uploadPreset}" est manquant sur votre compte. Image enregistrée temporairement. Allez dans Paramètres Site > Cloudinary pour le configurer.`
          );
        }
      } catch (err) {
        console.error('Erreur Cloudinary:', err);
      }

      // If Cloudinary upload didn't succeed, compress image as fallback so image is never lost
      if (!uploadedToCloudinary) {
        try {
          const compressed = await compressImage(file);
          newUrls.push(compressed);
        } catch (err) {
          console.error('Erreur compression image:', err);
        }
      }

      if (!multiple) break;
    }

    onChange(multiple ? newUrls : [newUrls[newUrls.length - 1]]);
    setUploading(false);
    e.target.value = '';
  };

  const handleRemove = (indexToRemove: number) => {
    onChange(value.filter((_, idx) => idx !== indexToRemove));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3 items-center">
        {value.map((url, idx) => (
          <div key={idx} className="relative group w-24 h-24 rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
            <img src={url} alt={`Upload ${idx+1}`} className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(idx)}
              className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 opacity-90 group-hover:opacity-100 transition-opacity hover:bg-rose-700 shadow-md"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        <label className="flex flex-col items-center justify-center w-24 h-24 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-emerald-600 hover:bg-emerald-50/50 transition-colors bg-white">
          {uploading ? (
            <Loader2 className="h-6 w-6 text-emerald-600 animate-spin" />
          ) : (
            <>
              <Upload className="h-5 w-5 text-slate-500 mb-1" />
              <span className="text-[10px] font-semibold text-slate-600">Ajouter photo</span>
            </>
          )}
          <input
            type="file"
            accept="image/*"
            multiple={multiple}
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      <p className="text-[11px] text-muted-foreground">
        {multiple ? 'Ajoutez autant de photos que vous le souhaitez (JPG, PNG, WebP)' : 'Sélectionnez une photo (JPG, PNG, WebP)'}
      </p>
    </div>
  );
}
