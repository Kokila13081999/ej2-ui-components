import '@syncfusion/ej2-tailwind3-theme/styles/gantt/index-lite.css';
import { useMemo } from 'react';
import { ColumnDirective, ColumnsDirective, DayMarkers, GanttComponent, Inject, Selection } from '@syncfusion/ej2-react-gantt';
import PageHeader from '../components/PageHeader';
import { MODULES } from '../components/modules';

const MODULE = MODULES.find((m) => m.key === 'gantt')!;

// Dummy project plan: new distribution centre rollout.
function buildTasks() {
  const base = new Date();
  base.setDate(base.getDate() - 14);
  base.setHours(0, 0, 0, 0);
  const d = (offset: number) => new Date(base.getTime() + offset * 86400000);
  return [
    { TaskID: 1, TaskName: 'Chennai DC rollout', StartDate: d(0), subtasks: [
      { TaskID: 2, TaskName: 'Site survey', StartDate: d(0), Duration: 4, Progress: 100 },
      { TaskID: 3, TaskName: 'Lease & permits', StartDate: d(4), Duration: 6, Progress: 100, Predecessor: '2FS' },
      { TaskID: 4, TaskName: 'Racking installation', StartDate: d(10), Duration: 8, Progress: 60, Predecessor: '3FS' },
    ] },
    { TaskID: 5, TaskName: 'Systems', StartDate: d(6), subtasks: [
      { TaskID: 6, TaskName: 'WMS configuration', StartDate: d(6), Duration: 10, Progress: 70 },
      { TaskID: 7, TaskName: 'ERP integration', StartDate: d(16), Duration: 7, Progress: 20, Predecessor: '6FS' },
      { TaskID: 8, TaskName: 'Barcode & RFID setup', StartDate: d(18), Duration: 5, Progress: 0, Predecessor: '4FS' },
    ] },
    { TaskID: 9, TaskName: 'People & go-live', StartDate: d(20), subtasks: [
      { TaskID: 10, TaskName: 'Hire operators', StartDate: d(12), Duration: 12, Progress: 40 },
      { TaskID: 11, TaskName: 'Training', StartDate: d(24), Duration: 5, Progress: 0, Predecessor: '10FS,7FS' },
      { TaskID: 12, TaskName: 'Pilot inbound shipments', StartDate: d(29), Duration: 4, Progress: 0, Predecessor: '11FS,8FS' },
      { TaskID: 13, TaskName: 'Go-live', StartDate: d(33), Duration: 0, Progress: 0, Predecessor: '12FS' },
    ] },
  ];
}

export default function GanttPage() {
  const tasks = useMemo(buildTasks, []);
  return (
    <div className="page">
      <PageHeader module={MODULE} />
      <div className="card">
        <GanttComponent
          id="scm-gantt"
          dataSource={tasks}
          height={Math.max(420, window.innerHeight - 260)}
          taskFields={{ id: 'TaskID', name: 'TaskName', startDate: 'StartDate', duration: 'Duration', progress: 'Progress', dependency: 'Predecessor', child: 'subtasks' }}
          treeColumnIndex={1}
          splitterSettings={{ position: '38%' }}
          labelSettings={{ rightLabel: 'TaskName' }}
          highlightWeekends
          timelineSettings={{ topTier: { unit: 'Week', format: 'dd MMM' }, bottomTier: { unit: 'Day', format: 'd' } }}
          projectStartDate={tasks[0].StartDate}
          gridLines="Both"
          rowHeight={40}
        >
          <ColumnsDirective>
            <ColumnDirective field="TaskID" headerText="ID" width={60} />
            <ColumnDirective field="TaskName" headerText="Task" width={220} />
            <ColumnDirective field="StartDate" headerText="Start" width={100} format="dd-MMM" />
            <ColumnDirective field="Duration" headerText="Days" width={95} />
            <ColumnDirective field="Progress" headerText="%" width={70} />
          </ColumnsDirective>
          <Inject services={[Selection, DayMarkers]} />
        </GanttComponent>
      </div>
    </div>
  );
}
