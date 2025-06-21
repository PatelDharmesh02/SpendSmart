import styled, { keyframes } from 'styled-components';
import { theme } from '@/styles/theme';

interface LoaderProps {
    size?: keyof typeof theme.light.spacing;
    loaderText?: string;
}

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100%;
`;

const LoaderSpinner = styled.div<{ $size: keyof typeof theme.light.spacing }>`
  border: 4px solid ${({ theme }) => theme.primaryDark};
  border-top: 4px solid ${({ theme }) => theme.primaryLight};
  border-radius: 50%;
  width: ${({ theme, $size }) => theme.spacing[$size]};
  height: ${({ theme, $size }) => theme.spacing[$size]};
  animation: ${spin} 1s linear infinite;
`;

const LoaderText = styled.p`
  margin-top: 10px;
`;

export default function Loader({ size = 'xl', loaderText = 'Loading...' }: LoaderProps) {
    return (
        <LoaderContainer>
            <LoaderSpinner $size={size} />
            <LoaderText>{loaderText}</LoaderText>
        </LoaderContainer>
    );
}