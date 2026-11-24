// Deterministic generator for 1,00,000 Supply Chain Management (SCM) order records.
// Seeded so every server start produces the same data (repeatable demos).

const TOTAL_RECORDS = Number(process.env.RECORD_COUNT || 100000);

function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const REGIONS = {
  'North America': ['Chicago DC', 'Dallas DC', 'Toronto DC'],
  Europe: ['Rotterdam DC', 'Frankfurt DC', 'Warsaw DC'],
  'Asia Pacific': ['Chennai DC', 'Singapore DC', 'Shanghai DC'],
  'Middle East': ['Dubai DC', 'Riyadh DC', 'Doha DC'],
  'Latin America': ['Sao Paulo DC', 'Mexico City DC', 'Bogota DC'],
};

const CATALOG = {
  Electronics: [['Laptop', 820], ['Monitor', 210], ['Router', 95], ['Smartphone', 540], ['Headset', 60]],
  'Raw Materials': [['Steel Coil', 1150], ['Aluminium Sheet', 640], ['Copper Wire', 380], ['Polymer Resin', 220], ['Glass Panel', 175]],
  Automotive: [['Brake Pad', 45], ['Tyre', 120], ['Battery Pack', 980], ['Spark Plug', 8], ['Wiper Blade', 14]],
  Pharmaceuticals: [['Vaccine Vials', 310], ['Syringes', 22], ['Antibiotics', 140], ['Insulin Pens', 260], ['Test Kits', 85]],
  'Food & Beverage': [['Coffee Beans', 30], ['Rice Bags', 18], ['Olive Oil', 42], ['Bottled Water', 6], ['Frozen Seafood', 75]],
  Apparel: [['Cotton T-Shirt', 9], ['Denim Jeans', 28], ['Safety Boots', 65], ['Winter Jacket', 88], ['Work Gloves', 7]],
};

const SUPPLIERS = [
  'Apex Industrial', 'BlueRiver Logistics', 'Crestline Metals', 'Delta Components', 'Evergreen Foods',
  'Fusion Pharma', 'Global Textiles', 'Horizon Electronics', 'Ironclad Auto', 'Jade Sourcing',
  'Keystone Supply', 'Lumen Tech', 'Meridian Traders', 'Nova Polymers', 'Orion Freight',
  'Pinnacle Goods', 'Quantum Parts', 'Redwood Packaging', 'Summit Distributors', 'Titan Manufacturing',
];

const STATUSES = ['Delivered', 'Shipped', 'In Transit', 'Processing', 'Delayed', 'Cancelled'];
const STATUS_WEIGHTS = [0.46, 0.16, 0.14, 0.12, 0.08, 0.04];
const SHIP_MODES = ['Sea', 'Air', 'Road', 'Rail'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

function pickWeighted(r, items, weights) {
  let acc = 0;
  for (let i = 0; i < items.length; i++) {
    acc += weights[i];
    if (r < acc) return items[i];
  }
  return items[items.length - 1];
}

function generate() {
  const rand = mulberry32(20261124);
  const regionNames = Object.keys(REGIONS);
  const categories = Object.keys(CATALOG);
  const start = Date.UTC(2024, 0, 1);
  const span = Date.UTC(2026, 11, 31) - start;
  const DAY = 86400000;
  const rows = new Array(TOTAL_RECORDS);

  for (let i = 0; i < TOTAL_RECORDS; i++) {
    const region = regionNames[Math.floor(rand() * regionNames.length)];
    const warehouses = REGIONS[region];
    const category = categories[Math.floor(rand() * categories.length)];
    const [product, basePrice] = CATALOG[category][Math.floor(rand() * 5)];
    const quantity = 1 + Math.floor(rand() * 500);
    const unitPrice = Math.round(basePrice * (0.85 + rand() * 0.3) * 100) / 100;
    const orderTime = start + Math.floor((rand() * span) / DAY) * DAY;
    const shipMode = SHIP_MODES[Math.floor(rand() * SHIP_MODES.length)];
    const leadDays = shipMode === 'Air' ? 2 + Math.floor(rand() * 5) : shipMode === 'Sea' ? 20 + Math.floor(rand() * 25) : 5 + Math.floor(rand() * 12);
    const status = pickWeighted(rand(), STATUSES, STATUS_WEIGHTS);

    rows[i] = {
      OrderID: 100001 + i,
      OrderDate: new Date(orderTime).toISOString(),
      DeliveryDate: new Date(orderTime + leadDays * DAY).toISOString(),
      Supplier: SUPPLIERS[Math.floor(rand() * SUPPLIERS.length)],
      Category: category,
      Product: product,
      Region: region,
      Warehouse: warehouses[Math.floor(rand() * warehouses.length)],
      Quantity: quantity,
      UnitPrice: unitPrice,
      Amount: Math.round(quantity * unitPrice * 100) / 100,
      Status: status,
      ShipMode: shipMode,
      Priority: PRIORITIES[Math.floor(rand() * PRIORITIES.length)],
      LeadTimeDays: leadDays,
    };
  }
  return rows;
}

const t0 = Date.now();
const ORDERS = generate();
const DATE_FIELDS = new Set(['OrderDate', 'DeliveryDate']);
// Numeric timestamps for fast date comparisons/sorting (parallel array, same index as ORDERS).
const DATE_CACHE = {
  OrderDate: Float64Array.from(ORDERS, (o) => Date.parse(o.OrderDate)),
  DeliveryDate: Float64Array.from(ORDERS, (o) => Date.parse(o.DeliveryDate)),
};
console.log(`[data] generated ${ORDERS.length.toLocaleString()} SCM records in ${Date.now() - t0} ms`);

module.exports = { ORDERS, DATE_FIELDS, DATE_CACHE };
