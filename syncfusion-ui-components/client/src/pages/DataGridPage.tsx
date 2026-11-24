import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ColumnDirective, ColumnsDirective, DomVirtualization, Filter, GridComponent, Inject, Sort, VirtualScroll,
  type ActionEventArgs, type DataStateChangeEventArgs, type QueryCellInfoEventArgs,
} from '@syncfusion/ej2-react-grids';
import PageHeader from '../components/PageHeader';
import { MODULES } from '../components/modules';
import { getDistinct, getOrders } from '../services/scmService';

const MODULE = MODULES.find((m) => m.key === 'grid')!;
const PAGE_SIZE = 100;
const fmt = new Intl.NumberFormat('en-IN');

interface Metrics { count: number; clientMs: number; serverMs: number; requests: number; action: string }

type FilterChoiceAction = {
  requestType?: string;
  filterModel?: { options?: { column?: { field?: string } } };
};

const STATUS_CLASS: Record<string, string> = {
  Delivered: 'ok', Shipped: 'info', 'In Transit': 'info', Processing: 'neutral', Delayed: 'warn', Cancelled: 'bad',
};

type FilterCol = { field?: string; operator?: string; value?: unknown; predicate?: string; matchCase?: boolean };

/** Grid's active filters on every column except `field`, as a serialised predicate list. */
function otherColumnFilters(grid: GridComponent | null, field: string) {
  const cols = ((grid?.filterSettings?.columns ?? []) as FilterCol[]).filter((c) => c.field && c.field !== field);
  const byField = new Map<string, FilterCol[]>();
  cols.forEach((c) => byField.set(c.field!, [...(byField.get(c.field!) ?? []), c]));
  return [...byField.values()].map((group) => ({
    isComplex: true,
    condition: group.some((c) => c.predicate === 'or') ? 'or' : 'and',
    predicates: group.map((c) => ({
      isComplex: false, field: c.field, operator: c.operator, value: c.value, ignoreCase: !c.matchCase,
    })),
  }));
}

