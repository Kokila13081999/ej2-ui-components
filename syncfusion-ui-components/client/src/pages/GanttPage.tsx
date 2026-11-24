import '@syncfusion/ej2-tailwind3-theme/styles/gantt/index-lite.css';
import { useMemo } from 'react';
import { ColumnDirective, ColumnsDirective, DayMarkers, GanttComponent, Inject, Selection, CriticalPath } from '@syncfusion/ej2-react-gantt';
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
    {
  TaskID: 1,
  TaskName: 'Chennai DC rollout',
  StartDate: d(0),
  BaselineStartDate: d(0),
  BaselineEndDate: d(35),
  subtasks: [
    {
      TaskID: 2,
      TaskName: 'Site survey',
      StartDate: d(0),
      Duration: 4,
      Progress: 100,
      ResourceInfo: [{ ResourceId: 1, ResourceUnit: 100 }],
      BaselineStartDate: d(0),
      BaselineEndDate: d(4)
    },
    {
      TaskID: 3,
      TaskName: 'Lease & permits',
      StartDate: d(4),
      Duration: 6,
      Progress: 100,
      Predecessor: '2FS',
      ResourceInfo: [{ ResourceId: 1, ResourceUnit: 50 }],
      BaselineStartDate: d(4),
      BaselineEndDate: d(10)
    },
    {
      TaskID: 4,
      TaskName: 'Racking installation',
      StartDate: d(10),
      Duration: 8,
      Progress: 60,
      Predecessor: '3FS',
      ResourceInfo: [
        { ResourceId: 1, ResourceUnit: 100 },
        { ResourceId: 2, ResourceUnit: 100 }
      ],
      BaselineStartDate: d(8),
      BaselineEndDate: d(14)
    }
  ]
},
{
  TaskID: 5,
  TaskName: 'Systems',
  StartDate: d(6),
  BaselineStartDate: d(6),
  BaselineEndDate: d(23),
  subtasks: [
    {
      TaskID: 6,
      TaskName: 'WMS configuration',
      StartDate: d(6),
      Duration: 10,
      Progress: 70,
      ResourceInfo: [{ ResourceId: 3, ResourceUnit: 100 }],
      BaselineStartDate: d(6),
      BaselineEndDate: d(14)
    },
    {
      TaskID: 7,
      TaskName: 'ERP integration',
      StartDate: d(16),
      Duration: 7,
      Progress: 20,
      Predecessor: '6FS',
      ResourceInfo: [
        { ResourceId: 3, ResourceUnit: 50 },
        { ResourceId: 4, ResourceUnit: 100 }
      ],
      BaselineStartDate: d(14),
      BaselineEndDate: d(20)
    },
    {
      TaskID: 8,
      TaskName: 'Barcode & RFID setup',
      StartDate: d(18),
      Duration: 5,
      Progress: 0,
      Predecessor: '4FS',
      ResourceInfo: [
        { ResourceId: 2, ResourceUnit: 50 },
        { ResourceId: 5, ResourceUnit: 100 }
      ],
      BaselineStartDate: d(16),
      BaselineEndDate: d(21)
    }
  ]
},
{
  TaskID: 9,
  TaskName: 'People & go-live',
  StartDate: d(20),
  BaselineStartDate: d(18),
  BaselineEndDate: d(33),
  subtasks: [
    {
      TaskID: 10,
      TaskName: 'Hire operators',
      StartDate: d(12),
      Duration: 12,
      Progress: 40,
      ResourceInfo: [{ ResourceId: 6, ResourceUnit: 100 }],
      BaselineStartDate: d(10),
      BaselineEndDate: d(20)
    },
    {
      TaskID: 11,
      TaskName: 'Training',
      StartDate: d(24),
      Duration: 5,
      Progress: 0,
      Predecessor: '10FS,7FS',
      ResourceInfo: [
        { ResourceId: 6, ResourceUnit: 50 },
        { ResourceId: 7, ResourceUnit: 100 }
      ],
      BaselineStartDate: d(20),
      BaselineEndDate: d(25)
    },
    {
      TaskID: 12,
      TaskName: 'Pilot inbound shipments',
      StartDate: d(29),
      Duration: 4,
      Progress: 0,
      Predecessor: '11FS,8FS',
      ResourceInfo: [
        { ResourceId: 2, ResourceUnit: 100 },
        { ResourceId: 7, ResourceUnit: 50 }
      ],
      BaselineStartDate: d(25),
      BaselineEndDate: d(29)
    },
    {
      TaskID: 13,
      TaskName: 'Go-live',
      StartDate: d(33),
      Duration: 0,
      Progress: 0,
      Predecessor: '12FS',
      ResourceInfo: [
        { ResourceId: 2, ResourceUnit: 100 },
        { ResourceId: 4, ResourceUnit: 50 }
      ],
      BaselineStartDate: d(30),
      BaselineEndDate: d(30)
    }
  ]
}
  ];
}

export default function GanttPage() {
  const tasks = useMemo(buildTasks, []);
  const resources = [
  { ResourceId: 1, ResourceName: 'Civil Engineering Team' },
  { ResourceId: 2, ResourceName: 'Warehouse Operations Team' },
  { ResourceId: 3, ResourceName: 'WMS Consultants' },
  { ResourceId: 4, ResourceName: 'ERP Integration Team' },
  { ResourceId: 5, ResourceName: 'RFID Specialists' },
  { ResourceId: 6, ResourceName: 'HR Team' },
  { ResourceId: 7, ResourceName: 'Training Team' }
];
const resourceFields = {
  id: 'ResourceId',
  name: 'ResourceName',
  unit: 'ResourceUnit'
};
  return (
    <div className="page">
      <PageHeader module={MODULE} />
      <div className="card">
        <GanttComponent
          id="scm-gantt"
          dataSource={tasks}
          height={Math.max(420, window.innerHeight - 260)}
          taskFields={{ id: 'TaskID', name: 'TaskName', startDate: 'StartDate', duration: 'Duration', progress: 'Progress', dependency: 'Predecessor', child: 'subtasks',baselineStartDate: 'BaselineStartDate',baselineEndDate: 'BaselineEndDate',resourceInfo: 'ResourceInfo',type: 'taskType' }}
          treeColumnIndex={1}
          splitterSettings={{ position: '38%' }}
          labelSettings={{ rightLabel: 'TaskName' }}
          highlightWeekends
          timelineSettings={{ topTier: { unit: 'Week', format: 'dd MMM' }, bottomTier: { unit: 'Day', format: 'd' }, viewStartDate: new Date("11/01/2026"),
            viewEndDate: new Date("12/28/2026") }}
          gridLines="Both"
          rowHeight={40}
          enableCriticalPath={true}
          renderBaseline={true}
          workUnit="Hour"
          taskType="FixedWork"
          resourceFields={resourceFields}
          resources={resources}
        >
          <ColumnsDirective>
            <ColumnDirective field="TaskID" headerText="ID" width={60} />
            <ColumnDirective field="TaskName" headerText="Task" width={220} />
            <ColumnDirective field="StartDate" headerText="Start" width={100} format="dd-MMM" />
            <ColumnDirective field="Duration" headerText="Days" width={95} />
            <ColumnDirective field="Progress" headerText="%" width={70} />
            <ColumnDirective field="ResourceInfo" headerText="Resources" width={150} />
            <ColumnDirective field="taskType" headerText="Task Type" width={150} />
          </ColumnsDirective>
          <Inject services={[Selection, DayMarkers, CriticalPath]} />
        </GanttComponent>
      </div>
    </div>
  );
}