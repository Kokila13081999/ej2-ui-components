import '@syncfusion/ej2-tailwind3-theme/styles/diagram/index.css';
import { useMemo } from 'react';
import { DiagramComponent, type ConnectorModel, type NodeModel } from '@syncfusion/ej2-react-diagrams';
import PageHeader from '../components/PageHeader';
import { MODULES } from '../components/modules';

const MODULE = MODULES.find((m) => m.key === 'diagram')!;

const STAGES: { id: string; text: string; x: number; y: number; color: string }[] = [
  { id: 'supplierA', text: 'Raw material\nsuppliers', x: 110, y: 120, color: '#2563eb' },
  { id: 'supplierB', text: 'Component\nsuppliers', x: 110, y: 300, color: '#2563eb' },
  { id: 'plant', text: 'Manufacturing\nplant', x: 340, y: 210, color: '#7c3aed' },
  { id: 'qa', text: 'Quality\ninspection', x: 560, y: 210, color: '#ea580c' },
  { id: 'warehouse', text: 'Central\nwarehouse', x: 780, y: 210, color: '#0891b2' },
  { id: 'dc1', text: 'Regional DC\n(Chennai)', x: 1000, y: 110, color: '#16a34a' },
  { id: 'dc2', text: 'Regional DC\n(Rotterdam)', x: 1000, y: 310, color: '#16a34a' },
  { id: 'retail', text: 'Retail\nstores', x: 1220, y: 110, color: '#db2777' },
  { id: 'customer', text: 'End\ncustomers', x: 1220, y: 310, color: '#db2777' },
];

const LINKS: [string, string, string?][] = [
  ['supplierA', 'plant', 'Sea / Rail'], ['supplierB', 'plant', 'Road'], ['plant', 'qa'], ['qa', 'warehouse', 'Pass'],
  ['warehouse', 'dc1', 'Road'], ['warehouse', 'dc2', 'Sea'], ['dc1', 'retail'], ['dc2', 'customer', 'Last mile'],
  ['dc1', 'customer', 'E-com'],
];

export default function DiagramPage() {
  const nodes = useMemo<NodeModel[]>(() => STAGES.map((s) => ({
    id: s.id, offsetX: s.x, offsetY: s.y, width: 150, height: 70,
    shape: { type: 'Basic', shape: 'Rectangle', cornerRadius: 10 },
    ports: [
      { id: 'in', offset: { x: 0, y: 0.5 } },
      { id: 'out', offset: { x: 1, y: 0.5 } },
    ],
    style: { fill: `${s.color}1a`, strokeColor: s.color, strokeWidth: 2 },
    annotations: [{ content: s.text, style: { color: '#0f172a', fontSize: 13, bold: true } }],
  })), []);

  const connectors = useMemo<ConnectorModel[]>(() => LINKS.map(([from, to, label], i) => ({
    id: `c${i}`, sourceID: from, targetID: to, sourcePortID: 'out', targetPortID: 'in', type: 'Orthogonal', cornerRadius: 8,
    style: { strokeColor: '#64748b', strokeWidth: 1.5 },
    targetDecorator: { shape: 'Arrow', style: { fill: '#64748b', strokeColor: '#64748b' } },
    annotations: label ? [{ content: label, style: { fontSize: 11, color: '#475569', fill: '#ffffff' } }] : [],
  })), []);

  return (
    <div className="page">
      <PageHeader module={MODULE} />
      <div className="card">
        <DiagramComponent
          id="scm-diagram"
          width="100%"
          height={Math.max(440, window.innerHeight - 260)}
          nodes={nodes}
          connectors={connectors}
          snapSettings={{ constraints: 0 }}
          scrollSettings={{ scrollLimit: 'Diagram' }}
          created={function (this: { fitToPage: (o: object) => void }) { this.fitToPage({ mode: 'Width', region: 'Content', margin: { left: 20, right: 20 } }); }}
        />
      </div>
    </div>
  );
}
