import { EntryMedia } from '@/types/journal.types';
import { Icon } from '@/ui/components/Base/Icon';
import { FileSizeFormatter } from 'core-ts';
import React, { useState } from 'react';
import * as S from './JournalMediaManager.styles';

const MAX_SIZE = '50M';
const ALLOWED_TYPES = ['image/', 'video/', 'audio/'];

export const validateMediaFiles = (
  files: File[]
): { valid: File[]; errors: string[] } => {
  const valid: File[] = [];
  const errors: string[] = [];

  files.forEach((file) => {
    const isValidType = ALLOWED_TYPES.some((t) => file.type.startsWith(t));
    const isValidSize = FileSizeFormatter.isValid(file.size, MAX_SIZE);

    if (!isValidType) {
      errors.push(`${file.name} : Seuls les fichiers image, vidéo et audio sont autorisés.`);
    } else if (!isValidSize) {
      errors.push(`${file.name} : Taille maximale dépassée (${MAX_SIZE}).`);
    } else {
      valid.push(file);
    }
  });

  return { valid, errors };
};

interface JournalMediaManagerProps {
  existingMedias: EntryMedia[];
  pendingFiles: File[];
  errors: string[];
  onAddFiles: (files: File[]) => void;
  onRemovePending: (index: number) => void;
  onRemoveExisting: (id: string) => void;
  onTriggerInput: () => void;
}

export const JournalMediaManager: React.FC<JournalMediaManagerProps> = ({
  existingMedias,
  pendingFiles,
  errors,
  onAddFiles,
  onRemovePending,
  onRemoveExisting,
  onTriggerInput,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer?.files?.length) {
      onAddFiles(Array.from(e.dataTransfer.files));
    }
  };

  const renderMediaIcon = (mime: string) => {
    if (mime.startsWith('video/')) return <Icon name="video-outline" size={20} />;
    return <Icon name="music-note-outline" size={20} />;
  };

  return (
    <S.Container>
      <S.DropZone
        $isDragOver={isDragOver}
        onClick={onTriggerInput}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
      >
        <Icon name="cloud-upload-outline" size={18} />
        <span>Glisse tes images, vidéos ou audios ici (max {MAX_SIZE}) ou clique pour parcourir</span>
      </S.DropZone>

      {errors.map((err, idx) => (
        <S.ErrorAlert key={idx}>{err}</S.ErrorAlert>
      ))}

      {(existingMedias.length > 0 || pendingFiles.length > 0) && (
        <S.PreviewsGrid>
          {existingMedias.map((media) => (
            <S.MediaItem key={media.id}>
              {media.mimeType.startsWith('image/') ? (
                <S.ThumbImg src={media.filePath} alt={media.originalName} />
              ) : (
                <S.IconBox>{renderMediaIcon(media.mimeType)}</S.IconBox>
              )}
              <S.MediaInfo>
                <span title={media.originalName}>{media.originalName}</span>
                <span>{FileSizeFormatter.format(media.size)}</span>
              </S.MediaInfo>
              <S.RemoveBtn
                type="button"
                onClick={() => onRemoveExisting(media.id)}
                title="Supprimer ce média"
              >
                <Icon name="close" size={15} />
              </S.RemoveBtn>
            </S.MediaItem>
          ))}

          {pendingFiles.map((file, idx) => (
            <S.MediaItem key={`${file.name}-${idx}`}>
              {file.type.startsWith('image/') ? (
                <S.ThumbImg src={URL.createObjectURL(file)} alt={file.name} />
              ) : (
                <S.IconBox>{renderMediaIcon(file.type)}</S.IconBox>
              )}
              <S.MediaInfo>
                <span title={file.name}>{file.name}</span>
                <span>{FileSizeFormatter.format(file.size)} (Nouveau)</span>
              </S.MediaInfo>
              <S.RemoveBtn
                type="button"
                onClick={() => onRemovePending(idx)}
                title="Retirer"
              >
                <Icon name="close" size={15} />
              </S.RemoveBtn>
            </S.MediaItem>
          ))}
        </S.PreviewsGrid>
      )}
    </S.Container>
  );
};