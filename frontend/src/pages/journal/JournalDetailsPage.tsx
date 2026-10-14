import { useJournalAutoLock } from '@/hooks/useJournalAutoLock';
import { deleteEntry, fetchEntryById } from '@/services/journal.api';
import { useJournalStore } from '@/stores/journal.store';
import { Entry, EntryMedia, MOOD_META } from '@/types/journal.types';
import { Button } from '@/ui/components/Base/Button';
import { Icon } from '@/ui/components/Base/Icon';
import { Loading } from '@/ui/components/Feedback/Loading';
import { Breadcrumb } from '@/ui/components/Navigation/Breadcrumb';
import { Text } from '@/ui/components/Typo/Text';
import { Title } from '@/ui/components/Typo/Title';
import { convertMarkdownToHtml } from 'core-ts';
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { JournalLockScreen } from './components';

const PageWrap = styled.article`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 980px;
  width: 100%;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 0;
  border-top: 1px solid ${({ theme }) => theme.colors.border.default};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border.default};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.muted};
`;

const MediaGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const MediaBox = styled.div`
  aspect-ratio: 4 / 3;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;

  img,
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

export const JournalDetailsPage: React.FC = () => {
  const isUnlocked = useJournalStore((state) => state.isUnlocked);
  useJournalAutoLock();

  const { journalId } = useParams<{ journalId: string }>();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!journalId || journalId === 'undefined') {
      setError('Identifiant invalide.');
      setLoading(false);
      return;
    }
    if (!isUnlocked) return;

    setLoading(true);
    fetchEntryById(journalId)
      .then(setEntry)
      .catch((err) => setError(err instanceof Error ? err.message : 'Introuvable'))
      .finally(() => setLoading(false));
  }, [journalId, isUnlocked]);

  const html = useMemo(() => (entry?.content ? convertMarkdownToHtml(entry.content) : ''), [entry?.content]);

  const handleDelete = async () => {
    if (!journalId || !window.confirm('Supprimer définitivement cette entrée ?')) return;
    await deleteEntry(journalId);
    navigate('/journal');
  };

  if (!isUnlocked) return <JournalLockScreen />;
  if (loading) return <Loading size="lg" />;
  if (error || !entry) return <Text>{error || 'Entrée introuvable'}</Text>;

  const moodMeta = entry.mood ? MOOD_META[entry.mood] : null;
  const medias = entry.entryMedia || [];

  const renderMedia = (m: EntryMedia) => {
    if (m.mimeType.startsWith('image/')) {
      return <img src={m.filePath} alt={m.originalName} />;
    }
    if (m.mimeType.startsWith('video/')) {
      return <video src={m.filePath} controls />;
    }
    return <audio src={m.filePath} controls />;
  };

  return (
    <PageWrap>
      <Breadcrumb
        items={[
          { label: 'Mon Journal', to: '/journal', icon: 'notebook-outline' },
          { label: entry.title || 'Entrée sans titre', active: true },
        ]}
      />
      <TopBar>
        <div>
          <Text size="xs" color="muted" weight="semibold" style={{ textTransform: 'uppercase', letterSpacing: 0.6 }}>
            {new Date(entry.created_at).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
          <Title as="h2" style={{ marginTop: 4 }}>
            {entry.title || 'Entrée sans titre'}
          </Title>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <Button variant="outline" onClick={() => navigate(`/journal/${entry.id}/edit`)} title="Modifier">
            <Icon name="pencil" size={16} />
          </Button>
          <Button variant="ghost" style={{ color: '#e7000b' }} onClick={handleDelete} title="Supprimer">
            <Icon name="trash-can-outline" size={16} />
          </Button>
        </div>
      </TopBar>

      {(moodMeta || entry.location || entry.tag) && (
        <MetaRow>
          {moodMeta && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 16 }}>{moodMeta.emoji}</span>
              <span>{moodMeta.label}</span>
            </span>
          )}
          {entry.location && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Icon name="map-marker-outline" size={15} />
              <span>{entry.location.name}</span>
            </span>
          )}
        </MetaRow>
      )}
      
      {html && <div dangerouslySetInnerHTML={{ __html: html }} style={{ fontSize: 15, lineHeight: 1.6 }} />}

      {medias.length > 0 && (
        <MediaGrid>
          {medias.map((m) => (
            <MediaBox key={m.id}>{renderMedia(m)}</MediaBox>
          ))}
        </MediaGrid>
      )}
    </PageWrap>
  );
};
