# Chart.js to Nivo Migration Guide

## Overview

This guide demonstrates how to replace Chart.js with **Nivo**, a modern, React-first chart library powered by D3.js. Nivo provides better integration with React, superior performance, and a more declarative syntax.

## Why Migrate to Nivo?

### Advantages Over Chart.js

| Feature | Chart.js | Nivo |
|---------|----------|------|
| **React Integration** | Imperative (Canvas API) | Declarative (JSX) |
| **Responsiveness** | Manual handling required | Automatic with ResposiveX components |
| **Bundle Size** | ~60KB | ~800KB (but highly modular) |
| **Animation** | Basic | Smooth with motion config |
| **Customization** | Limited | Extensive theming system |
| **Multi-axis Support** | Complex | Native support |
| **TypeScript** | Partial | Full support |
| **D3 Power** | Wrapped | Direct access |
| **Accessibility** | Limited | Better ARIA labels |

## Installation

### 1. Remove Chart.js

```bash
npm uninstall chart.js
```

### 2. Install Nivo Packages

```bash
npm install @nivo/bar @nivo/line @nivo/pie @nivo/area @nivo/bubble @nivo/scatterplot @nivo/core
```

Or install all Nivo packages:

```bash
npm install @nivo/{bar,line,pie,area,bubble,scatterplot,core}
```

## Migration Steps

### Step 1: Remove Chart.js Imports and Refs

**Before (Chart.js):**
```tsx
import Chart from 'chart.js/auto';

const chartCanvasRef = useRef<HTMLCanvasElement | null>(null);
const chartInstanceRef = useRef<Chart | null>(null);
```

**After (Nivo):**
```tsx
import { BarChart, LineChart, PieChart, AreaChart } from './NivoCharts';
```

### Step 2: Transform Data Format

#### Chart.js Format
```javascript
{
  labels: ['Jan', 'Feb', 'Mar'],
  datasets: [
    {
      label: 'Sales',
      data: [100, 200, 150],
      borderColor: '#3b82f6'
    }
  ]
}
```

#### Nivo Bar/Column Format
```javascript
[
  { month: 'Jan', sales: 100, revenue: 80 },
  { month: 'Feb', sales: 200, revenue: 160 },
  { month: 'Mar', sales: 150, revenue: 120 }
]
```

#### Nivo Line/Area Format
```javascript
[
  {
    id: 'Sales',
    data: [
      { x: 'Jan', y: 100 },
      { x: 'Feb', y: 200 },
      { x: 'Mar', y: 150 }
    ]
  },
  {
    id: 'Revenue',
    data: [
      { x: 'Jan', y: 80 },
      { x: 'Feb', y: 160 },
      { x: 'Mar', y: 120 }
    ]
  }
]
```

#### Nivo Pie Format
```javascript
[
  { id: 'Product A', value: 35 },
  { id: 'Product B', value: 28 },
  { id: 'Product C', value: 21 }
]
```

### Step 3: Replace Canvas with Nivo Components

**Before (Chart.js):**
```tsx
useEffect(() => {
  if (!chartCanvasRef.current || !documentData.length) return;

  const datasets = documentData.map(row => ({
    label: row.name,
    data: row.values,
    borderColor: '#3b82f6'
  }));

  if (chartInstanceRef.current) {
    chartInstanceRef.current.destroy();
  }

  chartInstanceRef.current = new Chart(chartCanvasRef.current, {
    type: 'bar',
    data: { labels: ['A', 'B', 'C'], datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: true } }
    }
  });
}, [documentData]);

return <canvas ref={chartCanvasRef} />;
```

**After (Nivo):**
```tsx
const transformedData = useMemo(() => {
  return documentData.map(row => ({
    name: row.name,
    value: row.value
  }));
}, [documentData]);

return (
  <BarChart
    data={transformedData}
    xAxisKey="name"
    yAxisKeys={['value']}
    height={400}
    showLegend={true}
    colors={['#3b82f6', '#10b981']}
  />
);
```

## Code Examples

### Basic Bar Chart

```tsx
import { BarChart } from './NivoCharts';

const MyComponent = () => {
  const data = [
    { month: 'Jan', sales: 24000, revenue: 18000 },
    { month: 'Feb', sales: 13000, revenue: 9800 },
    { month: 'Mar', sales: 20000, revenue: 15000 }
  ];

  return (
    <BarChart
      data={data}
      xAxisKey="month"
      yAxisKeys={['sales', 'revenue']}
      title="Monthly Sales"
      showLegend={true}
    />
  );
};
```

