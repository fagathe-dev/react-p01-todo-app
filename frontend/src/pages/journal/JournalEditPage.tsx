import { useJournalAutoLock } from '@/hooks/useJournalAutoLock';
import { fetchEntryById, updateEntry } from '@/services/journal.api';
import { useJournalStore } from '@/stores/journal.store';
import { CreateEntryPayload, Entry } from '@/types/journal.types';
import { Loading } from '@/ui/components/Feedback/Loading';
import { Breadcrumb } from '@/ui/components/Navigation/Breadcrumb';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { JournalForm, JournalLockScreen } from './components';

export const JournalEditPage: React.FC = () => {
  const isUnlocked = useJournalStore((state) => state.isUnlocked);
  useJournalAutoLock();

  const { journalId } = useParams<{ journalId: string }>();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (journalId && isUnlocked) {
      fetchEntryById(journalId)
        .then(setEntry)
        .finally(() => setLoading(false));
    }
  }, [journalId, isUnlocked]);

  const handleUpdate = async (payload: CreateEntryPayload) => {
    if (!journalId) return;
    try {
      setSaving(true);
      await updateEntry(journalId, payload);
      navigate(`/journal/${journalId}`);
    } finally {
      setSaving(false);
    }
  };

  if (!isUnlocked) {
    return <JournalLockScreen />;
  }

  if (loading) return <Loading size="lg" />;
  if (!entry) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Breadcrumb
        items={[
          { label: 'Mon Journal', to: '/journal', icon: 'notebook-outline' },
          { label: entry.title || 'Entrée sans titre', to: `/journal/${entry.id}` },
          { label: 'Modifier', active: true },
        ]}
      />
      <JournalForm
        isEdit
        initialEntry={entry}
        onSubmit={handleUpdate}
        onCancel={() => navigate(`/journal/${journalId}`)}
        loading={saving}
      />
    </div>
  );
};
