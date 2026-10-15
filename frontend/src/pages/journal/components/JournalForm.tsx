import { fetchTags } from '@/services/tag.api';
import { Entry, EntryLocation, EntryMedia, MOOD_META, MoodEnum, UpdateEntryPayload } from '@/types/journal.types';
import { ColorEnum, Tag } from '@/types/tag.types';
import { Button } from '@/ui/components/Base/Button';
import { Icon } from '@/ui/components/Base/Icon';
import { TabContent, TabList, Tabs, TabTrigger } from '@/ui/components/Navigation';
import { convertMarkdownToHtml } from 'core-ts';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { JournalColorPicker } from './JournalColorPicker';
import * as S from './JournalForm.styles';
import { JournalLocationTrigger } from './JournalLocationTrigger';
import { JournalMediaManager, validateMediaFiles } from './JournalMediaManager';
import { JournalMoodModal } from './JournalMoodModal';
import { JournalTagPicker } from './JournalTagPicker';

interface JournalFormProps {
  initialEntry?: Entry | null;
  isEdit?: boolean;
  onSubmit: (payload: UpdateEntryPayload) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const JournalForm: React.FC<JournalFormProps> = ({
  initialEntry,
  isEdit = false,
  onSubmit,
  onCancel,
  loading,
}) => {
  const [title, setTitle] = useState(initialEntry?.title || '');
  const [content, setContent] = useState(initialEntry?.content || '');
  const [mood, setMood] = useState<MoodEnum | null>(initialEntry?.mood || null);
  const [color, setColor] = useState<ColorEnum | null>(initialEntry?.color || null);
  const [tagId, setTagId] = useState<string | null>(initialEntry?.tag?.id || null);
  const [location, setLocation] = useState<EntryLocation | null>(initialEntry?.location || null);
  const [isPinned, setIsPinned] = useState(Boolean(initialEntry?.isPinned));

  // États dédiés aux médias (uniquement en mode modification)
  const [existingMedias, setExistingMedias] = useState<EntryMedia[]>(initialEntry?.entryMedia || []);
  const [deletedMedias, setDeletedMedias] = useState<string[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [mediaErrors, setMediaErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [showMoodModal, setShowMoodModal] = useState(false);
  const [activePicker, setActivePicker] = useState<'palette' | 'tag' | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    fetchTags()
      .then(setTags)
      .catch(() => setTags([]));
  }, []);

  const handleAddFiles = useCallback((files: File[]) => {
    const { valid, errors } = validateMediaFiles(files);
    if (errors.length > 0) {
      setMediaErrors(errors);
      setTimeout(() => setMediaErrors([]), 5000);
    }
    if (valid.length > 0) {
      setPendingFiles((prev) => [...prev, ...valid]);
    }
  }, []);

  // Support du Collage (Paste) de médias directement dans le textarea en mode édition
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    if (!isEdit || !e.clipboardData?.files?.length) return;
    const files = Array.from(e.clipboardData.files);
    const hasMedia = files.some((f) => ['image/', 'video/', 'audio/'].some((t) => f.type.startsWith(t)));
    if (hasMedia) {
      e.preventDefault();
      handleAddFiles(files);
    }
  };

  const previewHtml = useMemo(() => convertMarkdownToHtml(content), [content]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      title: title.trim() || null,
      content: content.trim() || null,
      mood,
      color,
      tag: tagId,
      location,
      isPinned,
      ...(isEdit ? { medias: pendingFiles, deletedMedias } : {}),
    });
  };

  const currentMoodMeta = mood ? MOOD_META[mood] : null;

  return (
    <S.FormRoot $color={color} onSubmit={handleSubmit} onClick={() => setActivePicker(null)}>
      <S.TopBar>
        <S.TitleField placeholder="Titre (optionnel)" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button
          type="button"
          onClick={() => setIsPinned(!isPinned)}
          style={{
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            color: isPinned ? '#2563eb' : 'inherit',
          }}
          title={isPinned ? 'Détacher' : 'Épingler'}
        >
          <Icon name={isPinned ? 'pin' : 'pin-outline'} size={18} />
        </button>
      </S.TopBar>

      <Tabs defaultValue="write">
        <TabList style={{ padding: '0 20px' }}>
          <TabTrigger value="write">Écrire</TabTrigger>
          <TabTrigger value="preview">Aperçu</TabTrigger>
        </TabList>

        <TabContent value="write" style={{ paddingTop: 0 }}>
          <S.TextArea
            placeholder="Rédige tes pensées en Markdown…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onPaste={handlePaste}
          />
        </TabContent>

        <TabContent value="preview" style={{ paddingTop: 0 }}>
          <S.Preview
            dangerouslySetInnerHTML={{
              __html: previewHtml || '<p style="color:#888">Rien à prévisualiser…</p>',
            }}
          />
        </TabContent>
      </Tabs>

      {isEdit && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*,audio/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files) handleAddFiles(Array.from(e.target.files));
              e.target.value = '';
            }}
          />
          <JournalMediaManager
            existingMedias={existingMedias}
            pendingFiles={pendingFiles}
            errors={mediaErrors}
            onAddFiles={handleAddFiles}
            onRemovePending={(idx) => setPendingFiles((prev) => prev.filter((_, i) => i !== idx))}
            onRemoveExisting={(id) => {
              setExistingMedias((prev) => prev.filter((m) => m.id !== id));
              setDeletedMedias((prev) => [...prev, id]);
            }}
            onTriggerInput={() => fileInputRef.current?.click()}
          />
        </>
      )}

      <S.Toolbar>
        <S.ToolGroup>
          <S.ToolSquareBtn
            type="button"
            $active={Boolean(currentMoodMeta)}
            onClick={() => setShowMoodModal(true)}
            title={currentMoodMeta ? `Humeur : ${currentMoodMeta.label}` : 'Choisir une humeur'}
          >
            {currentMoodMeta ? (
              <span style={{ lineHeight: 1 }}>{currentMoodMeta.emoji}</span>
            ) : (
              <Icon name="emoticon-happy-outline" size={20} />
            )}
          </S.ToolSquareBtn>

          <JournalLocationTrigger value={location} onChange={setLocation} />

          <JournalTagPicker
            tags={tags}
            selectedTagId={tagId}
            onSelectTag={setTagId}
            isOpen={activePicker === 'tag'}
            onToggle={() => setActivePicker((p) => (p === 'tag' ? null : 'tag'))}
            onClose={() => setActivePicker(null)}
          />

          <JournalColorPicker
            selectedColor={color}
            onSelectColor={setColor}
            isOpen={activePicker === 'palette'}
            onToggle={() => setActivePicker((p) => (p === 'palette' ? null : 'palette'))}
            onClose={() => setActivePicker(null)}
          />

          {/* Bouton Média affiché uniquement en mode modification */}
          {isEdit && (
            <S.ToolSquareBtn
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Ajouter une image, vidéo ou audio"
            >
              <Icon name="image-outline" size={18} />
            </S.ToolSquareBtn>
          )}
        </S.ToolGroup>

        <S.ToolGroup>
          <Button variant="ghost" type="button" onClick={onCancel}>
            Annuler
          </Button>
          <Button type="submit" loading={loading}>
            {isEdit ? 'Enregistrer' : 'Créer l’entrée'}
          </Button>
        </S.ToolGroup>
      </S.Toolbar>

      {showMoodModal && <JournalMoodModal selected={mood} onSelect={setMood} onClose={() => setShowMoodModal(false)} />}
    </S.FormRoot>
  );
};
