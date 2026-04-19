/**
 * Format a number with commas as thousands separators.
 * @param value The number or string to format.
 * @returns The formatted string (e.g., "1,234").
 */
export const formatNumber = (value: number | string | undefined | null): string => {
    if (value === undefined || value === null || value === '') return '-';

    const num = typeof value === 'string' ? parseFloat(value) : value;

    if (isNaN(num)) return value.toString();

    return num.toLocaleString('en-US');
};
