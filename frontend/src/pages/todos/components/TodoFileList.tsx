import { deleteTodoFile } from '@/services/todo.api';
import { TodoFile } from '@/types/todo.types';
import { Icon } from '@/ui/components/Base/Icon';
import { Text } from '@/ui/components/Typo/Text';
import React, { useRef } from 'react';
import styled from 'styled-components';

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing[1.5]};
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => `${theme.spacing[1.5]} ${theme.spacing[2]}`};
  background-color: ${({ theme }) => theme.colors.background.body};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.sm};
`;

const UploadBtn = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[1.5]};
  padding: ${({ theme }) => `${theme.spacing[2]} ${theme.spacing[3]}`};
  border: 1px dashed ${({ theme }) => theme.colors.border.default};
  background: transparent;
  border-radius: ${({ theme }) => theme.radii.sm};
  color: ${({ theme }) => theme.colors.text.muted};
  cursor: pointer;
  font-size: ${({ theme }) => theme.typography.sizes.xs};

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.base};
    color: ${({ theme }) => theme.colors.primary.base};
  }
`;

export const TodoFileList: React.FC<{
  todoId: string;
  files: TodoFile[];
  onUpload: (files: FileList) => void;
  onFileDeleted: (fileId: string) => void;
}> = ({ todoId, files, onUpload, onFileDeleted }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDelete = async (fileId: string) => {
    try {
      await deleteTodoFile(todoId, fileId);
      onFileDeleted(fileId);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <List>
      {files.map((file) => (
        <Item key={file.id}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflow: 'hidden',
            }}
          >
            <Icon name="file-outline" size={16} />
            <Text size="xs">{file.originalName}</Text>
          </div>
          <button
            type="button"
            onClick={() => handleDelete(file.id)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#888',
            }}
          >
            <Icon name="trash-can-outline" size={14} />
          </button>
        </Item>
      ))}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        style={{ display: 'none' }}
        onChange={(e) => e.target.files && onUpload(e.target.files)}
      />
      <UploadBtn type="button" onClick={() => fileInputRef.current?.click()}>
        <Icon name="paperclip" size={15} />
        <span>Ajouter un fichier</span>
      </UploadBtn>
    </List>
  );
};
