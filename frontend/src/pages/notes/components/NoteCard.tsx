// src/pages/notes/components/NoteCard.tsx
import { Note } from '@/types/note.types';
import { Icon } from '@/ui/components/Base/Icon';
import { Text } from '@/ui/components/Typo/Text';
import { convertMarkdownToHtml } from 'core-ts';
import React, { useMemo } from 'react';
import * as S from './NoteCard.styles';

const truncateWords = (text: string | null | undefined, maxWords = 100): string => {
  if (!text) return '';
  const words = text.trim().split(/\s+/);
  return words.length <= maxWords ? text : `${words.slice(0, maxWords).join(' ')}…`;
};

interface NoteCardProps {
  note: Note;
  variant?: 'open' | 'archived' | 'trash';
  onSelect: (note: Note) => void;
  onTogglePin?: (note: Note) => void;
  onArchive?: (id: string) => void;
  onRestore?: (id: string) => void;
  onDelete?: (id: string) => void;
  onPermanentDelete?: (id: string) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({
  note,
  variant = 'open',
  onSelect,
  onTogglePin,
  onArchive,
  onRestore,
  onDelete,
  onPermanentDelete,
}) => {
  const htmlContent = useMemo(() => {
    return note.content ? convertMarkdownToHtml(truncateWords(note.content, 100)) : '';
  }, [note.content]);

  return (
    <S.Card $color={note.color} onClick={() => onSelect(note)}>
      {variant === 'open' && onTogglePin && (
        <S.PinBtn
          type="button"
          $pinned={Boolean(note.is_pinned)}
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin(note);
          }}
          title={note.is_pinned ? 'Détacher la note' : 'Épingler la note'}
        >
          <Icon name={note.is_pinned ? 'pin' : 'pin-outline'} size={17} />
        </S.PinBtn>
      )}

      <div>
        {note.title && (
          <Text weight="semibold" size="sm" style={{ paddingRight: 24, marginBottom: 4 }}>
            {note.title}
          </Text>
        )}
        {htmlContent ? (
          <S.MarkdownPreview dangerouslySetInnerHTML={{ __html: htmlContent }} />
        ) : (
          <Text size="xs" color="muted" style={{ fontStyle: 'italic' }}>
            Note sans texte…
          </Text>
        )}
      </div>

      <S.Footer onClick={(e) => e.stopPropagation()}>
        {note.tag ? <S.TagBadge $color={note.tag.color}>{note.tag.name}</S.TagBadge> : <span />}
        <div style={{ display: 'flex', gap: 4 }}>
          {variant === 'open' && (
            <>
              {onArchive && (
                <button
                  type="button"
                  onClick={() => onArchive(note.id)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                >
                  <Icon name="archive-arrow-down-outline" size={15} />
                </button>
              )}
              {onDelete && (
                <button
                  type="button"
                  onClick={() => onDelete(note.id)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                >
                  <Icon name="trash-can-outline" size={15} />
                </button>
              )}
            </>
          )}
          {variant === 'archived' && onRestore && (
            <button
              type="button"
              onClick={() => onRestore(note.id)}
              style={{ border: 'none', background: 'none', cursor: 'pointer' }}
            >
              <Icon name="backup-restore" size={15} />
            </button>
          )}
          {variant === 'trash' && (
            <>
              {onRestore && (
                <button
                  type="button"
                  onClick={() => onRestore(note.id)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer' }}
                >
                  <Icon name="backup-restore" size={15} />
                </button>
              )}
              {onPermanentDelete && (
                <button
                  type="button"
                  onClick={() => onPermanentDelete(note.id)}
                  style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#e7000b' }}
                >
                  <Icon name="delete-forever-outline" size={16} />
                </button>
              )}
            </>
          )}
        </div>
      </S.Footer>
    </S.Card>
  );
};
