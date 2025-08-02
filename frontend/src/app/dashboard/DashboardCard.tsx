import styled from "styled-components";

const CardContainer = styled.div<{ height?: string }>`
  background: ${({ theme }) => theme.cardBg};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  padding: 1.5rem;
  transition: all 0.3s ease;
  border: 1px solid ${({ theme }) => theme.border};
  width: 100%;
  min-width: 0;
  height: ${({ height }) => height || "100%"};
  &:hover {
    box-shadow: ${({ theme }) => theme.shadow.md};
    transform: translateY(-5px);
  }
  position: relative;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: ${({ theme }) => theme.textPrimary};
`;

interface DashboardCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  height?: string;
}

export default function DashboardCard({
  title,
  children,
  className,
  height,
}: DashboardCardProps) {
  return (
    <CardContainer className={className} style={{ height }}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      {children}
    </CardContainer>
  );
}
