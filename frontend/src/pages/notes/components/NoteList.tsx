import { Note } from '@/types/note.types';
import { Text } from '@/ui/components/Typo/Text';
import React from 'react';
import styled from 'styled-components';
import { NoteCard } from './NoteCard';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing[3]};
`;

export const NoteList: React.FC<{
  notes: Note[];
  variant?: 'open' | 'archived' | 'trash';
  emptyMessage?: string;
  onSelect: (note: Note) => void;
  onTogglePin?: (note: Note) => void;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => void;
  onDelete?: (id: string) => void;
  onPermanentDelete?: (id: string) => void;
}> = ({
  notes,
  variant = 'open',
  emptyMessage = 'Aucune note disponible.',
  onSelect,
  onTogglePin,
  onArchive,
  onRestore,
  onDelete,
  onPermanentDelete,
}) => {
  if (notes.length === 0) {
    return (
      <Text size="xs" color="muted" style={{ fontStyle: 'italic' }}>
        {emptyMessage}
      </Text>
    );
  }

  return (
    <Grid>
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          variant={variant}
          onSelect={onSelect}
          onTogglePin={onTogglePin}
          onArchive={onArchive}
          onRestore={onRestore}
          onDelete={onDelete}
          onPermanentDelete={onPermanentDelete}
        />
      ))}
    </Grid>
  );
};
