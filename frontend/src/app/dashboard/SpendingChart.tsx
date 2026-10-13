"use client";

import { useRef } from "react";
import styled, { useTheme } from "styled-components";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { formatMoney } from "@/lib/finance";

const ChartContainer = styled.div`
  height: 280px;
`;

const TotalAmount = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.primary};
`;

const Empty = styled.p`
  color: ${({ theme }) => theme.textSecondary};
`;

export default function SpendingChart({
  breakdown,
  total,
}: {
  breakdown: Record<string, number>;
  total: number;
}) {
  const theme = useTheme();
  const chartRef = useRef(null);
  const entries = Object.entries(breakdown || {});
  const palette = theme.chart || ["#4361ee", "#4cc9f0", "#f72585", "#2ec4b6", "#ff9f1c"];

  if (!entries.length) {
    return <Empty>No expenses for this month yet.</Empty>;
  }

  const options: Highcharts.Options = {
    chart: { type: "pie", backgroundColor: "transparent", height: 260 },
    title: { text: undefined },
    credits: { enabled: false },
    tooltip: { pointFormat: "<b>{point.y}</b>" },
    plotOptions: {
      pie: {
        innerSize: "55%",
        dataLabels: { enabled: true, format: "{point.name}" },
      },
    },
    series: [
      {
        type: "pie",
        name: "Spent",
        data: entries.map(([name, value], index) => ({
          name: name[0].toUpperCase() + name.slice(1),
          y: value,
          color: palette[index % palette.length],
        })),
      },
    ],
  };

  return (
    <ChartContainer>
      <TotalAmount>{formatMoney(total)} spent</TotalAmount>
      <HighchartsReact highcharts={Highcharts} options={options} ref={chartRef} />
    </ChartContainer>
  );
}
