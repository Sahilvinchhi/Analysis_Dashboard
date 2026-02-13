/**
 * NIVO CHARTS - QUICK START GUIDE
 * 
 * This file demonstrates how to use the new Nivo chart components
 * in place of Chart.js. Use these examples as templates for your own charts.
 */

// ============================================================================
// 1. BASIC SETUP - Install Dependencies
// ============================================================================

/*
npm install @nivo/bar @nivo/line @nivo/pie @nivo/area @nivo/bubble @nivo/scatterplot @nivo/core
npm uninstall chart.js
*/

// ============================================================================
// 2. IMPORT THE NIVO CHARTS
// ============================================================================

/*
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  AreaChart, 
  BubbleChart,
  ScatterChart 
} from './NivoCharts';
*/

// ============================================================================
// 3. EXAMPLE 1: BASIC BAR CHART
// ============================================================================

/*
const BarChartExample = () => {
  const data = [
    { month: 'January', sales: 24000 },
    { month: 'February', sales: 13000 },
    { month: 'March', sales: 20000 },
    { month: 'April', sales: 22000 },
    { month: 'May', sales: 29000 },
  ];

  return (
    <BarChart
      data={data}
      xAxisKey="month"
      yAxisKeys={['sales']}
      title="Monthly Sales"
      height={400}
      showLegend={true}
    />
  );
};
*/

// ============================================================================
// 4. EXAMPLE 2: MULTI-SERIES BAR CHART (Grouped)
// ============================================================================

/*
const GroupedBarChartExample = () => {
  const data = [
    { quarter: 'Q1', sales: 45000, revenue: 35000 },
    { quarter: 'Q2', sales: 52000, revenue: 42000 },
    { quarter: 'Q3', sales: 48000, revenue: 38000 },
    { quarter: 'Q4', sales: 61000, revenue: 50000 },
  ];

  return (
    <BarChart
      data={data}
      xAxisKey="quarter"
      yAxisKeys={['sales', 'revenue']}      // Multiple Y-axis columns
      title="Quarterly Sales vs Revenue"
      showLegend={true}
      enableStackMode={false}               // Grouped bars
    />
  );
};
*/

// ============================================================================
// 5. EXAMPLE 3: STACKED BAR CHART
// ============================================================================

/*
const StackedBarChartExample = () => {
  const data = [
    { month: 'Jan', product_a: 5000, product_b: 3000, product_c: 2000 },
    { month: 'Feb', product_a: 6000, product_b: 3500, product_c: 2500 },
    { month: 'Mar', product_a: 7000, product_b: 4000, product_c: 3000 },
  ];

  return (
    <BarChart
      data={data}
      xAxisKey="month"
      yAxisKeys={['product_a', 'product_b', 'product_c']}
      title="Product Sales (Stacked)"
      showLegend={true}
      enableStackMode={true}                // Stack bars on top of each other
    />
  );
};
*/

// ============================================================================
// 6. EXAMPLE 4: COLUMN CHART (Horizontal Bars)
// ============================================================================

/*
const ColumnChartExample = () => {
  const data = [
    { category: 'Product A', value: 65 },
    { category: 'Product B', value: 59 },
    { category: 'Product C', value: 80 },
    { category: 'Product D', value: 81 },
  ];

  return (
    <BarChart
      data={data}
      xAxisKey="category"
      yAxisKeys={['value']}
      title="Product Metrics"
      invertAxes={true}                    // Inverted = horizontal bars
      showLegend={false}
    />
  );
};
*/

// ============================================================================
// 7. EXAMPLE 5: LINE CHART
// ============================================================================

/*
const LineChartExample = () => {
  const data = [
    {
      id: 'Sales',
      data: [
        { x: 'Jan', y: 24000 },
        { x: 'Feb', y: 13000 },
        { x: 'Mar', y: 20000 },
        { x: 'Apr', y: 22000 },
        { x: 'May', y: 29000 },
      ],
    },
  ];

  return (
    <LineChart
      data={data}
      title="Sales Trend"
      showLegend={true}
      colors={['#3b82f6']}
    />
  );
};
*/

