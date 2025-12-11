import { useState } from 'react';
import { API_BASE_URL } from '@/utils/config';

export function useAddJournalEntry() {
  const [loading, setLoading] = useState(false);

  async function addEntry(phase: number, content: string) {
    setLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      throw new Error('Du må være logget inn for å lagre i dagboken.');
    }

    try {
      const res = await fetch(`${API_BASE_URL}/journal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phase, content }),
      });

      if (!res.ok) {
        const message =
          res.status === 401
            ? 'Økten er utløpt. Logg inn på nytt.'
            : 'Kunne ikke lagre journalinnlegg';
        throw new Error(message);
      }
    } finally {
      setLoading(false);
    }
  }

  return { addEntry, loading };
}
