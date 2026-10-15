import { updateJournalPasscode } from '@/services/auth.api';
import { useAuthStore } from '@/stores/auth.store';
import { useJournalStore } from '@/stores/journal.store';
import { Button } from '@/ui/components/Base/Button';
import { Text } from '@/ui/components/Typo/Text';
import { Title } from '@/ui/components/Typo/Title';
import React, { useState } from 'react';
import * as S from './ProfileForms.styles';

export const ChangeJournalPasscodeForm: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const lockJournal = useJournalStore((state) => state.lock);

  const hasPasscode = Boolean(user?.hasJournalPasscode);

  const [currentPasscode, setCurrentPasscode] = useState('');
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passcode !== confirmPasscode) {
      setFeedback({
        type: 'error',
        message: 'Les nouveaux codes secrets ne correspondent pas.',
      });
      return;
    }

    try {
      setLoading(true);
      setFeedback(null);

      const res = await updateJournalPasscode({
        currentPasscode: hasPasscode ? currentPasscode : undefined,
        passcode,
      });

      setUser(res.user);
      lockJournal();

      setFeedback({
        type: 'success',
        message: res.message || 'Code secret du journal mis à jour avec succès.',
      });
      setCurrentPasscode('');
      setPasscode('');
      setConfirmPasscode('');
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Erreur lors de la mise à jour du code secret.',
      });
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled = !passcode || !confirmPasscode || passcode.length < 4 || (hasPasscode && !currentPasscode);

  return (
    <S.FormCard onSubmit={handleSubmit}>
      <div>
        <Title as="h4" style={{ margin: 0 }}>
          Code secret du Journal intime
        </Title>
        <Text size="xs" color="muted" style={{ marginTop: 4 }}>
          {hasPasscode
            ? 'Modifiez le code secret (4 à 8 caractères) protégeant l’accès à votre journal.'
            : 'Configurez un code secret (4 à 8 caractères) pour verrouiller l’accès à votre journal intime.'}
        </Text>
      </div>

      {feedback && <S.FeedbackMsg $type={feedback.type}>{feedback.message}</S.FeedbackMsg>}

      {hasPasscode && (
        <S.FieldGroup>
          <S.Label htmlFor="current-journal-passcode">Code secret actuel</S.Label>
          <S.Input
            id="current-journal-passcode"
            type="password"
            value={currentPasscode}
            onChange={(e) => setCurrentPasscode(e.target.value)}
            maxLength={8}
            placeholder="••••"
            required
          />
        </S.FieldGroup>
      )}

      <S.FieldGrid>
        <S.FieldGroup>
          <S.Label htmlFor="new-journal-passcode">Nouveau code secret</S.Label>
          <S.Input
            id="new-journal-passcode"
            type="password"
            value={passcode}
            onChange={(e) => setPasscode(e.target.value)}
            minLength={4}
            maxLength={8}
            placeholder="4 à 8 caractères"
            required
          />
        </S.FieldGroup>

        <S.FieldGroup>
          <S.Label htmlFor="confirm-journal-passcode">Confirmer le code secret</S.Label>
          <S.Input
            id="confirm-journal-passcode"
            type="password"
            value={confirmPasscode}
            onChange={(e) => setConfirmPasscode(e.target.value)}
            minLength={4}
            maxLength={8}
            placeholder="••••"
            required
          />
        </S.FieldGroup>
      </S.FieldGrid>

      <S.ActionsRow>
        <Button type="submit" loading={loading} disabled={isSubmitDisabled}>
          {hasPasscode ? 'Modifier le code secret' : 'Activer le code secret'}
        </Button>
      </S.ActionsRow>
    </S.FormCard>
  );
};
