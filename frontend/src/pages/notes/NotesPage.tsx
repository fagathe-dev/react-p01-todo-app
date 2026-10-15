import { createNote, deleteNote, fetchNotes, updateNote } from '@/services/note.api';
import { CreateNotePayload, Note } from '@/types/note.types';
import { Button } from '@/ui/components/Base/Button';
import { Loading } from '@/ui/components/Feedback/Loading';
import { Text } from '@/ui/components/Typo/Text';
import { Title } from '@/ui/components/Typo/Title';
import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { NoteList, NoteModal } from './components';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[4]};
`;

const SectionTitle = styled(Text)`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.muted};
  letter-spacing: 0.5px;
  margin-bottom: ${({ theme }) => theme.spacing[2]};
`;

export const NotesPage: React.FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setNotes(await fetchNotes('open'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const { pinned, others } = useMemo(
    () => ({
      pinned: notes.filter((n) => n.is_pinned),
      others: notes.filter((n) => !n.is_pinned),
    }),
    [notes]
  );

  console.log(pinned);

  // Quick Action : épingler sans formulaire
  const handleTogglePin = async (note: Note) => {
    const nextPinned = !note.is_pinned;
    setNotes((prev) => prev.map((n) => (n.id === note.id ? { ...n, is_pinned: nextPinned } : n)));
    try {
      await updateNote(note.id, { is_pinned: nextPinned });
    } catch {
      setNotes((prev) => prev.map((n) => (n.id === note.id ? { ...n, is_pinned: note.is_pinned } : n)));
    }
  };

  const handleSaveModal = async (payload: CreateNotePayload) => {
    if (editingNote) {
      const updated = await updateNote(editingNote.id, payload);
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    } else {
      const created = await createNote(payload);
      setNotes((prev) => [created, ...prev]);
    }
  };

  return (
    <Container>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Title as="h2">Notes</Title>
        <Button
          onClick={() => {
            setEditingNote(null);
            setIsModalOpen(true);
          }}
        >
          Créer une note
        </Button>
      </div>

      {loading ? (
        <Loading size="lg" />
      ) : (
        <>
          {pinned.length > 0 && (
            <div>
              <SectionTitle>Épinglées</SectionTitle>
              <NoteList
                notes={pinned}
                onSelect={(n) => {
                  setEditingNote(n);
                  setIsModalOpen(true);
                }}
                onTogglePin={handleTogglePin}
                onArchive={async (id) => {
                  await updateNote(id, { state: 'archived' });
                  setNotes((p) => p.filter((n) => n.id !== id));
                }}
                onDelete={async (id) => {
                  await deleteNote(id, false);
                  setNotes((p) => p.filter((n) => n.id !== id));
                }}
              />
            </div>
          )}

          <div>
            {pinned.length > 0 && <SectionTitle>Autres</SectionTitle>}
            <NoteList
              notes={others}
              onSelect={(n) => {
                setEditingNote(n);
                setIsModalOpen(true);
              }}
              onTogglePin={handleTogglePin}
              onArchive={async (id) => {
                await updateNote(id, { state: 'archived' });
                setNotes((p) => p.filter((n) => n.id !== id));
              }}
              onDelete={async (id) => {
                await deleteNote(id, false);
                setNotes((p) => p.filter((n) => n.id !== id));
              }}
            />
          </div>
        </>
      )}

      {isModalOpen && <NoteModal note={editingNote} onClose={() => setIsModalOpen(false)} onSubmit={handleSaveModal} />}
    </Container>
  );
};