// ============================================================================
// 8. EXAMPLE 6: MULTI-SERIES LINE CHART
// ============================================================================

/*
const MultiLineChartExample = () => {
  const data = [
    {
      id: 'Sales',
      data: [
        { x: 'Jan', y: 24000 },
        { x: 'Feb', y: 13000 },
        { x: 'Mar', y: 20000 },
      ],
    },
    {
      id: 'Revenue',
      data: [
        { x: 'Jan', y: 18000 },
        { x: 'Feb', y: 9800 },
        { x: 'Mar', y: 15000 },
      ],
    },
    {
      id: 'Profit',
      data: [
        { x: 'Jan', y: 6000 },
        { x: 'Feb', y: 3200 },
        { x: 'Mar', y: 5000 },
      ],
    },
  ];

  return (
    <LineChart
      data={data}
      title="Financial Metrics"
      showLegend={true}
      colors={['#3b82f6', '#10b981', '#f59e0b']}
    />
  );
};
*/

// ============================================================================
// 9. EXAMPLE 7: AREA CHART
// ============================================================================

/*
const AreaChartExample = () => {
  const data = [
    {
      id: 'Sales',
      data: [
        { x: 'Jan', y: 24000 },
        { x: 'Feb', y: 13000 },
        { x: 'Mar', y: 20000 },
      ],
    },
    {
      id: 'Revenue',
      data: [
        { x: 'Jan', y: 18000 },
        { x: 'Feb', y: 9800 },
        { x: 'Mar', y: 15000 },
      ],
    },
  ];

  return (
    <AreaChart
      data={data}
      title="Revenue Distribution"
      enableStackMode={true}               // Stack areas on top of each other
      showLegend={true}
    />
  );
};
*/

// ============================================================================
// 10. EXAMPLE 8: PIE CHART
// ============================================================================

/*
const PieChartExample = () => {
  const data = [
    { id: 'Product A', value: 35 },
    { id: 'Product B', value: 28 },
    { id: 'Product C', value: 21 },
    { id: 'Product D', value: 16 },
  ];

  return (
    <PieChart
      data={data}
      title="Market Share"
      isDoughnut={false}                   // Pie chart
      showLegend={true}
    />
  );
};
*/

// ============================================================================
// 11. EXAMPLE 9: DONUT CHART
// ============================================================================

/*
const DonutChartExample = () => {
  const data = [
    { id: 'Product A', value: 35 },
    { id: 'Product B', value: 28 },
    { id: 'Product C', value: 21 },
    { id: 'Product D', value: 16 },
  ];

  return (
    <PieChart
      data={data}
      title="Market Share"
      isDoughnut={true}                   // Donut chart (with hole in center)
      showLegend={true}
    />
  );
};
*/

// ============================================================================
// 12. EXAMPLE 10: BUBBLE CHART (Multi-Dimensional)
// ============================================================================

/*
const BubbleChartExample = () => {
  const data = {
    children: [
      { id: 'Product A', x: 100, y: 50, size: 35 },   // x, y, size (bubble size)
      { id: 'Product B', x: 120, y: 80, size: 28 },
      { id: 'Product C', x: 80, y: 30, size: 21 },
      { id: 'Product D', x: 150, y: 100, size: 16 },
    ],
  };

  return (
    <BubbleChart
      data={data}
      title="Product Performance"
      showLegend={true}
    />
  );
};
*/

// ============================================================================
// 13. EXAMPLE 11: DYNAMIC DATA TRANSFORMATION (From Database)
// ============================================================================

