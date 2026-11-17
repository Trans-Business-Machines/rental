import {
  Document,
  Font,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import { formatBoth } from "@/lib/currency";
import type { StockLevel } from "@/lib/inventory-stock";

/* ------------------------------------------------------------------ *
 * Stock report PDF. Server-only: rendered to a Buffer inside the
 * exportStockReport server action. Every money value is KES.
 * ------------------------------------------------------------------ */

export interface StockReportRow {
  itemName: string;
  unitOfMeasure: string;
  inStore: number;
  inUnits: number;
  restockAt: number;
  level: StockLevel;
  unitCost: number | null;
  stockValue: number | null;
}

export interface StockReportGroup {
  category: string;
  rows: StockReportRow[];
}

export interface StockReportData {
  property: { name: string; address: string };
  generatedAt: string;
  generatedBy: string;
  categoryLabel: string;
  stockLabel: string;
  /** Hide the per-category band when the report covers a single category. */
  showCategoryBands: boolean;
  groups: StockReportGroup[];
  summary: {
    items: number;
    inStock: number;
    lowStock: number;
    outOfStock: number;
    totalValue: number;
    itemsWithoutCost: number;
  };
}

// Wrap long item names at spaces only, never mid-word ("de-scriptive")
Font.registerHyphenationCallback((word) => [word]);

const COLORS = {
  text: "#0f172a",
  muted: "#64748b",
  border: "#e2e8f0",
  headerBg: "#f1f5f9",
  bandBg: "#f8fafc",
};

const LEVEL_STYLE: Record<StockLevel, { label: string; color: string; bg: string }> = {
  in_stock: { label: "In stock", color: "#166534", bg: "#dcfce7" },
  low_stock: { label: "Low stock", color: "#92400e", bg: "#fef3c7" },
  out_of_stock: { label: "Out of stock", color: "#991b1b", bg: "#fee2e2" },
};

// Column widths in points; the item column takes what's left.
const COL = {
  index: 22,
  unit: 46,
  inStore: 46,
  inUnits: 44,
  restockAt: 54,
  status: 62,
  unitCost: 54,
  value: 64,
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 32,
    paddingBottom: 48,
    paddingHorizontal: 32,
    fontFamily: "Helvetica",
    fontSize: 8.5,
    color: COLORS.text,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 12,
    marginBottom: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: COLORS.text,
  },
  propertyName: { fontFamily: "Helvetica-Bold", fontSize: 14, marginBottom: 3 },
  headerLine: { color: COLORS.muted, marginBottom: 2 },
  headerRight: { alignItems: "flex-end" },
  title: {
    fontFamily: "Helvetica-Bold",
    fontSize: 16,
    letterSpacing: 1,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
    paddingVertical: 4,
  },
  headRow: {
    backgroundColor: COLORS.headerBg,
    fontFamily: "Helvetica-Bold",
    borderBottomWidth: 0,
    paddingVertical: 5,
  },
  band: {
    backgroundColor: COLORS.bandBg,
    fontFamily: "Helvetica-Bold",
    paddingVertical: 4,
    paddingHorizontal: 4,
    marginTop: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  cell: { paddingHorizontal: 4 },
  num: { textAlign: "right" },
  pill: {
    alignSelf: "flex-start",
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    fontSize: 7.5,
    fontFamily: "Helvetica-Bold",
  },
  summary: {
    marginTop: 14,
    flexDirection: "row",
    borderWidth: 0.75,
    borderColor: COLORS.border,
    borderRadius: 4,
  },
  stat: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 9,
    borderRightWidth: 0.75,
    borderRightColor: COLORS.border,
  },
  statLabel: { color: COLORS.muted, fontSize: 7.5, marginBottom: 3 },
  statValue: { fontFamily: "Helvetica-Bold", fontSize: 11 },
  note: { color: COLORS.muted, marginTop: 5, fontSize: 7.5 },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    color: COLORS.muted,
    fontSize: 7.5,
  },
});

/** Trim trailing zeros: 2.50 -> 2.5, 40.00 -> 40 */
const qty = (value: number) => Number(value.toFixed(2)).toLocaleString("en-KE");
const kes = (value: number | null) =>
  value === null ? "—" : Math.round(value).toLocaleString("en-KE");

