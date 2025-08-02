import styled, { keyframes } from 'styled-components';

const fade = keyframes`
  0%, 39%, 100% { opacity: 0.3; }
  40% { opacity: 1; }
`;

const LoaderContainer = styled.div<{ size: number }>`
  display: inline-block;
  position: relative;
  width: ${({ size }) => size}px;
  height: ${({ size }) => size}px;
`;

const Bar = styled.div<{ index: number; size: number; color: string }>`
  position: absolute;
  top: 50%;
  left: 50%;
  width: ${({ size }) => size * 0.08}px;
  height: ${({ size }) => size * 0.25}px;
  background: ${({ color }) => color};
  border-radius: ${({ size }) => size * 0.02}px;
  transform: rotate(${({ index }) => index * 30}deg)
    translate(${({ size }) => size / 2 - size * 0.125}px)
    translate(-50%, -50%);
  transform-origin: center;
  animation: ${fade} 1.2s linear infinite;
  animation-delay: ${({ index }) => index * 0.1}s;
`;

interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
}

const Loader = ({ size = 'md' }: LoaderProps) => {
  const sizePx = size === 'sm' ? 20 : size === 'md' ? 40 : 60;
  const color = '#000'; // use theme.primary if desired

  return (
    <LoaderContainer size={sizePx}>
      {Array.from({ length: 12 }).map((_, i) => (
        <Bar key={i} index={i} size={sizePx} color={color} />
      ))}
    </LoaderContainer>
  );
};

export default Loader;
