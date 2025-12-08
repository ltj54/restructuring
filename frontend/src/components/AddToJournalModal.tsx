import React, { useState } from "react";
import { useAddJournalEntry } from "@/hooks/useAddJournalEntry";
import Card from "@/components/Card";

type AddToJournalModalProps = {
  open: boolean;
  onClose: () => void;
  defaultContent: string;
};

export default function AddToJournalModal({
  open,
  onClose,
  defaultContent,
}: AddToJournalModalProps) {
  const { addEntry, loading } = useAddJournalEntry();

  const [phase, setPhase] = useState(1);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSave() {
    setError(null);

    const content =
      defaultContent +
      (comment ? `\n\nKommentar: ${comment}` : "");

    try {
      await addEntry(phase, content);
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Kunne ikke lagre journalinnlegget.";
      setError(message);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <Card className="max-w-md w-full p-4">
        <h2 className="text-lg font-semibold mb-4">Legg til i dagbok</h2>

        <label className="block text-sm mb-3">
          Velg fase:
          <select
            className="mt-1 w-full border rounded p-2"
            value={phase}
            onChange={(e) => setPhase(Number(e.target.value))}
          >
            <option value={1}>Fase 1 – Kartlegging</option>
            <option value={2}>Fase 2 – Kompetanseløft</option>
            <option value={3}>Fase 3 – Aktiv jobbsøking</option>
            <option value={4}>Fase 4 – Ny jobb</option>
          </select>
        </label>

        <label className="block text-sm mb-3">
          Kommentar (valgfritt)
          <textarea
            className="mt-1 w-full border rounded p-2"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </label>

        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

        <div className="flex justify-end gap-3">
          <button className="px-4 py-2" onClick={onClose}>
            Avbryt
          </button>

          <button
            className="px-4 py-2 bg-emerald-700 text-white rounded-lg"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Lagrer..." : "Lagre"}
          </button>
        </div>
      </Card>
    </div>
  );
}
