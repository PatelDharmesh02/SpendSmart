import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoaderContainer = styled.div<{ size?: 'sm' | 'md' | 'lg' }>`
  display: inline-block;
  width: ${({ size }) =>
    size === 'sm' ? '20px' :
      size === 'md' ? '40px' : '60px'};
  height: ${({ size }) =>
    size === 'sm' ? '20px' :
      size === 'md' ? '40px' : '60px'};
  
  &:after {
    content: " ";
    display: block;
    width: ${({ size }) =>
    size === 'sm' ? '16px' :
      size === 'md' ? '32px' : '48px'};
    height: ${({ size }) =>
    size === 'sm' ? '16px' :
      size === 'md' ? '32px' : '48px'};
    border-radius: 50%;
    border: ${({ size }) =>
    size === 'sm' ? '2px' :
      size === 'md' ? '4px' : '6px'} 
      solid ${({ theme }) => theme.primary};
    border-color: ${({ theme }) => theme.primary} transparent ${({ theme }) => theme.primary} transparent;
    animation: ${spin} 1.2s linear infinite;
  }
`;

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
}

const Loader = ({ size = 'md' }: LoaderProps) => {
  return <LoaderContainer size={size} />;
};

export default Loader;