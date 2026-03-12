/**
 * Utility functions for number formatting
 */
export const formatNumber = (
  value: number | string | null | undefined
): string => {
  if (value === null || value === undefined || value === "") {
    return "0";
  }
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numValue)) {
    return "0";
  }
  const hasDecimals = numValue % 1 !== 0;
  if (hasDecimals) {
    const formattedValue = numValue.toFixed(2);
    const [wholePart, decimalPart] = formattedValue.split(".");
    const formattedWholePart = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${formattedWholePart}.${decimalPart}`;
  }
  return numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};
