// components/Button.tsx
import styled, { css } from 'styled-components';
import { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  $variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  $fullWidth?: boolean;
}

export const Button = styled.button<ButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: ${({ theme }) => theme.radius?.md || '8px'};
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: all 0.2s ease;
  cursor: pointer;
  border: none;
  font-size: 1rem;
  width: ${({ $fullWidth }) => ($fullWidth ? '100%' : 'auto')};

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'primary':
        return css`
          background: ${theme.primary || '#0070f3'};
          color: ${theme.textInverted || '#fff'};

          &:hover:not(:disabled) {
            background: ${theme.primaryDark || '#005ac1'};
            transform: translateY(-2px);
            box-shadow: ${theme.shadow?.md || '0 4px 6px rgba(0,0,0,0.1)'};
          }
        `;
      case 'secondary':
        return css`
          background: ${theme.secondary || '#6c757d'};
          color: ${theme.textInverted || '#fff'};

          &:hover:not(:disabled) {
            background: ${theme.secondaryDark || '#545b62'};
            transform: translateY(-2px);
            box-shadow: ${theme.shadow?.md};
          }
        `;
      case 'outline':
        return css`
          background: transparent;
          color: ${theme.primary || '#0070f3'};
          border: 2px solid ${theme.primary || '#0070f3'};

          &:hover:not(:disabled) {
            background: ${theme.primary}22; // 13.5% opacity
          }
        `;
      case 'ghost':
        return css`
          background: transparent;
          color: ${theme.textPrimary || '#333'};

          &:hover:not(:disabled) {
            background: ${theme.surface || '#f1f1f1'};
          }
        `;
      default:
        return css`
          background: ${theme.primary || '#0070f3'};
          color: ${theme.textInverted || '#fff'};

          &:hover:not(:disabled) {
            background: ${theme.primaryDark || '#005ac1'};
            transform: translateY(-2px);
            box-shadow: ${theme.shadow?.md};
          }
        `;
    }
  }}
`;
