import { unlockJournal } from '@/services/journal.api';
import { Button } from '@/ui/components/Base/Button';
import { Icon } from '@/ui/components/Base/Icon';
import { Text } from '@/ui/components/Typo/Text';
import { Title } from '@/ui/components/Typo/Title';
import React, { useState } from 'react';
import * as S from './JournalLockScreen.styles';

export const JournalLockScreen: React.FC<{ onSuccess?: () => void }> = ({ onSuccess }) => {
  const [passcode, setPasscode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    try {
      setLoading(true);
      setError(null);
      await unlockJournal(passcode);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Code secret incorrect.');
      setPasscode('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <S.Container>
      <S.Card onSubmit={handleSubmit}>
        <S.IconWrapper>
          <Icon name="lock-outline" size={28} />
        </S.IconWrapper>

        <div>
          <Title as="h3">Journal intime protégé</Title>
          <Text size="xs" color="muted" style={{ marginTop: 4 }}>
            Saisis ton code secret pour déverrouiller tes entrées.
          </Text>
        </div>

        <S.PinInput
          type="password"
          maxLength={8}
          autoFocus
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="••••"
        />

        {error && (
          <Text size="xs" style={{ color: '#e7000b' }}>
            {error}
          </Text>
        )}

        <Button type="submit" loading={loading} disabled={!passcode.trim()} style={{ width: '100%' }}>
          Déverrouiller
        </Button>
      </S.Card>
    </S.Container>
  );
};
