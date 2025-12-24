import { useState } from "react";
import { MetricType, StatCard } from "../interface/infinityhealth.interface";

const statCards: StatCard[] = [
    { id: 'Weight', icon: 'bag-handle', iconColor: '#009E0B', value: '80', unit: 'kilogram', bgColor: '#DAEDDC' },
    { id: 'Height', icon: 'swap-vertical', iconColor: '#009E0B', value: '175', unit: 'cm', bgColor: '#D8F4DC' },
    { id: 'BMI', icon: 'options', iconColor: '#FF5100', value: '26.12', unit: '', bgColor: '#FFE2D7' },
    { id: 'Water', icon: 'water', iconColor: '#00BFFF', value: '1500', unit: 'millilitre', bgColor: '#D8F4FF' },
    { id: 'Sleep', icon: 'moon', iconColor: '#FFEA00', value: '7', unit: 'hours', bgColor: '#FAF5DE' },
    { id: 'Steps', icon: 'footsteps', iconColor: '#6004FF', value: '8000', unit: 'steps', bgColor: '#EAE1F9' },
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