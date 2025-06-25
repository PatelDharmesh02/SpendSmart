import styled from 'styled-components';

const Content = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.textSecondary};
  line-height: 1.6;
`;

interface MonthlySummaryProps {
    content: string;
}

export default function MonthlySummary({ content }: MonthlySummaryProps) {
    return (
        <Content>{content}</Content>
    );
}