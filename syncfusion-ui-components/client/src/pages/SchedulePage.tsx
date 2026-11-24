import '@syncfusion/ej2-tailwind3-theme/styles/schedule/index-lite.css';
import { useMemo } from 'react';
import {
  Agenda, Day, Inject, Month, ResourceDirective, ResourcesDirective, ScheduleComponent, ViewDirective,
  ViewsDirective, Week, WorkWeek,
} from '@syncfusion/ej2-react-schedule';
import PageHeader from '../components/PageHeader';
import { MODULES } from '../components/modules';

const MODULE = MODULES.find((m) => m.key === 'schedule')!;

const TYPES = [
  { Id: 1, Text: 'Inbound', Color: '#2563eb' },
  { Id: 2, Text: 'Outbound', Color: '#16a34a' },
  { Id: 3, Text: 'Inspection', Color: '#ea580c' },
  { Id: 4, Text: 'Maintenance', Color: '#7c3aed' },
];

// Dummy shipment calendar around the current week.
function buildEvents() {
  const monday = new Date();
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const at = (day: number, h: number, m = 0) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + day, h, m);
  const items: [number, number, number, number, string, string, number][] = [
    [0, 8, 0, 2, 'Steel coil delivery – Crestline Metals', 'Dock 2, Chennai DC', 1],
    [0, 11, 30, 1.5, 'Dispatch: retail replenishment', 'Chennai DC', 2],
    [1, 9, 0, 3, 'Container unload – Sea freight', 'Rotterdam DC', 1],
    [1, 14, 0, 1, 'QA inspection: vaccine vials', 'Cold room', 3],
    [2, 7, 0, 2, 'Express air dispatch – electronics', 'Singapore DC', 2],
    [2, 13, 0, 2, 'Forklift maintenance', 'Dallas DC', 4],
    [3, 10, 0, 2.5, 'Inbound: polymer resin', 'Frankfurt DC', 1],
    [3, 15, 0, 1.5, 'Outbound: automotive parts', 'Mexico City DC', 2],
    [4, 9, 30, 1, 'Supplier audit – Fusion Pharma', 'Dubai DC', 3],
    [4, 12, 0, 3, 'Weekly dispatch wave', 'All DCs', 2],
    [7, 8, 0, 2, 'Inbound: rice bags', 'Sao Paulo DC', 1],
    [8, 10, 0, 2, 'Conveyor maintenance', 'Chennai DC', 4],
    [-3, 9, 0, 2, 'Inbound: cotton apparel', 'Shanghai DC', 1],
  ];
  return items.map(([day, h, m, hrs, subject, location, typeId], i) => {
    const start = at(day, h, m);
    return { Id: i + 1, Subject: subject, Location: location, StartTime: start, EndTime: new Date(start.getTime() + hrs * 3600000), TypeId: typeId };
  });
}

export default function SchedulePage() {
  const events = useMemo(buildEvents, []);
  return (
    <div className="page">
      <PageHeader module={MODULE} />
      <div className="card">
        <ScheduleComponent
          id="scm-schedule"
          height={Math.max(450, window.innerHeight - 260)}
          currentView="Week"
          startHour="06:00"
          endHour="20:00"
          workHours={{ start: '08:00', end: '18:00' }}
          eventSettings={{ dataSource: events }}
        >
          <ResourcesDirective>
            <ResourceDirective field="TypeId" title="Type" name="Types" dataSource={TYPES} textField="Text" idField="Id" colorField="Color" />
          </ResourcesDirective>
          <ViewsDirective>
            <ViewDirective option="Day" />
            <ViewDirective option="Week" />
            <ViewDirective option="WorkWeek" />
            <ViewDirective option="Month" />
            <ViewDirective option="Agenda" />
          </ViewsDirective>
          <Inject services={[Day, Week, WorkWeek, Month, Agenda]} />
        </ScheduleComponent>
      </div>
    </div>
  );
}
