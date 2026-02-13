import React from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { ResponsiveLine } from '@nivo/line';
import { ResponsivePie } from '@nivo/pie';
import { ResponsiveScatterPlot } from '@nivo/scatterplot';

/**
 * NIVO CHARTS COMPONENT LIBRARY
 * Drop-in chart components using @nivo/* packages.
 */

interface ChartProps {
  data: any[];
  xAxisKey?: string;
  yAxisKeys?: string[];
  chartType?: 'bar' | 'line' | 'pie' | 'area' | 'column' | 'bubble' | 'scatter';
  height?: number;
  showLegend?: boolean;
  showTooltip?: boolean;
  enableStackMode?: boolean;
  invertAxes?: boolean;
  colors?: string[];
  title?: string;
}

const COLOR_PALETTE = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
  '#6366f1', '#06b6d4', '#8b5cf6', '#14b8a6',
  '#f97316', '#22c55e',
];

const CHART_THEME = {
  background: 'transparent',
  textColor: '#1f2937',
  fontSize: 12,
  axis: {
    domain: { line: { stroke: '#d1d5db', strokeWidth: 1 } },
    ticks: {
      line: { stroke: '#e5e7eb', strokeWidth: 1 },
      text: { fontSize: 11, fill: '#6b7280' },
    },
    legend: { text: { fontSize: 12, fill: '#6b7280' } },
  },
  grid: { line: { stroke: '#f3f4f6', strokeWidth: 1 } },
  legends: { text: { fontSize: 12, fill: '#6b7280' } },
  tooltip: {
    container: {
      background: '#111827',
      color: '#fff',
      fontSize: '12px',
      borderRadius: '4px',
      boxShadow: '0 6px 18px rgba(0,0,0,0.2)',
    },
  },
};

export const BarChart: React.FC<ChartProps> = ({
  data,
  xAxisKey = 'month',
  yAxisKeys = ['sales'],
  height = 400,
  showLegend = true,
  enableStackMode = false,
  invertAxes = false,
  colors = COLOR_PALETTE,
  title,
}) => {
  // Map each yAxisKey to a unique color
  const keyColorMap: { [key: string]: string } = {};
  yAxisKeys.forEach((key, index) => {
    keyColorMap[key] = colors[index % colors.length];
  });

  const colorFunction = (bar: any) => {
    return keyColorMap[bar.id] || colors[0];
  };

  const formatHeader = (key: string) =>
    key.replace(/^[vm]/, '').replace(/([A-Z])/g, ' $1').trim();

  return (
    <div style={{ height: `${height + 60}px` }}>
      {title && (
        <div style={{ padding: '1rem', fontSize: '1.125rem', fontWeight: 600, color: '#1f2937' }}>
          {title}
        </div>
      )}
      <div style={{
        display: 'flex',
        gap: '1.5rem',
        alignItems: 'center',
        padding: '0.75rem 1rem',
        backgroundColor: '#f9fafb',
        borderRadius: '6px',
        marginBottom: '0.75rem',
        flexWrap: 'wrap'
      }}>
        <span style={{
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#6b7280'
        }}>
          Parameters:
        </span>
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          {yAxisKeys.map((key, index) => (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <div
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '3px',
                  backgroundColor: colors[index % colors.length]
                }}
              />
              <span style={{
                fontSize: '0.875rem',
                color: '#1f2937',
                fontWeight: 500
              }}>
                {formatHeader(key)}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ height: `${height}px` }}>
        <ResponsiveBar
          data={data}
          keys={yAxisKeys}
          indexBy={xAxisKey}
          margin={{ top: 20, right: 20, bottom: 100, left: 60 }}
          padding={0.3}
          colors={colorFunction}
          theme={CHART_THEME}
          groupMode={enableStackMode ? 'stacked' : 'grouped'}
          layout={invertAxes ? 'horizontal' : 'vertical'}
          axisBottom={{
            tickSize: 5,
            tickPadding: 8,
            tickRotation: invertAxes ? 0 : -45,
            legend: 'Category',
            legendPosition: 'middle',
          legendOffset: 60
        }}
        axisLeft={{ tickSize: 5, tickPadding: 5 }}
        axisRight={null}
        axisTop={null}
        enableLabel={false}
        legends={[]}
        tooltip={({ id, value, color, data }: any) => (
          <div style={{ padding: '8px 12px', backgroundColor: '#111827', color: '#fff', borderRadius: 4 }}>
            <div><strong>{data[xAxisKey]}:</strong></div>
            <div><strong>{id}:</strong> {value}</div>
          </div>
        )}
        animate={true}
        motionConfig="gentle"
      />
      </div>
    </div>
  );
};