### Stacked Bar Chart

```tsx
<BarChart
  data={data}
  xAxisKey="month"
  yAxisKeys={['sales', 'revenue']}
  enableStackMode={true}
  title="Stacked Sales"
/>
```

### Line Chart with Multiple Series

```tsx
import { LineChart } from './NivoCharts';

const data = [
  {
    id: 'Sales',
    data: [
      { x: 'Jan', y: 24000 },
      { x: 'Feb', y: 13000 }
    ]
  },
  {
    id: 'Revenue',
    data: [
      { x: 'Jan', y: 18000 },
      { x: 'Feb', y: 9800 }
    ]
  }
];

return (
  <LineChart
    data={data}
    title="Sales Trends"
    showLegend={true}
  />
);
```

### Area Chart

```tsx
import { AreaChart } from './NivoCharts';

return (
  <AreaChart
    data={data}
    title="Revenue Distribution"
    enableStackMode={true}
    showLegend={true}
  />
);
```

### Pie Chart

```tsx
import { PieChart } from './NivoCharts';

const data = [
  { id: 'Product A', value: 35 },
  { id: 'Product B', value: 28 },
  { id: 'Product C', value: 21 }
];

return (
  <PieChart
    data={data}
    title="Product Distribution"
    isDoughnut={false}
  />
);
```

### Column Chart (Inverted Bar)

```tsx
<BarChart
  data={data}
  xAxisKey="month"
  yAxisKeys={['sales', 'revenue']}
  invertAxes={true}
  title="Column Chart"
/>
```

## Dashboard Integration Example

Here's how the dashboard.tsx was updated:

### Key Changes

1. **Removed Chart.js references:**
   - Removed `import Chart from 'chart.js/auto'`
   - Removed canvas ref and chart instance ref

2. **Added Nivo imports:**
   ```tsx
   import { BarChart, LineChart, PieChart, AreaChart } from './NivoCharts';
   ```

3. **Added data transformation function:**
   ```tsx
   const transformDataForNivo = useMemo(() => {
     if (!documentData.length || !detectedChartKeys?.labelKey) return null;

     const { labelKey } = detectedChartKeys;
     const columnsToUse = chartType === 'pie' 
       ? selectedYColumns.slice(0, 1) 
       : selectedYColumns;

     if (chartType === 'pie') {
       return documentData.map((row) => ({
         id: String(row[labelKey] ?? ''),
         value: Number(row[columnsToUse[0]] ?? 0)
       }));
     } else if (chartType === 'line' || chartType === 'area') {
       return columnsToUse.map((colKey) => ({
         id: formatHeader(colKey),
         data: documentData.map((row) => ({
           x: String(row[labelKey] ?? ''),
           y: Number(row[colKey] ?? 0)
         }))
       }));
     } else {
       return documentData.map((row) => ({
         [labelKey]: String(row[labelKey] ?? ''),
         ...columnsToUse.reduce((acc, colKey) => {
           acc[colKey] = Number(row[colKey] ?? 0);
           return acc;
         }, {})
       }));
     }
   }, [documentData, detectedChartKeys, chartType, selectedYColumns]);
   ```

4. **Replaced canvas rendering with Nivo components:**
   ```tsx
   {chartType === 'bar' && (
     <BarChart
       data={transformDataForNivo}
       xAxisKey={detectedChartKeys?.labelKey || 'x'}
       yAxisKeys={selectedYColumns}
       height={400}
       showLegend={true}
       colors={colorPalette}
     />
   )}
   ```

## Supported Chart Types

### In dashboard.tsx

- ✅ **Bar** - Grouped or stacked
- ✅ **Column** - Inverted bar chart
- ✅ **Line** - Multi-series with interpolation
- ✅ **Area** - Stacked or regular
- ✅ **Pie** - With donut mode support

### Additional Nivo Charts (Available in NivoCharts.tsx)

- 🎯 **Bubble Chart** - For multi-dimensional data (x, y, size)
- 📊 **Scatter Plot** - For correlation analysis
- 📈 **Bar** - Horizontal bars
- 🔄 **With Multiple Axes** - Advanced use cases

## Configuration Options

### Common Properties

