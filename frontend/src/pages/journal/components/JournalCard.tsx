import { Entry, EntryMedia, MOOD_META } from '@/types/journal.types';
import { Icon } from '@/ui/components/Base/Icon';
import { Title } from '@/ui/components/Typo/Title';
import { convertMarkdownToHtml } from 'core-ts';
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as S from './JournalCard.styles';

export const JournalCard: React.FC<{
  entry: Entry;
  onTogglePin?: (entry: Entry) => void;
}> = ({ entry }) => {
  const navigate = useNavigate();

  const dateObj = new Date(entry.created_at);
  const monthStr = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
  const dayStr = dateObj.getDate();

  const medias = entry.entryMedia || [];
  const visibleMedias = medias.slice(0, 3);
  const extraCount = Math.max(0, medias.length - 3);

  const previewHtml = useMemo(() => {
    return entry.content ? convertMarkdownToHtml(entry.content.split(/\s+/).slice(0, 35).join(' ')) : '';
  }, [entry.content]);

  const moodMeta = entry.mood ? MOOD_META[entry.mood] : null;

  const locationLabel = entry.location
    ? [entry.location.city, entry.location.country].filter(Boolean).join(', ') || entry.location.name
    : null;

  const renderMedia = (media: EntryMedia) => {
    if (media.mimeType.startsWith('image/')) {
      return <img src={media.filePath} alt={media.originalName} loading="lazy" />;
    }
    if (media.mimeType.startsWith('video/')) {
      return <video src={media.filePath} muted preload="metadata" />;
    }
    return <Icon name="music-note-outline" size={28} />;
  };

  return (
    <S.Card $color={entry.color} onClick={() => navigate(`/journal/${entry.id}`)}>
      <S.Header>
        <S.HeaderLeft>
          <S.DateBlock>
            <span>{monthStr}</span>
            <span>{dayStr}</span>
          </S.DateBlock>
          {entry.title && (
            <Title as="h4" style={{ margin: 0, fontSize: 17 }}>
              {entry.title}
            </Title>
          )}
        </S.HeaderLeft>

        {moodMeta && <S.MoodBadge title={moodMeta.label}>{moodMeta.emoji}</S.MoodBadge>}
      </S.Header>

      {visibleMedias.length > 0 && (
        <S.MediaMosaic $count={visibleMedias.length}>
          {visibleMedias.map((m) => (
            <S.MediaItem key={m.id}>{renderMedia(m)}</S.MediaItem>
          ))}
        </S.MediaMosaic>
      )}

      {extraCount > 0 && (
        <S.ExtraMediaBtn>
          <Icon name="image-plus" size={16} />
          <span>
            Voir {extraCount} média{extraCount > 1 ? 's' : ''} supplémentaire
            {extraCount > 1 ? 's' : ''}
          </span>
        </S.ExtraMediaBtn>
      )}

      {previewHtml && <S.PreviewText dangerouslySetInnerHTML={{ __html: previewHtml }} />}

      {locationLabel && (
        <S.Footer>
          <S.LocationBadge title={entry.location?.name || locationLabel}>
            <Icon name="map-marker-outline" size={14} />
            <span>{locationLabel}</span>
          </S.LocationBadge>
        </S.Footer>
      )}
    </S.Card>
  );
};
