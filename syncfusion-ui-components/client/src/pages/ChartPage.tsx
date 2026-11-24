import { useEffect, useState } from 'react';
import {
  AccumulationChartComponent, AccumulationDataLabel, AccumulationLegend, AccumulationSeriesCollectionDirective,
  AccumulationSeriesDirective, AccumulationTooltip, Category, ChartComponent, ColumnSeries, Crosshair, DateTime, Inject,
  Legend, PieSeries, SeriesCollectionDirective, SeriesDirective, SplineSeries, Tooltip,
} from '@syncfusion/ej2-react-charts';
import PageHeader from '../components/PageHeader';
import { MODULES } from '../components/modules';
import { PageLoader } from '../layout/AppLayout';
import { getSummary, type Summary } from '../services/scmService';

const MODULE = MODULES.find((m) => m.key === 'chart')!;

export default function ChartPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getSummary().then(setSummary).catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, []);

  if (error) return <div className="page"><PageHeader module={MODULE} /><div className="form-error">{error}</div></div>;
  if (!summary) return <div className="page"><PageHeader module={MODULE} /><PageLoader label="Loading chart data…" /></div>;

  const monthly = summary.monthly.map((m) => ({ x: new Date(m.month), y: Math.round(m.amount / 1e6 * 10) / 10 }));
  const statusData = summary.byStatus.map((s) => ({ x: s.status, y: s.count }));
  const category = summary.byCategory.map((c) => ({ x: c.category, y: Math.round(c.amount / 1e6) }));

  return (
    <div className="page">
      <PageHeader module={MODULE} />
      <div className="chart-layout">
        <div className="card chart-card wide">
          <ChartComponent
            id="monthly-chart"
            theme="Tailwind3"
            title="Monthly order value (USD millions)"
            primaryXAxis={{ valueType: 'DateTime', labelFormat: 'MMM yy', intervalType: 'Months', interval: 3, majorGridLines: { width: 0 } }}
            primaryYAxis={{ labelFormat: '${value}M', lineStyle: { width: 0 } }}
            tooltip={{ enable: true, shared: true, format: '${point.x}: <b>${point.y}M</b>' }}
            crosshair={{ enable: true, lineType: 'Vertical' }}
            chartArea={{ border: { width: 0 } }}
            height="340px"
          >
            <Inject services={[SplineSeries, DateTime, Tooltip, Crosshair, Legend]} />
            <SeriesCollectionDirective>
              <SeriesDirective dataSource={monthly} xName="x" yName="y" type="Spline" name="Order value" width={2.5} marker={{ visible: true, width: 6, height: 6 }} />
            </SeriesCollectionDirective>
          </ChartComponent>
        </div>

        <div className="card chart-card">
          <ChartComponent
            id="category-chart"
            theme="Tailwind3"
            title="Order value by category (USD millions)"
            primaryXAxis={{ valueType: 'Category', majorGridLines: { width: 0 }, labelIntersectAction: 'Rotate45' }}
            primaryYAxis={{ labelFormat: '${value}M', lineStyle: { width: 0 } }}
            tooltip={{ enable: true }}
            chartArea={{ border: { width: 0 } }}
            height="340px"
          >
            <Inject services={[ColumnSeries, Category, Tooltip]} />
            <SeriesCollectionDirective>
              <SeriesDirective dataSource={category} xName="x" yName="y" type="Column" name="Value" cornerRadius={{ topLeft: 4, topRight: 4 }} />
            </SeriesCollectionDirective>
          </ChartComponent>
        </div>

        <div className="card chart-card">
          <AccumulationChartComponent
            id="status-chart"
            theme="Tailwind3"
            title="Orders by status"
            legendSettings={{ visible: true, position: 'Bottom' }}
            tooltip={{ enable: true, format: '${point.x}: <b>${point.y}</b>' }}
            height="340px"
          >
            <Inject services={[PieSeries, AccumulationLegend, AccumulationTooltip, AccumulationDataLabel]} />
            <AccumulationSeriesCollectionDirective>
              <AccumulationSeriesDirective dataSource={statusData} xName="x" yName="y" innerRadius="55%" dataLabel={{ visible: true, position: 'Outside', name: 'x' }} />
            </AccumulationSeriesCollectionDirective>
          </AccumulationChartComponent>
        </div>
      </div>
    </div>
  );
}
