'use client';
import React, { useEffect, useState } from 'react';
import styled, { keyframes, css, useTheme } from 'styled-components';
import { AppTheme } from '@/styles/theme'; // adjust path if needed

const float = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0); }
`;

const pulse = keyframes`
  0% { transform: scale(0.95); opacity: 0.7; }
  50% { transform: scale(1); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.7; }
`;

const Container = styled.div`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 0;
  pointer-events: none;
`;

const AnimatedElement = styled.div<{
    $color: string;
    $size: string;
    $left: string;
    $top: string;
    $delay: string;
    $type: 'circle' | 'bar' | 'line';
    $opacity: number;
}>`
  position: absolute;
  left: ${props => props.$left};
  top: ${props => props.$top};
  width: ${props => props.$size};
  height: ${props =>
        props.$type === 'bar'
            ? props.$size
            : props.$type === 'line'
                ? '2px'
                : props.$size};
  background: ${props => props.color};
  border-radius: ${props =>
        props.$type === 'circle'
            ? '50%'
            : props.$type === 'bar'
                ? '4px 4px 0 0'
                : '2px'};
  opacity: ${props => props.$opacity};
  filter: blur(0px); // set to blur(2px) for softer look once working

  ${props =>
        props.$type === 'circle'
            ? css`animation: ${pulse} 8s ease-in-out infinite;`
            : css`animation: ${float} 8s ease-in-out infinite;`}
  animation-delay: ${props => props.$delay};
`;

const FinancialAnalyticsAnimation = () => {
    const theme = useTheme() as AppTheme;
    const [elements, setElements] = useState<React.ReactElement[]>([]);

    useEffect(() => {
        const createElements = () => {
            const newElements = [];
            const types = ['circle', 'bar', 'line'] as const;
            const colors = [
                theme.primary,
                theme.secondary,
                theme.accent,
                theme.success,
                theme.warning
            ];

            for (let i = 0; i < 30; i++) {
                const type = types[Math.floor(Math.random() * types.length)];
                const color = colors[Math.floor(Math.random() * colors.length)];
                const size =
                    type === 'circle'
                        ? `${Math.random() * 12 + 8}px` // 8–20px
                        : type === 'bar'
                            ? `${Math.random() * 12 + 6}px` // 6–18px tall
                            : `${Math.random() * 60 + 20}%`; // line width

                newElements.push(
                    <AnimatedElement
                        key={i}
                        $color={color}
                        $size={size}
                        $left={`${Math.random() * 100}%`}
                        $top={`${Math.random() * 100}%`}
                        $delay={`${Math.random() * 5}s`}
                        $type={type}
                        $opacity={0.3 + Math.random() * 0.3}
                    />
                );
            }

            setElements(newElements);
        };

        createElements();

        const handleResize = () => createElements();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [theme]);

    return <Container>{elements}</Container>;
};

export default FinancialAnalyticsAnimation;