function TableHead() {
  return (
    <View style={[styles.row, styles.headRow]} fixed>
      <Text style={[styles.cell, { width: COL.index }]}>#</Text>
      <Text style={[styles.cell, { flex: 1 }]}>Item</Text>
      <Text style={[styles.cell, { width: COL.unit }]}>Unit</Text>
      <Text style={[styles.cell, styles.num, { width: COL.inStore }]}>In store</Text>
      <Text style={[styles.cell, styles.num, { width: COL.inUnits }]}>In units</Text>
      <Text style={[styles.cell, styles.num, { width: COL.restockAt }]}>Restock at</Text>
      <Text style={[styles.cell, { width: COL.status }]}>Status</Text>
      <Text style={[styles.cell, styles.num, { width: COL.unitCost }]}>Unit cost</Text>
      <Text style={[styles.cell, styles.num, { width: COL.value }]}>Value (KES)</Text>
    </View>
  );
}

function ItemRow({ row, index }: { row: StockReportRow; index: number }) {
  const level = LEVEL_STYLE[row.level];

  return (
    <View style={styles.row} wrap={false}>
      <Text style={[styles.cell, { width: COL.index, color: COLORS.muted }]}>{index}</Text>
      <Text style={[styles.cell, { flex: 1 }]}>{row.itemName}</Text>
      <Text style={[styles.cell, { width: COL.unit, color: COLORS.muted }]}>
        {row.unitOfMeasure}
      </Text>
      <Text style={[styles.cell, styles.num, { width: COL.inStore }]}>{qty(row.inStore)}</Text>
      <Text style={[styles.cell, styles.num, { width: COL.inUnits }]}>{qty(row.inUnits)}</Text>
      <Text style={[styles.cell, styles.num, { width: COL.restockAt }]}>
        {qty(row.restockAt)}
      </Text>
      <View style={[styles.cell, { width: COL.status }]}>
        <Text style={[styles.pill, { color: level.color, backgroundColor: level.bg }]}>
          {level.label}
        </Text>
      </View>
      <Text style={[styles.cell, styles.num, { width: COL.unitCost }]}>{kes(row.unitCost)}</Text>
      <Text style={[styles.cell, styles.num, { width: COL.value }]}>{kes(row.stockValue)}</Text>
    </View>
  );
}

function Stat({
  label,
  value,
  color,
  wide,
  last,
}: {
  label: string;
  value: string | number;
  color?: string;
  wide?: boolean;
  last?: boolean;
}) {
  return (
    <View style={[styles.stat, wide ? { flex: 2.6 } : {}, last ? { borderRightWidth: 0 } : {}]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, color ? { color } : {}]}>{value}</Text>
    </View>
  );
}

function StockReportDocument({ data }: { data: StockReportData }) {
  const { summary } = data;
  let index = 0;

  return (
    <Document
      title={`Stock Report — ${data.property.name}`}
      author={data.generatedBy}
      creator="RentManager"
    >
      <Page size="A4" style={styles.page}>
        {/* Repeated on every page */}
        <View style={styles.header} fixed>
          <View>
            <Text style={styles.propertyName}>{data.property.name}</Text>
            <Text style={styles.headerLine}>{data.property.address}</Text>
            <Text style={styles.headerLine}>Generated {data.generatedAt}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.title}>STOCK REPORT</Text>
            <Text style={styles.headerLine}>Category: {data.categoryLabel}</Text>
            <Text style={styles.headerLine}>Stock: {data.stockLabel}</Text>
          </View>
        </View>

        <TableHead />

        {data.groups.map((group) => (
          <View key={group.category}>
            {data.showCategoryBands && (
              // Keep the band with at least its first row
              <Text style={styles.band} minPresenceAhead={24}>
                {group.category} ({group.rows.length})
              </Text>
            )}
            {group.rows.map((row) => {
              index += 1;
              return <ItemRow key={`${group.category}-${row.itemName}`} row={row} index={index} />;
            })}
          </View>
        ))}

        <View wrap={false}>
          <View style={styles.summary}>
            <Stat label="Items" value={summary.items} />
            <Stat label="In stock" value={summary.inStock} color={LEVEL_STYLE.in_stock.color} />
            <Stat label="Low stock" value={summary.lowStock} color={LEVEL_STYLE.low_stock.color} />
            <Stat
              label="Out of stock"
              value={summary.outOfStock}
              color={LEVEL_STYLE.out_of_stock.color}
            />
            <Stat label="Stock value (in store)" value={formatBoth(summary.totalValue)} wide last />
          </View>
          {summary.itemsWithoutCost > 0 && (
            <Text style={styles.note}>
              {summary.itemsWithoutCost} item{summary.itemsWithoutCost === 1 ? " has" : "s have"} no
              unit cost and {summary.itemsWithoutCost === 1 ? "is" : "are"} not included in the
              stock value.
            </Text>
          )}
        </View>

        <View style={styles.footer} fixed>
          <Text>Generated by {data.generatedBy}</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

export function renderStockReportPdf(data: StockReportData) {
  return renderToBuffer(<StockReportDocument data={data} />);
}
