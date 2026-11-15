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
        <label className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
          <Camera className="w-4 h-4 text-slate-500" />
          <span>Photo du plat</span>
        </label>
        
        {value && (
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <Check className="w-3 h-3" />
            {isDataUrl ? 'Photo importée' : 'Photo en ligne'}
          </span>
        )}
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
        <button
          type="button"
          onClick={() => {
            playTapSound();
            setActiveTab('upload');
          }}
          className={`flex-1 h-8 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            activeTab === 'upload'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
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
          className={`flex-1 h-8 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
            activeTab === 'url'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>Lien internet</span>
        </button>
      </div>

      {/* Main Preview & Input Container */}
      <div className="bg-white border border-slate-200 rounded-lg p-3.5 space-y-3">
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
                  ? 'border-[#E85D04] bg-orange-50'
                  : 'border-slate-300 hover:border-[#E85D04] bg-slate-50 hover:bg-orange-50/40'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500">
                <Upload className="w-5 h-5" />
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-800">
                  Cliquez pour choisir une photo ou glissez-déposez
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  PNG, JPG ou WEBP — 8 Mo maximum
                </p>
              </div>

              <button
                type="button"
                className="mt-1 px-3 h-8 rounded-md bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-300 transition"
              >
                Choisir un fichier
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
                className="w-full h-10 pl-10 pr-3 rounded-lg bg-white border border-slate-300 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-[#E85D04] focus:ring-2 focus:ring-[#E85D04]/20 transition"
              />
            </div>

            {/* Quick Presets */}
            <div>
              <p className="text-xs text-slate-500 font-medium mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-slate-400" />
                <span>Ou choisissez une photo d'exemple :</span>
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
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition ${
                      value === sample.url
                        ? 'bg-orange-50 text-[#C2410C] border-orange-300 font-semibold'
                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
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
          <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{uploadError}</span>
          </div>
        )}

        {/* LIVE PREVIEW BOX */}
        {value ? (
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-16 h-16 rounded-lg bg-cover bg-center shrink-0 bg-slate-100 border border-slate-200 relative overflow-hidden flex items-center justify-center"
                style={{ backgroundImage: `url(${value})` }}
              >
                {!value && <ImageIcon className="w-6 h-6 text-slate-600" />}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-800 truncate">
                  {fileName ? fileName : isDataUrl ? 'Photo importée de l\'appareil' : 'Photo depuis internet'}
                </p>
                <p className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                  {isDataUrl ? 'Format: Base64 / Local' : value}
                </p>
                <span className="hidden">
                  Aperçu en direct ok
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRemoveImage}
              className="px-3 h-9 rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-slate-300 hover:border-rose-200 transition text-sm font-medium flex items-center gap-1.5 shrink-0 active:scale-95"
              title="Supprimer cette photo"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Retirer</span>
            </button>
          </div>
        ) : (
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
            <ImageIcon className="w-4 h-4 text-slate-500" />
            <span>Aucune photo : une icône sera affichée à la place.</span>
          </div>
        )}
      </div>
    </div>
  );
};
