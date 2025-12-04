import { useState } from "react";
import { MetricType, StatCard } from "../interface/infinityhealth.interface";

const statCards: StatCard[] = [
    { id: 'Weight', icon: 'bag-handle', iconColor: '#22C55E', value: '80', unit: 'kilogram', bgColor: '#DCFCE7' },
    { id: 'Height', icon: 'swap-vertical', iconColor: '#F59E0B', value: '175', unit: 'cm', bgColor: '#FEF9C3' },
    { id: 'BMI', icon: 'options', iconColor: '#14B8A6', value: '26.12', unit: '', bgColor: '#CCFBF1' },
    { id: 'Water', icon: 'water', iconColor: '#3B82F6', value: '1500', unit: 'millilitre', bgColor: '#DBEAFE' },
    { id: 'Sleep', icon: 'moon', iconColor: '#EAB308', value: '7', unit: 'hours', bgColor: '#FEF3C7' },
    { id: 'Steps', icon: 'footsteps', iconColor: '#10B981', value: '8000', unit: 'steps', bgColor: '#D1FAE5' },
];

const chartData = [
    { date: '1/8', value: 45 },
    { date: '2/8', value: 78 },
    { date: '3/8', value: 65 },
    { date: '4/8', value: 55 },
    { date: '5/8', value: 48 },
    { date: '6/8', value: 80 },
];

const filterTabs: MetricType[] = ['Weight', 'Height', 'BMI', 'Water', 'Sleep'];

export const useDashBoardPage = () => {
    const [selectedTab, setSelectedTab] = useState<MetricType>('Weight');
    const maxValue = Math.max(...chartData.map(d => d.value));

    return {
        selectedTab,
        setSelectedTab,
        maxValue,
        chartData,
        statCards,
        filterTabs,
    }
}