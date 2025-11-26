import React from 'react';
import { motion } from 'framer-motion';

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function TipsModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.18 }}
        className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl p-6 mx-4"
        role="dialog"
        aria-modal="true"
        aria-label="Tips og veiledning"
      >
        <header className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Tips for å forberede deg</h3>
            <p className="text-sm text-gray-500">En kort guide som hjelper deg å starte.</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Lukk"
            className="text-gray-500 hover:text-gray-700 text-lg leading-none"
          >
            ×
          </button>
        </header>

        <div className="mt-4 space-y-4 text-sm text-gray-700">
          <div>
            <strong>1. Sjekk økonomien</strong>
            <p className="text-gray-600">
              Lag en oversikt over faste kostnader og vurder hvor lenge buffer dekker deg.
            </p>
          </div>
          <div>
            <strong>2. Oppdater CV</strong>
            <p className="text-gray-600">
              Oppdater nøkkelkompetanse og resultater, og lag en kort pitch.
            </p>
          </div>
          <div>
            <strong>3. Nettverk</strong>
            <p className="text-gray-600">
              Kontakt folk i bransjen, delta i relevante faggrupper og vær synlig.
            </p>
          </div>
        </div>

        <footer className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="border border-slate-300 text-slate-800 px-4 py-2 rounded-xl text-sm hover:bg-slate-50 transition inline-flex items-center justify-center"
          >
            Lukk
          </button>
        </footer>
      </motion.div>
    </div>
  );
}
