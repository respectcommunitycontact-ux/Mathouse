'use client';

import React, { useState, useEffect } from 'react';
import { Lock, Delete, X, AlertCircle } from 'lucide-react';
import { playTapSound } from '@/lib/sound';

interface AdminPinModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  correctPin: string;
}

export const AdminPinModal: React.FC<AdminPinModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  correctPin,
}) => {
  const [pin, setPin] = useState<string>('');
  const [errorShake, setErrorShake] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setPin('');
      setErrorMessage('');
      setErrorShake(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    playTapSound();
    if (pin.length >= 4) return;
    const newPin = pin + digit;
    setPin(newPin);
    setErrorMessage('');

    // Check automatically when 4 digits entered
    if (newPin.length === 4) {
      if (newPin === correctPin) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 150);
      } else {
        setErrorShake(true);
        setErrorMessage('Code PIN incorrect (Défaut: 1234)');
        setTimeout(() => {
          setPin('');
          setErrorShake(false);
        }, 600);
      }
    }
  };

  const handleDelete = () => {
    playTapSound();
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', 'DEL'];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div
        className={`bg-[#121822] border border-[#D4AF37]/30 w-full max-w-sm rounded-3xl p-6 shadow-2xl transition-transform ${
          errorShake ? 'animate-bounce' : ''
        }`}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Accès Espace Manager</h3>
              <p className="text-xs text-slate-400">Configuration tablette sécurisée</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 text-slate-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PIN Indicators */}
        <div className="flex justify-center space-x-4 mb-6">
          {[0, 1, 2, 3].map((index) => (
            <div
              key={index}
              className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${
                pin.length > index
                  ? 'bg-[#D4AF37] border-[#D4AF37] shadow-gold-subtle scale-110'
                  : 'border-white/20 bg-[#1A2230]'
              }`}
            />
          ))}
        </div>

        {errorMessage && (
          <div className="flex items-center justify-center space-x-2 text-rose-400 text-xs mb-4 text-center">
            <AlertCircle className="w-4 h-4" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-3">
          {digits.map((item) => {
            if (item === 'DEL') {
              return (
                <button
                  key="del"
                  onClick={handleDelete}
                  className="h-16 rounded-2xl bg-[#1A2230] hover:bg-[#222C3E] active:bg-[#2D3950] text-slate-300 flex items-center justify-center font-bold text-lg transition border border-white/5"
                >
                  <Delete className="w-6 h-6" />
                </button>
              );
            }
            if (item === 'C') {
              return (
                <button
                  key="c"
                  onClick={() => {
                    playTapSound();
                    setPin('');
                  }}
                  className="h-16 rounded-2xl bg-[#1A2230]/60 hover:bg-[#1A2230] text-slate-400 flex items-center justify-center font-bold text-base transition border border-white/5"
                >
                  Effacer
                </button>
              );
            }
            return (
              <button
                key={item}
                onClick={() => handleDigit(item)}
                className="h-16 rounded-2xl bg-[#1A2230] hover:bg-[#D4AF37]/20 active:bg-[#D4AF37]/30 text-white font-mono font-bold text-2xl border border-white/10 active:border-[#D4AF37] transition flex items-center justify-center"
              >
                {item}
              </button>
            );
          })}
        </div>

        <div className="mt-4 text-center">
          <p className="text-[11px] text-slate-500 font-mono">Code par défaut : 1234</p>
        </div>
      </div>
    </div>
  );
};

export const HiddenAdminTrigger: React.FC<{ onTrigger: () => void }> = ({ onTrigger }) => {
  const [progress, setProgress] = useState(0);
  const [isPressing, setIsPressing] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const TOTAL_MS = 5000;
    const STEP_MS = 50;

    if (isPressing) {
      interval = setInterval(() => {
        setProgress((prev) => {
          const next = prev + (STEP_MS / TOTAL_MS) * 100;
          if (next >= 100) {
            clearInterval(interval);
            setIsPressing(false);
            playTapSound();
            onTrigger();
            return 0;
          }
          return next;
        });
      }, STEP_MS);
    } else {
      setProgress(0);
    }

    return () => clearInterval(interval);
  }, [isPressing, onTrigger]);

  const startPress = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    setIsPressing(true);
  };

  const endPress = (e: React.SyntheticEvent) => {
    e.stopPropagation();
    setIsPressing(false);
    setProgress(0);
  };

  return (
    <div
      onMouseDown={startPress}
      onMouseUp={endPress}
      onMouseLeave={endPress}
      onTouchStart={startPress}
      onTouchEnd={endPress}
      onTouchCancel={endPress}
      className="absolute top-0 left-0 w-24 h-24 z-40 cursor-default flex items-center justify-center select-none"
      style={{ touchAction: 'none' }}
      title="Zone secrète Admin (Appui long 5s)"
    >
      {/* Visual ring progress only when pressing */}
      {isPressing && (
        <div className="relative w-16 h-16 flex items-center justify-center animate-fade-in">
          <svg className="w-16 h-16 transform -rotate-90">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="#334155"
              strokeWidth="4"
              fill="transparent"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="#D4AF37"
              strokeWidth="4"
              fill="transparent"
              strokeDasharray={175.9}
              strokeDashoffset={175.9 - (175.9 * progress) / 100}
              className="transition-all duration-75 ease-linear"
            />
          </svg>
          <div className="absolute text-[10px] font-bold text-[#D4AF37] font-mono">
            {Math.ceil((5000 - (progress * 50)) / 1000)}s
          </div>
        </div>
      )}
    </div>
  );
};
