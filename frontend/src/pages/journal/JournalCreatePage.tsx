import { useJournalAutoLock } from '@/hooks/useJournalAutoLock';
import { createEntry } from '@/services/journal.api';
import { useJournalStore } from '@/stores/journal.store';
import { CreateEntryPayload } from '@/types/journal.types';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JournalForm, JournalLockScreen } from './components';
import { Breadcrumb } from '@/ui/components/Navigation/Breadcrumb';

export const JournalCreatePage: React.FC = () => {
  const isUnlocked = useJournalStore((state) => state.isUnlocked);
  useJournalAutoLock();

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleCreate = async (payload: CreateEntryPayload) => {
    try {
      setLoading(true);
      await createEntry(payload);
      navigate('/journal');
    } finally {
      setLoading(false);
    }
  };

  if (!isUnlocked) {
    return <JournalLockScreen onSuccess={() => {}} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Breadcrumb
        items={[
          { label: 'Mon Journal', to: '/journal', icon: 'notebook-outline' },
          { label: 'Nouvelle entrée', active: true },
        ]}
      />
      <JournalForm onSubmit={handleCreate} onCancel={() => navigate('/journal')} loading={loading} />
    </div>
  );
};
