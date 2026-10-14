import { useGeolocation } from '@/hooks';
import { EntryLocation } from '@/types/journal.types';
import { Icon } from '@/ui/components/Base/Icon';
import React, { useEffect } from 'react';
import styled from 'styled-components';

const BaseBtn = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 38px;
  background-color: transparent;
  border: none;
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.text.heading};
  cursor: pointer;
  transition: background-color 0.15s ease;

  &:hover {
    background-color: rgba(0, 0, 0, 0.08);
  }

  &:disabled {
    cursor: wait;
    opacity: 0.7;
  }
`;

const SquareBtn = styled(BaseBtn)`
  width: 38px;
  padding: 0;
`;

const PillBtn = styled(BaseBtn)<{ $isError?: boolean }>`
  gap: 8px;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 500;
  color: ${({ $isError }) => ($isError ? '#dc2626' : 'inherit')};
`;

interface JournalLocationTriggerProps {
  value?: EntryLocation | null;
  onChange: (location: EntryLocation | null) => void;
}

export const JournalLocationTrigger: React.FC<JournalLocationTriggerProps> = ({ value, onChange }) => {
  const { status, location, errorMessage, requestLocation, clearLocation } = useGeolocation(value);

  useEffect(() => {
    onChange(location);
  }, [location, onChange]);

  if (status === 'idle') {
    return (
      <SquareBtn type="button" onClick={requestLocation} title="Ajouter ma position">
        <Icon name="map-marker-outline" size={18} />
      </SquareBtn>
    );
  }

  if (status === 'loading') {
    return (
      <PillBtn type="button" disabled>
        <Icon name="map-marker-outline" size={16} />
        <span>Recherche…</span>
      </PillBtn>
    );
  }

  if (status === 'error') {
    return (
      <PillBtn type="button" $isError onClick={requestLocation} title="Cliquer pour réessayer">
        <Icon name="map-marker-outline" size={16} />
        <span>{errorMessage}</span>
      </PillBtn>
    );
  }

  const displayLabel = [location?.city, location?.country].filter(Boolean).join(', ') || location?.name;

  return (
    <PillBtn type="button" onClick={clearLocation} title="Cliquer pour supprimer la localisation">
      <Icon name="map-marker-outline" size={16} />
      <span>{displayLabel}</span>
    </PillBtn>
  );
};
