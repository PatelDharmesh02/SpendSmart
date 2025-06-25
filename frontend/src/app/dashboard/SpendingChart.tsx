import React, { useRef } from 'react';
import styled, { useTheme } from 'styled-components';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const ChartContainer = styled.div`
  height: 300px;
`;

interface SpendingData {
    name: string;
    percentage: number;
    color: string;
}

interface SpendingChartProps {
    data: SpendingData[];
}

export default function SpendingChart({ data }: SpendingChartProps) {
    const chartRef = useRef(null);
    const theme = useTheme();

    const chartOptions = {
        chart: {
            type: 'pie',
            backgroundColor: 'transparent',
            height: 300
        },
        title: {
            text: ''
        },
        tooltip: {
            pointFormat: '{series.name}: <b>₹{point.y:,.0f}</b>'
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
            data: data.map(item => ({
                name: item.name,
                y: item.percentage,
                color: item.color
            }))
        }],
        credits: {
            enabled: false
        },
        accessibility: {
            enabled: false
        }
    };

    return (
        <ChartContainer>
            <HighchartsReact
                highcharts={Highcharts}
                options={chartOptions}
                ref={chartRef}
                
            />
        </ChartContainer>
    );
}