export const ColumnChart: React.FC<ChartProps> = ({
  data,
  xAxisKey = 'month',
  yAxisKeys = ['sales'],
  height = 400,
  showLegend = true,
  enableStackMode = false,
  colors = COLOR_PALETTE,
  title,
}) => {
  // Map each yAxisKey to a unique color
  const keyColorMap: { [key: string]: string } = {};
  yAxisKeys.forEach((key, index) => {
    keyColorMap[key] = colors[index % colors.length];
  });

  const colorFunction = (bar: any) => {
    return keyColorMap[bar.id] || colors[0];
  };

  const formatHeader = (key: string) =>
    key.replace(/^[vm]/, '').replace(/([A-Z])/g, ' $1').trim();

  return (
    <div style={{ height: `${height + 60}px` }}>
      {title && (
        <div style={{ padding: '1rem', fontSize: '1.125rem', fontWeight: 600, color: '#1f2937' }}>
          {title}
        </div>
      )}
      <div style={{
        display: 'flex',
        gap: '1.5rem',
        alignItems: 'center',
        padding: '0.75rem 1rem',
        backgroundColor: '#f9fafb',
        borderRadius: '6px',
        marginBottom: '0.75rem',
        flexWrap: 'wrap'
      }}>
        <span style={{
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#6b7280'
        }}>
          Parameters:
        </span>
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          {yAxisKeys.map((key, index) => (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <div
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '3px',
                  backgroundColor: colors[index % colors.length]
                }}
              />
              <span style={{
                fontSize: '0.875rem',
                color: '#1f2937',
                fontWeight: 500
              }}>
                {formatHeader(key)}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ height: `${height}px` }}>
        <ResponsiveBar
          data={data}
          keys={yAxisKeys}
          indexBy={xAxisKey}
          margin={{ top: 20, right: 20, bottom: 80, left: 80 }}
          padding={0.3}
          colors={colorFunction}
          theme={CHART_THEME}
          groupMode={enableStackMode ? 'stacked' : 'grouped'}
          layout="vertical"
          axisBottom={{ tickSize: 5, tickPadding: 8, tickRotation: -45 }}
          axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            legend: 'Category',
            legendPosition: 'middle',
            legendOffset: -60
          }}
          axisRight={null}
          axisTop={null}
          enableLabel={false}
          legends={[]}
          tooltip={({ id, value, color, data }: any) => (
            <div style={{ padding: '8px 12px', backgroundColor: '#111827', color: '#fff', borderRadius: 4 }}>
              <div><strong>{data[xAxisKey]}:</strong></div>
              <div><strong>{id}:</strong> {value}</div>
            </div>
          )}
          animate={true}
          motionConfig="gentle"
        />
      </div>
    </div>
  );
};