/*
// Example: Converting database records to Nivo format
const DatabaseToNivo = () => {
  // Imagine this comes from your API
  const databaseRows = [
    { plant_id: 1, month: 'January', sales_amount: 24000, tax_amount: 3000 },
    { plant_id: 1, month: 'February', sales_amount: 13000, tax_amount: 1600 },
    { plant_id: 1, month: 'March', sales_amount: 20000, tax_amount: 2500 },
  ];

  // Transform to Nivo format
  const chartData = databaseRows.map(row => ({
    month: row.month,
    'Sales': row.sales_amount,
    'Tax': row.tax_amount,
  }));

  return (
    <BarChart
      data={chartData}
      xAxisKey="month"
      yAxisKeys={['Sales', 'Tax']}
      title="Sales with Tax"
    />
  );
};
*/

// ============================================================================
// 14. EXAMPLE 12: CUSTOM COLORS
// ============================================================================

/*
const CustomColorsExample = () => {
  const customPalette = [
    '#FF6B6B',  // Red
    '#4ECDC4',  // Teal
    '#45B7D1',  // Blue
    '#FFA07A',  // Light Salmon
    '#98D8C8',  // Mint
  ];

  const data = [
    { quarter: 'Q1', value: 45000 },
    { quarter: 'Q2', value: 52000 },
    { quarter: 'Q3', value: 48000 },
    { quarter: 'Q4', value: 61000 },
  ];

  return (
    <BarChart
      data={data}
      xAxisKey="quarter"
      yAxisKeys={['value']}
      colors={customPalette}
      title="Quarterly Results"
    />
  );
};
*/

// ============================================================================
// 15. EXAMPLE 13: RESPONSIVE COMPONENT
// ============================================================================

/*
// All Nivo charts are responsive by default!
// They automatically adjust to container size

const ResponsiveChartExample = () => {
  const data = [
    { month: 'Jan', sales: 24000 },
    { month: 'Feb', sales: 13000 },
    { month: 'Mar', sales: 20000 },
  ];

  return (
    <div style={{
      width: '100%',           // Will resize with this container
      height: 'auto',
      minHeight: '400px'
    }}>
      <BarChart
        data={data}
        xAxisKey="month"
        yAxisKeys={['sales']}
        // No need to worry about screen size - Nivo handles it!
      />
    </div>
  );
};
*/

// ============================================================================
// 16. DATA TRANSFORMATION PATTERNS
// ============================================================================

/*
// Pattern 1: Simple conversion for Bar/Column charts
const toBarChartFormat = (records, xKey, yKeys) => {
  return records.map(record => ({
    [xKey]: record[xKey],
    ...yKeys.reduce((acc, yKey) => {
      acc[yKey] = Number(record[yKey]) || 0;
      return acc;
    }, {})
  }));
};

// Pattern 2: Conversion for Line/Area charts
const toLineChartFormat = (records, xKey, yKeys) => {
  return yKeys.map(yKey => ({
    id: yKey,
    data: records.map(record => ({
      x: String(record[xKey]),
      y: Number(record[yKey]) || 0
    }))
  }));
};

// Pattern 3: Conversion for Pie charts
const toPieChartFormat = (records, idKey, valueKey) => {
  return records.map(record => ({
    id: String(record[idKey]),
    value: Number(record[valueKey]) || 0
  }));
};

// Usage:
const data = [
  { month: 'Jan', sales: 24000, revenue: 18000 },
  { month: 'Feb', sales: 13000, revenue: 9800 },
];

const barData = toBarChartFormat(data, 'month', ['sales', 'revenue']);
const lineData = toLineChartFormat(data, 'month', ['sales', 'revenue']);
const pieData = toPieChartFormat(data, 'month', 'sales');
*/

// ============================================================================
// 17. TIPS & BEST PRACTICES
// ============================================================================

/*
✅ DO:
  ✓ Memoize transformed data with useMemo
  ✓ Use consistent color palettes across your app
  ✓ Provide meaningful chart titles
  ✓ Show legends for multi-series charts
  ✓ Use appropriate chart types for your data
  ✓ Test with sample data before using real data
  ✓ Handle loading states while fetching data
  ✓ Add error boundaries around chart components

❌ DON'T:
  ✗ Don't use Bar chart for Pie data format
  ✗ Don't recreate chart components on every render
  ✗ Don't use too many color schemes
  ✗ Don't render too many charts on one page
  ✗ Don't forget to transform data before passing to charts
  ✗ Don't ignore responsive design
  ✗ Don't hardcode colors - use palette variables
  ✗ Don't pass unvalidated data from APIs
*/