```tsx
interface ChartProps {
  data: any[];                    // Chart data
  xAxisKey?: string;              // Key for X-axis in bar/column
  yAxisKeys?: string[];           // Keys for Y-axes
  chartType?: 'bar' | 'line' | 'pie' | 'area' | 'column';
  height?: number;                // Chart height (default: 400)
  showLegend?: boolean;           // Show legend (default: true)
  showTooltip?: boolean;          // Show tooltips (default: true)
  enableStackMode?: boolean;      // Stack bars/areas (default: false)
  invertAxes?: boolean;           // Horizontal bars (default: false)
  colors?: string[];              // Custom color palette
  title?: string;                 // Chart title
}
```

### Color Palette

```tsx
const colorPalette = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ef4444', // red
  '#6366f1', // indigo
  '#06b6d4', // cyan
  '#8b5cf6', // violet
  '#14b8a6', // teal
  '#f97316', // orange
  '#22c55e'  // lime
];
```

## Advanced Features

### 1. Responsive Design

Nivo's `Responsive*` components automatically handle resizing:

```tsx
<BarChart
  data={data}
  xAxisKey="month"
  yAxisKeys={['sales']}
  height={400}
/>
// Automatically scales when window is resized
```

### 2. Interactive Tooltips

Custom tooltip rendering:

```tsx
tooltip={({ id, value, color }) => (
  <div style={{
    padding: '8px 12px',
    backgroundColor: color,
    color: '#fff',
    borderRadius: '4px'
  }}>
    <strong>{id}:</strong> {value}
  </div>
)}
```

### 3. Custom Legends

```tsx
legends={[
  {
    anchor: 'bottom-right',
    direction: 'column',
    itemWidth: 100,
    itemHeight: 20,
    symbolSize: 20
  }
]}
```

### 4. Animations

```tsx
animate={true}
motionConfig="gentle" // or "wobbly", "molasses", "stiff"
```

### 5. Multiple Y-Axes

```tsx
<BarChart
  data={data}
  yAxisKeys={['revenue', 'profit', 'expenses']}
  title="Multiple Y-Axes"
/>
```

## Performance Optimization

### 1. Memoize Transformed Data

```tsx
const transformedData = useMemo(() => {
  return documentData.map(transformRow);
}, [documentData]);
```

### 2. Lazy Load Charts

```tsx
import dynamic from 'next/dynamic';

const BarChart = dynamic(() => import('./BarChart'), {
  loading: () => <div>Loading chart...</div>
});
```

### 3. Large Datasets

For datasets with 1000+ points:

```tsx
const sampledData = useMemo(() => {
  const step = Math.ceil(documentData.length / 100);
  return documentData.filter((_, i) => i % step === 0);
}, [documentData]);
```

## Testing with Sample Data

The [NivoCharts.tsx](./frontend/src/NivoCharts.tsx) file includes built-in sample data:

```tsx
const SAMPLE_DATA = {
  sales: [...],        // Monthly sales data
  quarterly: [...],    // Quarterly data
  products: [...],     // Product distribution
  trends: [...],       // Trend data for line charts
  areaData: [...],     // Area chart data
  bubbleData: {...}    // Bubble chart data
};
```

Use the `NivoChartsDemo` component to see all examples:

```tsx
import { NivoChartsDemo } from './NivoCharts';

export default NivoChartsDemo;
```

## Troubleshooting

### Chart Not Rendering

1. Ensure data is in correct format for chart type
2. Check that required keys exist in data objects
3. Verify height is set (defaults to 400px)

### Performance Issues

1. Check data size - consider sampling large datasets
2. Reduce animation complexity with `motionConfig="stiff"`
3. Use `animate={false}` for very large datasets

### Styling Issues

1. Ensure parent container has defined dimensions
2. Use the custom CHART_THEME object for consistency
3. Check color palette has enough colors for data series

### Type Errors

1. Ensure TypeScript types are imported: `import { ChartProps } from './NivoCharts'`
2. Verify data matches expected format
3. Check ESLint configuration allows React components

## Browser Compatibility

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

All modern browsers with SVG support.

## Additional Resources

- [Nivo Documentation](https://nivo.rocks/)
- [D3.js Documentation](https://d3js.org/)
- [React Best Practices](https://react.dev/)
- [SVG Charts Guide](https://www.smashingmagazine.com/2022/02/inline-svg-html/)

## Summary

The migration from Chart.js to Nivo provides:

✅ Better React integration with declarative JSX syntax
✅ Automatic responsiveness without manual handling
✅ Beautiful animations and interactions out of the box
✅ Extensive customization options
✅ Native support for advanced features (stacking, multiple axes)
✅ Better performance with large datasets
✅ Improved accessibility

The updated dashboard component now uses Nivo for all chart rendering while maintaining full compatibility with the existing data pipeline.