export const LineChart: React.FC<ChartProps> = ({
  data,
  height = 400,
  showLegend = true,
  colors = COLOR_PALETTE,
  title,
}) => {
  // Map each series to a unique color
  const seriesColorMap: { [key: string]: string } = {};
  const seriesList: string[] = [];
  if (Array.isArray(data) && data.length > 0) {
    data.forEach((series: any, index: number) => {
      seriesColorMap[series.id] = colors[index % colors.length];
      seriesList.push(series.id);
    });
  }

  const colorFunction = (series: any) => {
    return seriesColorMap[series.id] || colors[0];
  };

  const formatHeader = (key: string) =>
    key.replace(/^[vm]/, '').replace(/([A-Z])/g, ' $1').trim();

  return (
    <div style={{ height: `${height + 60}px` }}>
      {title && (
        <div style={{ padding: '1rem', fontSize: '1.125rem', fontWeight: 600, color: '#1f2937' }}>
          {title}
        </div>
      )}
      <div style={{
        display: 'flex',
        gap: '1.5rem',
        alignItems: 'center',
        padding: '0.75rem 1rem',
        backgroundColor: '#f9fafb',
        borderRadius: '6px',
        marginBottom: '0.75rem',
        flexWrap: 'wrap'
      }}>
        <span style={{
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#6b7280'
        }}>
          Parameters:
        </span>
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          {seriesList.map((seriesId, index) => (
            <div
              key={seriesId}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <div
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: colors[index % colors.length]
                }}
              />
              <span style={{
                fontSize: '0.875rem',
                color: '#1f2937',
                fontWeight: 500
              }}>
                {formatHeader(seriesId)}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ height: `${height}px` }}>
        <ResponsiveLine
          data={data}
          margin={{ top: 20, right: 20, bottom: 100, left: 60 }}
          xScale={{ type: 'point' }}
          yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: false }}
          colors={colorFunction}
          theme={CHART_THEME}
          axisBottom={{
            tickSize: 5,
            tickPadding: 8,
            tickRotation: -45,
            legend: 'Category',
            legendPosition: 'middle',
            legendOffset: 80
          }}
          axisLeft={{ tickSize: 5, tickPadding: 5 }}
          axisRight={null}
          axisTop={null}
          pointSize={6}
          pointColor="white"
          pointBorderWidth={2}
          pointBorderColor={{ from: 'serieColor' }}
          pointLabelYOffset={-12}
          useMesh={true}
          legends={[]}
          tooltip={({ point }: any) => (
            <div style={{ padding: '8px 12px', backgroundColor: '#111827', color: '#fff', borderRadius: 4 }}>
              <div><strong>{point.serieId}:</strong></div>
              <div><strong>{point.data.x}:</strong> {point.data.y}</div>
            </div>
          )}
          animate={true}
          motionConfig="gentle"
        />
      </div>
    </div>
  );
};

