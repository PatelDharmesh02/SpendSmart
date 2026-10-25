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
  $size: number;
  $color: string;
}>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: ${({ $size }) => $size * 0.15}px;
  height: ${({ $size }) => $size * 0.15}px;
  margin-top: ${({ $size }) => $size * -0.075}px;
  margin-left: ${({ $size }) => $size * -0.075}px;
  border-radius: 50%;
  background-color: ${({ $color }) => $color};
`;

const Center = styled.div`
  flex: 1;
  min-height: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  center?: boolean;
}

const Loader = ({ size = 'md', showText = true, center = false }: LoaderProps) => {
  const theme = useTheme();
  const sizePx = size === 'sm' ? 30 : size === 'md' ? 50 : 80;
  const primaryColor = theme.primary;

  const spinner = (
    <LoaderContainer size={sizePx}>
      <SpinnerContainer size={sizePx}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Dot
            key={i}
            $size={sizePx}
            $color={primaryColor}
            style={{ transform: `rotate(${i * 30}deg) translateY(-${sizePx * 0.4}px)` }}
          />
        ))}
      </SpinnerContainer>
      {showText && <LoadingText>Loading...</LoadingText>}
    </LoaderContainer>
  );

  if (center) return <Center>{spinner}</Center>;
  return spinner;
};

export default Loader;