// ============================================================================
// 18. INTEGRATION WITH DASHBOARD
// ============================================================================

/*
// In dashboard.tsx, here's how it works:

// 1. Data from API comes as:
const documentData = [
  { FinancialYear: '2023', GrossTotal: 100000, NetInvoiceAmt: 95000, TotalTaxAmt: 5000 },
  { FinancialYear: '2024', GrossTotal: 120000, NetInvoiceAmt: 114000, TotalTaxAmt: 6000 },
];

// 2. Transform it for Nivo:
const transformedData = documentData.map(row => ({
  year: row.FinancialYear,
  'Gross Total': row.GrossTotal,
  'Net Amount': row.NetInvoiceAmt,
  'Tax Amount': row.TotalTaxAmt
}));

// 3. Render with Nivo:
<BarChart
  data={transformedData}
  xAxisKey="year"
  yAxisKeys={['Gross Total', 'Net Amount', 'Tax Amount']}
  title="Financial Summary"
  enableStackMode={true}
/>
*/

// ============================================================================
// 19. PERFORMANCE OPTIMIZATION
// ============================================================================

/*
// For large datasets, optimize like this:

import { useMemo } from 'react';

const LargeDatasetChart = ({ allData }) => {
  // Memoize data transformation
  const chartData = useMemo(() => {
    // Sample data if too large
    const step = Math.ceil(allData.length / 100);
    const sampledData = allData.filter((_, i) => i % step === 0);
    
    return sampledData.map(row => ({
      date: row.date,
      value: row.value
    }));
  }, [allData]);

  return (
    <LineChart
      data={[{
        id: 'Data',
        data: chartData
      }]}
    />
  );
};
*/

// ============================================================================
// 20. COMPLETE DASHBOARD EXAMPLE
// ============================================================================

/*
import React, { useState, useEffect, useMemo } from 'react';
import { BarChart, LineChart, PieChart } from './NivoCharts';
import api from './api';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chartType, setChartType] = useState('bar');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get('/api/sales');
        setData(response.data);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const chartData = useMemo(() => {
    return data.map(row => ({
      month: row.month,
      sales: Number(row.sales_amount),
      revenue: Number(row.revenue_amount),
      profit: Number(row.profit_amount)
    }));
  }, [data]);

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Sales Dashboard</h1>

      <div style={{ marginBottom: '1rem' }}>
        <label>
          Chart Type:
          <select 
            value={chartType}
            onChange={(e) => setChartType(e.target.value)}
          >
            <option value="bar">Bar</option>
            <option value="line">Line</option>
            <option value="pie">Pie</option>
          </select>
        </label>
      </div>

      {chartType === 'bar' && (
        <BarChart
          data={chartData}
          xAxisKey="month"
          yAxisKeys={['sales', 'revenue', 'profit']}
          title="Sales Analysis"
          showLegend={true}
        />
      )}

      {chartType === 'line' && (
        <LineChart
          data={[
            {
              id: 'Sales',
              data: chartData.map(d => ({ x: d.month, y: d.sales }))
            },
            {
              id: 'Revenue',
              data: chartData.map(d => ({ x: d.month, y: d.revenue }))
            }
          ]}
          title="Trends"
          showLegend={true}
        />
      )}

      {chartType === 'pie' && (
        <PieChart
          data={chartData.map(d => ({
            id: d.month,
            value: d.sales
          }))}
          title="Sales Distribution"
          showLegend={true}
        />
      )}
    </div>
  );
};

export default Dashboard;
*/

// ============================================================================
// END OF QUICK START GUIDE
// ============================================================================

export const NIVO_QUICK_START = true;
