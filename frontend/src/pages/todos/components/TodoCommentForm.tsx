import { Icon } from '@/ui/components/Base/Icon';
import React, { useState } from 'react';
import styled from 'styled-components';

const Form = styled.form`
  display: flex;
  gap: ${({ theme }) => theme.spacing[1.5]};
  margin-top: ${({ theme }) => theme.spacing[2]};
`;

const Input = styled.input`
  flex: 1;
  padding: ${({ theme }) => `${theme.spacing[1.5]} ${theme.spacing[2.5]}`};
  font-family: inherit;
  font-size: ${({ theme }) => theme.typography.sizes.xs};
  background-color: ${({ theme }) => theme.colors.background.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ theme }) => theme.colors.text.heading};
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary.base};
  }
`;

const SendBtn = styled.button`
  padding: ${({ theme }) => `${theme.spacing[1.5]} ${theme.spacing[2.5]}`};
  background-color: ${({ theme }) => theme.colors.primary.base};
  color: #fff;
  border: none;
  border-radius: ${({ theme }) => theme.radii.sm};
  cursor: pointer;
  display: flex;
  align-items: center;

  &:disabled {
    opacity: 0.5;
  }
`;

export const TodoCommentForm: React.FC<{
  onSubmit: (c: string) => Promise<void>;
}> = ({ onSubmit }) => {
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;
    try {
      setSubmitting(true);
      await onSubmit(content.trim());
      setContent('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <Input
        placeholder="Ajouter un commentaire…"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <SendBtn type="submit" disabled={!content.trim() || submitting}>
        <Icon name="send" size={14} />
      </SendBtn>
    </Form>
  );
};