export default function DataGridPage() {
  const gridRef = useRef<GridComponent | null>(null);
  const requestSeq = useRef(0);
  const queryKey = useRef('');
  const filterColumn = useRef<string>('');
  const [metrics, setMetrics] = useState<Metrics>({ count: 0, clientMs: 0, serverMs: 0, requests: 0, action: 'initial' });
  const [error, setError] = useState('');
  const [gridHeight, setGridHeight] = useState(() => Math.max(320, window.innerHeight - 300));

  useEffect(() => {
    const onResize = () => setGridHeight(Math.max(320, window.innerHeight - 300));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /** Fetches one block from the server and hands it to the grid as { result, count }. */
  const loadData = useCallback(async (state: DataStateChangeEventArgs) => {
    const seq = ++requestSeq.current;
    const key = JSON.stringify([state.where ?? [], state.sorted ?? []]);
    queryKey.current = key;
    const t0 = performance.now();
    try {
      const res = await getOrders(state);
      const grid = gridRef.current;
      // Drop out-of-order responses. A virtual-scroll block may still land late, but only
      // if it belongs to the current sort/filter state.
      const action = (state.action as { requestType?: string } | undefined)?.requestType ?? 'initial';
      const isLatest = seq === requestSeq.current;
      if (!grid || (!isLatest && !(action === 'virtualscroll' && key === queryKey.current))) return;
      grid.dataSource = { result: res.result, count: res.count };
      setError('');
      setMetrics((m) => ({
        count: res.count, clientMs: Math.round(performance.now() - t0), serverMs: res.serverMs,
        requests: m.requests + 1, action,
      }));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load data');
    }
  }, []);

  // Initial load (custom binding does not raise dataStateChange on first render).
  useEffect(() => {
    loadData({ skip: 0, take: PAGE_SIZE * 2 } as DataStateChangeEventArgs);
  }, [loadData]);

  /** Custom binding: every sort / filter / scroll raises this with the grid's query state. */
  const onDataStateChange = (state: DataStateChangeEventArgs) => {
    const action = state.action as FilterChoiceAction | undefined;
    const type = action?.requestType;
    if (type === 'filterchoicerequest' || type === 'filterSearchBegin' || type === 'stringfilterrequest') {
      const field = action?.filterModel?.options?.column?.field || filterColumn.current;
      // The grid re-applies the other columns' filters to the returned list, so send them
      // to the server too: the checkbox list then shows only values that still exist.
      const where = [...otherColumnFilters(gridRef.current, field), ...((state.where as unknown[]) ?? [])];
      getDistinct(field, where, state.take || 1000)
        .then((rows) => state.dataSource?.(rows))
        .catch(() => state.dataSource?.([]));
      return;
    }
    loadData(state);
  };

  const onActionBegin = (args: ActionEventArgs) => {
    const a = args as unknown as { requestType?: string; columnName?: string };
    if (a.requestType === 'filterBeforeOpen' || a.requestType === 'filterbeforeopen') filterColumn.current = a.columnName ?? '';
  };

  const onQueryCellInfo = (args: QueryCellInfoEventArgs) => {
    if (args.column?.field === 'Status' && args.cell) {
      const v = (args.data as { Status: string }).Status;
      (args.cell as HTMLElement).innerHTML = `<span class="badge ${STATUS_CLASS[v] ?? 'neutral'}">${v}</span>`;
    }
  };

  const clearAll = () => {
    const g = gridRef.current;
    if (!g) return;
    g.clearFiltering();
    g.clearSorting();
  };

  const load = (args: any) => {
    args.enableSeamlessScrolling = true; 
  }

  return (
    <div className="page">
      <PageHeader
        module={MODULE}
        actions={<button className="btn-secondary" onClick={clearAll} id="clear-btn">Clear sort &amp; filters</button>}
      />

      <div className="stats-bar" data-testid="grid-stats">
        <span><b>{fmt.format(metrics.count)}</b> records</span>
        <span>Last request: <b>{metrics.action}</b></span>
        <span>Round trip <b>{metrics.clientMs} ms</b></span>
        <span>Server query <b>{metrics.serverMs} ms</b></span>
        <span>Requests <b>{metrics.requests}</b></span>
        {error && <span className="form-error inline">{error}</span>}
      </div>

      <div className="card grid-card">
        <GridComponent
          ref={gridRef}
          height={gridHeight}
          rowHeight={36}
          load={load}
          enableVirtualization
          enableDomVirtualization={true}
          domVirtualizationSettings={{ rowBuffer: 10 }}
          pageSettings={{ pageSize: PAGE_SIZE }}
          allowSorting
          allowMultiSorting
          allowFiltering
          filterSettings={{ type: 'Excel' }}
          enableHover={false}
          dataStateChange={onDataStateChange}
          actionBegin={onActionBegin}
          queryCellInfo={onQueryCellInfo}
        >
          <ColumnsDirective>
            <ColumnDirective field="OrderID" headerText="Order ID" isPrimaryKey width={110} textAlign="Right" type="number" />
            <ColumnDirective field="OrderDate" headerText="Order Date" width={130} type="date" format="dd-MMM-yyyy" />
            <ColumnDirective field="Supplier" headerText="Supplier" width={170} />
            <ColumnDirective field="Category" headerText="Category" width={150} />
            <ColumnDirective field="Product" headerText="Product" width={150} />
            <ColumnDirective field="Region" headerText="Region" width={140} />
            <ColumnDirective field="Warehouse" headerText="Warehouse" width={150} />
            <ColumnDirective field="Quantity" headerText="Qty" width={100} textAlign="Right" type="number" format="N0" />
            <ColumnDirective field="UnitPrice" headerText="Unit Price" width={120} textAlign="Right" type="number" format="C2" />
            <ColumnDirective field="Amount" headerText="Amount" width={140} textAlign="Right" type="number" format="C2" />
            <ColumnDirective field="Status" headerText="Status" width={130} />
            <ColumnDirective field="ShipMode" headerText="Ship Mode" width={120} />
            <ColumnDirective field="Priority" headerText="Priority" width={110} />
            <ColumnDirective field="DeliveryDate" headerText="Delivery Date" width={140} type="date" format="dd-MMM-yyyy" />
          </ColumnsDirective>
          <Inject services={[VirtualScroll, Sort, Filter, DomVirtualization]} />
        </GridComponent>
      </div>
    </div>
  );
}
