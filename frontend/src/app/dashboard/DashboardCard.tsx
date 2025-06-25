import styled from 'styled-components';

const CardContainer = styled.div`
  background: ${({ theme }) => theme.cardBg};
  border-radius: ${({ theme }) => theme.radius.lg};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  padding: 1.5rem;
  height: 100%;
  transition: all 0.3s ease;
  border: 1px solid ${({ theme }) => theme.border};

  &:hover {
    box-shadow: ${({ theme }) => theme.shadow.md};
    transform: translateY(-5px);
  }
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
}

export default function DashboardCard({ title, children, className }: DashboardCardProps) {
    return (
        <CardContainer className={className}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            {children}
        </CardContainer>
    );
}