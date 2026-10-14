import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  width: 100%;
`;

export const Card = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }) => theme.spacing[4]};
  padding: ${({ theme }) => theme.spacing[6]};
  background-color: ${({ theme }) => theme.colors.background.surface};
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.base};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  width: 100%;
  max-width: 380px;
  text-align: center;
`;

export const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.04);
  color: ${({ theme }) => theme.colors.primary.base};
`;

export const PinInput = styled.input`
  width: 180px;
  font-size: 24px;
  letter-spacing: 12px;
  text-align: center;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border.default};
  border-radius: ${({ theme }) => theme.radii.base};
  background-color: ${({ theme }) => theme.colors.background.body};
  color: ${({ theme }) => theme.colors.text.heading};
  outline: none;

  &:focus {
    border-color: ${({ theme }) => theme.colors.primary.base};
  }
`;
