import { useJournalAutoLock } from '@/hooks/useJournalAutoLock';
import { fetchEntries, updateEntry } from '@/services/journal.api';
import { useJournalStore } from '@/stores/journal.store';
import { Entry } from '@/types/journal.types';
import { Button } from '@/ui/components/Base/Button';
import { Loading } from '@/ui/components/Feedback/Loading';
import { Title } from '@/ui/components/Typo/Title';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { JournalCard, JournalLockScreen } from './components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Grid = styled.div`
  columns: 3 320px;
  column-gap: 16px;
  width: 100%;

  @media (max-width: 1024px) {
    columns: 2 280px;
  }

  @media (max-width: 640px) {
    columns: 1;
  }
`;

export const JournalsPage: React.FC = () => {
  const isUnlocked = useJournalStore((state) => state.isUnlocked);
  useJournalAutoLock();

  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      setLoading(true);
      setEntries(await fetchEntries());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isUnlocked) {
      loadData();
    }
  }, [isUnlocked]);

  const { pinned, others } = useMemo(
    () => ({
      pinned: entries.filter((e) => e.isPinned),
      others: entries.filter((e) => !e.isPinned),
    }),
    [entries]
  );

  const handleTogglePin = async (entry: Entry) => {
    const next = !entry.isPinned;
    setEntries((prev) => prev.map((e) => (e.id === entry.id ? { ...e, isPinned: next } : e)));
    await updateEntry(entry.id, { isPinned: next });
  };

  if (!isUnlocked) {
    return <JournalLockScreen onSuccess={loadData} />;
  }

  return (
    <Container>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title as="h2">Mon Journal intime</Title>
        <Button onClick={() => navigate('/journal/new')}>Nouvelle entrée</Button>
      </div>

      {loading ? (
        <Loading size="lg" />
      ) : (
        <>
          {pinned.length > 0 && (
            <div>
              <Title as="h4" style={{ marginBottom: 12 }}>
                Épinglées
              </Title>
              <Grid>
                {pinned.map((e) => (
                  <JournalCard key={e.id} entry={e} onTogglePin={handleTogglePin} />
                ))}
              </Grid>
            </div>
          )}

          <div>
            {pinned.length > 0 && (
              <Title as="h4" style={{ marginBottom: 12 }}>
                Autres entrées
              </Title>
            )}
            <Grid>
              {others.map((e) => (
                <JournalCard key={e.id} entry={e} onTogglePin={handleTogglePin} />
              ))}
            </Grid>
          </div>
        </>
      )}
    </Container>
  );
};
