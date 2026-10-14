import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 20px;
  border-top: 1px dashed ${({ theme }) => theme.colors.border.default};
`;

export const DropZone = styled.div<{ $isDragOver: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border: 1px dashed
    ${({ $isDragOver, theme }) => ($isDragOver ? theme.colors.primary.base : theme.colors.border.default)};
  border-radius: 8px;
  background-color: ${({ $isDragOver }) => ($isDragOver ? 'rgba(37, 99, 235, 0.05)' : 'rgba(0, 0, 0, 0.015)')};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.muted};
  cursor: pointer;
  transition: all 0.15s ease;
`;

export const PreviewsGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

export const MediaItem = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px 6px 6px;
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.background.surface};
  max-width: 220px;
`;

export const ThumbImg = styled.img`
  width: 38px;
  height: 38px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
`;

export const IconBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 6px;
  background-color: rgba(0, 0, 0, 0.05);
  flex-shrink: 0;
`;

export const MediaInfo = styled.div`
  display: flex;
  flex-direction: column;
  overflow: hidden;
  font-size: 11px;

  span:first-child {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  span:last-child {
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

export const RemoveBtn = styled.button`
  border: none;
  background: none;
  color: #e7000b;
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
`;

export const ErrorAlert = styled.div`
  font-size: 12px;
  color: #dc2626;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  padding: 6px 10px;
  border-radius: 6px;
`;
