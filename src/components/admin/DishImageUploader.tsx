'use client';

import React, { useState, useRef } from 'react';
import { 
  Upload, 
  Link as LinkIcon, 
  Image as ImageIcon, 
  Trash2, 
  Check, 
  Sparkles,
  Camera,
  AlertCircle
} from 'lucide-react';
import { playTapSound } from '@/lib/sound';

interface DishImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
}

// Preset luxury culinary photos for quick selection if needed
const PRESET_SAMPLE_IMAGES = [
  { name: 'Filet Rossini', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Pavé de Saumon', url: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Salade Gourmande', url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80' },
  { name: 'Fondant Chocolat', url: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=80' },
];

export const DishImageUploader: React.FC<DishImageUploaderProps> = ({ value, onChange }) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isDataUrl = value?.startsWith('data:image/');

  const handleFileProcess = (file: File) => {
    setUploadError(null);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Veuillez sélectionner un fichier image valide (JPG, PNG, WEBP, GIF).');
      return;
    }

    // Validate file size (max 8MB for data URL storage efficiency)
    if (file.size > 8 * 1024 * 1024) {
      setUploadError('L\'image est trop lourde (max 8 Mo). Choisissez une image plus petite.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        playTapSound();
        setFileName(file.name);
        onChange(result);
      }
    };
    reader.onerror = () => {
      setUploadError('Erreur lors de la lecture du fichier.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileProcess(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileProcess(files[0]);
    }
  };

  const handleRemoveImage = () => {
    playTapSound();
    onChange('');
    setFileName(null);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-slate-300 font-semibold text-xs flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Illustration visuelle du plat</span>
        </label>
        
        {value && (
          <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold bg-[#D4AF37]/15 text-[#E5C158] border border-[#D4AF37]/30 flex items-center gap-1">
            <Check className="w-3 h-3 text-emerald-400" />
            {isDataUrl ? 'Fichier local chargé' : 'Image URL configurée'}
          </span>
        )}
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex bg-[#0B0E14] p-1 rounded-xl border border-white/10 gap-1">
        <button
          type="button"
          onClick={() => {
            playTapSound();
            setActiveTab('upload');
          }}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            activeTab === 'upload'
              ? 'bg-[#D4AF37] text-[#0B0E14] font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Téléverser une photo</span>
        </button>

        <button
          type="button"
          onClick={() => {
            playTapSound();
            setActiveTab('url');
          }}
          className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            activeTab === 'url'
              ? 'bg-[#D4AF37] text-[#0B0E14] font-black shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Lien Web / URL</span>
        </button>
      </div>

      {/* Main Preview & Input Container */}
      <div className="bg-[#0B0E14] border border-white/10 rounded-2xl p-3.5 space-y-3">
        {/* TAB 1: FILE UPLOAD ZONE */}
        {activeTab === 'upload' && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileInputChange}
              className="hidden"
              id="dish-photo-file-input"
            />

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => {
                playTapSound();
                fileInputRef.current?.click();
              }}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
                isDragging
                  ? 'border-[#D4AF37] bg-[#D4AF37]/10 scale-[1.01]'
                  : 'border-white/15 hover:border-[#D4AF37]/60 bg-white/[0.02] hover:bg-white/[0.04]'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#E5C158] shadow-inner">
                <Upload className="w-5 h-5" />
              </div>

              <div>
                <p className="text-xs font-bold text-white">
                  Cliquez pour choisir une photo ou glissez-déposez
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 font-light">
                  Formats supportés : PNG, JPG, WEBP (Max 8 Mo)
                </p>
              </div>

              <button
                type="button"
                className="mt-1 px-3 py-1.5 rounded-lg bg-[#D4AF37]/20 hover:bg-[#D4AF37]/30 text-[#E5C158] text-[11px] font-bold border border-[#D4AF37]/40 transition"
              >
                Parcourir mes fichiers...
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: URL INPUT FIELD */}
        {activeTab === 'url' && (
          <div className="space-y-2">
            <div className="relative">
              <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="url"
                placeholder="https://images.unsplash.com/photo-..."
                value={value}
                onChange={(e) => {
                  setFileName(null);
                  onChange(e.target.value);
                }}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#121722] border border-white/15 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#D4AF37] transition"
              />
            </div>

            {/* Quick Presets */}
            <div>
              <p className="text-[10px] text-slate-400 font-semibold mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                <span>Exemples d'images haute définition (Unsplash Gastronomie) :</span>
              </p>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_SAMPLE_IMAGES.map((sample) => (
                  <button
                    key={sample.name}
                    type="button"
                    onClick={() => {
                      playTapSound();
                      setFileName(null);
                      onChange(sample.url);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border transition ${
                      value === sample.url
                        ? 'bg-[#D4AF37]/20 text-[#E5C158] border-[#D4AF37]/50 font-bold'
                        : 'bg-white/5 text-slate-300 border-white/10 hover:border-white/25 hover:text-white'
                    }`}
                  >
                    {sample.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {uploadError && (
          <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* LIVE PREVIEW BOX */}
        {value ? (
          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-16 h-16 rounded-xl bg-cover bg-center shrink-0 bg-[#121722] border-2 border-[#D4AF37]/50 shadow-lg relative overflow-hidden flex items-center justify-center"
                style={{ backgroundImage: `url(${value})` }}
              >
                {!value && <ImageIcon className="w-6 h-6 text-slate-600" />}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {fileName ? fileName : isDataUrl ? 'Photo importée de l\'appareil' : 'Image Web distante'}
                </p>
                <p className="text-[10px] text-slate-400 font-mono truncate max-w-xs mt-0.5">
                  {isDataUrl ? 'Format: Base64 / Local' : value}
                </p>
                <span className="inline-block mt-1 text-[9px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                  Aperçu en direct ok
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemoveImage}
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition text-xs flex items-center gap-1.5 shrink-0 active:scale-95"
              title="Supprimer cette photo"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Effacer</span>
            </button>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-center text-slate-400 text-[11px] flex items-center justify-center gap-2">
            <ImageIcon className="w-4 h-4 text-slate-500" />
            <span>Aucune photo sélectionnée (Une icône par défaut sera affichée).</span>
          </div>
        )}
      </div>
    </div>
  );
};
