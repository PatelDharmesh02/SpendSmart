import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled, { useTheme } from 'styled-components';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import { AppError, handleErrorWithoutHook } from '@/utils/errorHandler';
import { useAppSelector } from '@/redux/hooks';
import { userCurrentDateSelector } from '@/redux/slices/userSlice';
import AxiosInstance from "@/utils/api";
import { useToast } from '@/lib/ToasteContext';
import Loader from '@/components/Loader';
import { TransactionMonthlySummary } from '@/types/transaction.type';

const ChartContainer = styled.div`
  height: 300px;
`;

const LoaderContainer = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`

const TotalAmount = styled.div`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.primary};
`;

interface SpendingChartData {
    month: string | null;
    total_spent: number | null;
    category_breakdown: Record<string, number> | undefined;
}

export default function SpendingChart() {
    const [data, setData] = useState<SpendingChartData | null>(null)
    const [loading, setLoading] = useState<boolean>(false);
    const currentDate = useAppSelector(userCurrentDateSelector);
    const chartRef = useRef(null);
    const theme = useTheme();
    const { showToast } = useToast();

    const fetchChartData = useCallback(async () => {
        setLoading(true);
        try {
            const res = await AxiosInstance.get<TransactionMonthlySummary>(`/transactions/summary?month=${currentDate.year}-${currentDate.month.toString().padStart(2, "0")}`);
            if (res.data) {
                setData(res.data)
            }
        } catch (error: unknown) {
            handleErrorWithoutHook(error as AppError, showToast, {
                prefix: "Budget data comparision",
                fallbackMessage: "Budget data comparision failed",
            });

        } finally {
            setLoading(false);
        }
    }, [currentDate, showToast]);
    useEffect(() => {
        fetchChartData();
    }, [])

    // Use a color palette from your theme or fallback
    const palette = theme.chart || [
        '#4361ee', '#3a0ca3', '#4cc9f0', '#f72585', '#7209b7',
        '#2ec4b6', '#ff9f1c', '#e71d36', '#2a9d8f', '#e9c46a'
    ];

    // Prepare data for Highcharts
    const categories = Object.entries(data?.category_breakdown || {});
    const chartData = categories.map(([name, value], i) => ({
        name: name[0].toUpperCase() + name.slice(1),
        y: Number(((value / (data?.total_spent || 1)) * 100).toFixed(2)),
        amount: value,
        color: palette[i % palette.length]
    }));

    const chartOptions = {
        chart: {
            type: 'pie',
            backgroundColor: 'transparent',
            height: 300
        },
        title: {
            text: ""
        },
        tooltip: {
            pointFormat: '<b>₹{point.amount:,.0f}</b> ({point.percentage:.1f}%)'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                    style: {
                        color: theme.textPrimary,
                        textOutline: 'none'
                    }
                }
            }
        },
        series: [{
            name: 'Spending',
            data: chartData
        }],
        credits: {
            enabled: false
        },
        accessibility: {
            enabled: false
        }
    };

    if (!loading) {
        return <LoaderContainer>
            <Loader size='lg' />
        </LoaderContainer>
    }

    return (
        <ChartContainer>
            <TotalAmount>
                Total Spent: <span style={{ color: theme.textPrimary }}>₹{data?.total_spent?.toLocaleString()}</span>
            </TotalAmount>
            <HighchartsReact
                highcharts={Highcharts}
                options={chartOptions}
                ref={chartRef}
            />
        </ChartContainer>
    );
}