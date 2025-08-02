import styled, { keyframes, useTheme } from 'styled-components';

const rotate = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoaderContainer = styled.div<{ size: number }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: ${({ size }) => size * 1.5}px;
  height: ${({ size }) => size * 1.8}px;
`;

const SpinnerContainer = styled.div<{ size: number }>`
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
  position: relative;
  animation: ${rotate} 2s linear infinite;
`;

const LoadingText = styled.div`
  margin-top: 10px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.textPrimary};
  letter-spacing: 1px;
`;

const Dot = styled.div<{ 
  index: number; 
  size: number; 
  color: string;
}>`
  position: absolute;
  width: ${({ size }) => size * 0.15}px;
  height: ${({ size }) => size * 0.15}px;
  border-radius: 50%;
  background-color: ${({ color }) => color};
  top: ${({ index, size }) => {
    const angle = index * 30 * Math.PI / 180;
    return size / 2 - Math.cos(angle) * size * 0.4;
  }}px;
  left: ${({ index, size }) => {
    const angle = index * 30 * Math.PI / 180;
    return size / 2 + Math.sin(angle) * size * 0.4;
  }}px;
  transform: translate(-50%, -50%);
`;

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

const Loader = ({ size = 'md', showText = true }: LoaderProps) => {
  const theme = useTheme();
  const sizePx = size === 'sm' ? 30 : size === 'md' ? 50 : 80;
  const primaryColor = theme.primary;

  return (
    <LoaderContainer size={sizePx}>
      <SpinnerContainer size={sizePx}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Dot 
            key={i} 
            index={i} 
            size={sizePx} 
            color={primaryColor} 
          />
        ))}
      </SpinnerContainer>
      {showText && <LoadingText>Loading...</LoadingText>}
    </LoaderContainer>
  );
};

export default Loader;