export const AreaChart: React.FC<ChartProps> = ({
  data,
  height = 400,
  showLegend = true,
  colors = COLOR_PALETTE,
  title,
}) => {
  // Map each series to a unique color
  const seriesColorMap: { [key: string]: string } = {};
  const seriesList: string[] = [];
  if (Array.isArray(data) && data.length > 0) {
    data.forEach((series: any, index: number) => {
      seriesColorMap[series.id] = colors[index % colors.length];
      seriesList.push(series.id);
    });
  }

  const colorFunction = (series: any) => {
    return seriesColorMap[series.id] || colors[0];
  };

  const formatHeader = (key: string) =>
    key.replace(/^[vm]/, '').replace(/([A-Z])/g, ' $1').trim();

  return (
    <div style={{ height: `${height + 60}px` }}>
      {title && (
        <div style={{ padding: '1rem', fontSize: '1.125rem', fontWeight: 600, color: '#1f2937' }}>
          {title}
        </div>
      )}
      <div style={{
        display: 'flex',
        gap: '1.5rem',
        alignItems: 'center',
        padding: '0.75rem 1rem',
        backgroundColor: '#f9fafb',
        borderRadius: '6px',
        marginBottom: '0.75rem',
        flexWrap: 'wrap'
      }}>
        <span style={{
          fontSize: '0.875rem',
          fontWeight: 600,
          color: '#6b7280'
        }}>
          Parameters:
        </span>
        <div style={{
          display: 'flex',
          gap: '1rem',
          flexWrap: 'wrap'
        }}>
          {seriesList.map((seriesId, index) => (
            <div
              key={seriesId}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <div
                style={{
                  width: '14px',
                  height: '14px',
                  borderRadius: '3px',
                  backgroundColor: colors[index % colors.length]
                }}
              />
              <span style={{
                fontSize: '0.875rem',
                color: '#1f2937',
                fontWeight: 500
              }}>
                {formatHeader(seriesId)}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div style={{ height: `${height}px` }}>
        <ResponsiveLine
          data={data}
          margin={{ top: 20, right: 20, bottom: 100, left: 60 }}
          xScale={{ type: 'point' }}
          yScale={{ type: 'linear', min: 'auto', max: 'auto', stacked: true }}
          colors={colorFunction}
          theme={CHART_THEME}
          axisBottom={{
            tickSize: 5,
            tickPadding: 8,
            tickRotation: -45,
            legend: 'Category',
            legendPosition: 'middle',
            legendOffset: 80
          }}
          axisLeft={{ tickSize: 5, tickPadding: 5 }}
          axisRight={null}
          axisTop={null}
          pointSize={0}
          pointColor="transparent"
          pointBorderWidth={0}
          areaBaselineValue={0}
          areaBlendMode="multiply"
          fillOpacity={0.5}
          useMesh={false}
          legends={[]}
          tooltip={({ point }: any) => (
            <div style={{ padding: '8px 12px', backgroundColor: '#111827', color: '#fff', borderRadius: 4 }}>
              <div><strong>{point.serieId}:</strong></div>
              <div><strong>{point.data.x}:</strong> {point.data.y}</div>
            </div>
          )}
          animate={true}
          motionConfig="gentle"
        />
      </div>
    </div>
  );
};

export const PieChart: React.FC<any> = ({
  data,
  height = 400,
  showLegend = true,
  colors = COLOR_PALETTE,
  title,
  isDoughnut = false,
}) => (
  <div style={{ height: `${height}px` }}>
    {title && (
      <div style={{ padding: '1rem', fontSize: '1.125rem', fontWeight: 600, color: '#1f2937' }}>
        {title}
      </div>
    )}
    <ResponsivePie
      data={data}
      margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
      innerRadius={isDoughnut ? 0.5 : 0}
      padAngle={0.7}
      cornerRadius={3}
      colors={colors}
      theme={CHART_THEME}
      activeOuterRadiusOffset={8}
      borderWidth={1}
      borderColor={{ from: 'color', modifiers: [['darker', 0.2]] }}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor="#6b7280"
      arcLinkLabelsThickness={2}
      arcLinkLabelsStraightLength={12}
      arcLabelsSkipAngle={10}
      arcLabelsTextColor={{ from: 'color', modifiers: [['darker', 2]] }}
      legends={
        showLegend
          ? [
              {
                anchor: 'bottom',
                direction: 'row',
                justify: false,
                translateX: 0,
                translateY: 56,
                itemsSpacing: 0,
                itemWidth: 100,
                itemHeight: 18,
                itemTextColor: '#999',
                itemDirection: 'left-to-right',
                itemOpacity: 1,
                symbolSize: 18,
                symbolShape: 'circle',
              },
            ]
          : []
      }
      tooltip={({ datum }: any) => (
        <div style={{ padding: '8px 12px', backgroundColor: '#111827', color: '#fff', borderRadius: 4 }}>
          <div><strong>{datum.label}:</strong> {datum.value}</div>
          <div style={{ fontSize: '0.85rem', marginTop: '4px' }}>
            Percentage: {((datum.value / data.reduce((sum: number, d: any) => sum + d.value, 0)) * 100).toFixed(2)}%
          </div>
        </div>
      )}
      animate={true}
      motionConfig="gentle"
    />
  </div>
);


export const ScatterChart: React.FC<any> = ({
  data,
  height = 400,
  showLegend = true,
  colors = COLOR_PALETTE,
  title,
}) => (
  <div style={{ height: `${height}px` }}>
    {title && (
      <div style={{ padding: '1rem', fontSize: '1.125rem', fontWeight: 600, color: '#1f2937' }}>
        {title}
      </div>
    )}
    <ResponsiveScatterPlot
      data={data}
      margin={{ top: 20, right: 20, bottom: 50, left: 60 }}
      xScale={{ type: 'linear', min: 'auto', max: 'auto' }}
      yScale={{ type: 'linear', min: 'auto', max: 'auto' }}
      colors={colors}
      theme={CHART_THEME}
      blendMode="multiply"
      axisBottom={{ tickSize: 5, tickPadding: 5, tickRotation: 0 }}
      axisLeft={{ tickSize: 5, tickPadding: 5, tickRotation: 0 }}
      axisRight={null}
      axisTop={null}
      legends={
        showLegend
          ? [
              {
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 130,
                translateY: 0,
                itemsSpacing: 5,
                itemWidth: 100,
                itemHeight: 12,
                symbolSize: 12,
                symbolShape: 'circle',
              },
            ]
          : []
      }
      tooltip={({ node }: any) => (
        <div style={{ padding: '8px 12px', backgroundColor: '#111827', color: '#fff', borderRadius: 4 }}>
          <strong>x:</strong> {node.data.x} <br />
          <strong>y:</strong> {node.data.y}
        </div>
      )}
      animate={true}
      motionConfig="gentle"
    />
  </div>
);
