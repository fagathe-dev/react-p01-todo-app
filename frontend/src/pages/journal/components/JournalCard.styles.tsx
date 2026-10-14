import { tagColors } from '@/types/tag.types';
import styled from 'styled-components';

export const Card = styled.div<{ $color?: string | null }>`
  break-inside: avoid;
  page-break-inside: avoid;
  margin-bottom: 16px;
  width: 100%;
  min-height: 155px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  padding: 18px;
  background-color: ${({ $color, theme }) =>
    $color ? `${tagColors[$color as keyof typeof tagColors]}12` : theme.colors.background.surface};
  border: 1px solid
    ${({ $color, theme }) =>
      $color ? `${tagColors[$color as keyof typeof tagColors]}40` : theme.colors.border.default};
  border-radius: 16px;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${({ theme }) => theme.shadows.sm};
  }
`;

export const Header = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
`;

export const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;

  h4 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.25;
  }
`;

export const DateBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  line-height: 1.1;
  min-width: 32px;
  flex-shrink: 0;

  span:first-child {
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.text.muted};
    letter-spacing: 0.5px;
  }

  span:last-child {
    font-size: 22px;
    font-weight: 800;
    color: ${({ theme }) => theme.colors.text.heading};
  }
`;

export const MoodBadge = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background-color: ${({ theme }) => theme.colors.background.surfaceHover || '#f4f4f5'};
  font-size: 20px;
  flex-shrink: 0;
`;

export const MediaMosaic = styled.div<{ $count: number }>`
  display: grid;
  gap: 4px;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
  grid-template-columns: ${({ $count }) => ($count === 1 ? '1fr' : '1.6fr 1fr')};
  grid-template-rows: ${({ $count }) => ($count === 3 ? '1fr 1fr' : '1fr')};

  & > *:first-child {
    grid-row: ${({ $count }) => ($count === 3 ? '1 / span 2' : 'auto')};
  }
`;

export const MediaItem = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;

  img,
  video {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

export const ExtraMediaBtn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.heading};
  background-color: ${({ theme }) => theme.colors.background.surface};
`;

export const PreviewText = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.muted};
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.45;
  p {
    margin: 0;
  }
`;

export const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding-top: 8px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
`;

export const LocationBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text.muted};
  min-width: 0;

  span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;
