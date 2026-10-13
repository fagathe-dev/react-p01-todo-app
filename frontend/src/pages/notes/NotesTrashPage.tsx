import {
  deleteNote,
  emptyTrash,
  fetchNotes,
  restoreNote,
} from '@/services/note.api';
import { Note } from '@/types/note.types';
import { Button } from '@/ui/components/Base/Button';
import { Icon } from '@/ui/components/Base/Icon';
import { Loading } from '@/ui/components/Feedback/Loading';
import { Text } from '@/ui/components/Typo';
import { Title } from '@/ui/components/Typo/Title';
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { NoteList } from './components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const HeaderRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing[3]};
`;

const TitleWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1]};
`;

export const NotesTrashPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    fetchNotes('trash')
      .then(setNotes)
      .finally(() => setLoading(false));
  }, []);

  const handleEmptyTrash = async () => {
    const confirmed = window.confirm(
      'Voulez-vous vraiment vider la corbeille ? Toutes les notes et leurs pièces jointes seront définitivement supprimées.'
    );
    if (!confirmed) return;

    try {
      setIsClearing(true);
      await emptyTrash();
      setNotes([]);
    } catch (err) {
      console.error(err);
      alert(
        err instanceof Error ? err.message : 'Erreur lors de la suppression.'
      );
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Container>
      <HeaderRow>
        <TitleWrapper>
          <Title as="h2">Corbeille</Title>
          <Text size="xs" color="muted">
            Les notes placées dans la corbeille sont supprimées définitivement
            après 30 jours.
          </Text>
        </TitleWrapper>

        {notes.length > 0 && (
          <Button
            type="button"
            onClick={handleEmptyTrash}
            loading={isClearing}
            style={{
              backgroundColor: '#e7000b',
              color: '#fff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Icon name="delete-forever-outline" size={16} />
            <span>Vider la corbeille</span>
          </Button>
        )}
      </HeaderRow>

      {loading ? (
        <div style={{ display: 'grid', placeItems: 'center', height: 160 }}>
          <Loading size="lg" />
        </div>
      ) : (
        <NoteList
          notes={notes}
          variant="trash"
          emptyMessage="La corbeille est vide."
          onSelect={() => {}}
          onRestore={async (id) => {
            await restoreNote(id);
            setNotes((prev) => prev.filter((n) => n.id !== id));
          }}
          onPermanentDelete={async (id) => {
            if (!window.confirm('Supprimer définitivement cette note ?'))
              return;
            await deleteNote(id, true);
            setNotes((prev) => prev.filter((n) => n.id !== id));
          }}
        />
      )}
    </Container>
  );
};
