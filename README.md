# StockSense 📦

> **Modular Inventory Management System (IMS) inspired by Odoo ERP**  
> Digitize, track, and streamline end-to-end warehouse stock movements in real time.

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)

---

## 🌟 Overview

**StockSense** replaces manual registers, Excel spreadsheets, and fragmented tracking methods with a centralized, real-time inventory management platform. Built to deliver the core power and modularity of **Odoo Inventory**, StockSense supports multi-warehouse facilities, multi-step operations (Receipts, Deliveries, Internal Transfers, and Physical Count Adjustments), role-based workflows, and a strict double-entry Stock Ledger.

---

## 🎯 Target Users & Persona Workflows

| Persona | Primary Responsibilities | Key Capabilities in StockSense |
|---|---|---|
| **Inventory Managers** | Strategic stock oversight, procurement validation, and discrepancy resolution | • Complete KPI dashboard with live valuation<br>• Configure reordering rules and minimum thresholds<br>• Validate incoming vendor receipts and supplier orders<br>• Manage warehouse facilities and internal locations<br>• Audit Stock Ledger & export compliance CSVs |
| **Warehouse Staff** | Hands-on floor execution, picking, shelving, and physical counting | • Check product availability on delivery orders<br>• Pick and pack customer shipments<br>• Execute internal inter-rack transfers (e.g. WH/Stock &rarr; Production Floor)<br>• Perform physical inventory cycle counts |

*Note: You can instantly switch between **Inventory Manager** and **Warehouse Staff** via the 1-click role switcher pill in the navigation header.*

---

## 🚀 Key Features

### 1. 📊 Interactive Odoo-Style Dashboard
- **5 High-Impact KPI Cards**:
  - Total Products in Stock (units & SKU count)
  - Low Stock / Out of Stock alerts based on automated reorder thresholds
  - Pending Receipts (Ready vs Draft)
  - Pending Deliveries (Ready vs Waiting for Stock)
  - Scheduled Internal Transfers
- **4 Operation Type Cards**:
  - **Receipts**: Incoming vendor shipments, "X to receive", quick create
  - **Delivery Orders**: Customer dispatch, "X to deliver", availability tracking
  - **Internal Transfers**: Relocation between racks and production floors
  - **Inventory Adjustments**: Physical variance and damage audits
- **Dynamic Multi-Dimensional Filters**:
  - Filter simultaneously by **Document Type**, **Status** (Draft, Waiting, Ready, Done, Canceled), **Warehouse Facility**, and **Product Category**.
- **Real-time Operations Timeline**: Live backlog feed with 1-click inspection.

### 2. 📦 Product & Stock Catalog
- Comprehensive SKU management with categorization, Unit of Measure (UoM), cost price, and sales price.
- **Stock Availability**:
  - **On Hand**: Total physical stock across all internal facilities.
  - **Reserved**: Stock allocated to pending customer delivery orders.
  - **Free to Use**: Unreserved quantity ready for immediate shipment.
- **Per-Location Breakdown**: Inspect granular quantities stored in Main Storage, Production Racks, Packing Bays, and Secondary Depots.
- **In-Table Quick Stock Adjustment**: Direct stock adjustment right from the table row (as designed in the Excalidraw specification).
- **Automated Reordering Rules**: Alerts trigger whenever On-Hand stock falls below defined thresholds.
- **CSV Data Export**: 1-click export of catalog and valuation data.

### 3. 📥 Receipts (Incoming Stock)
- Vendor reception flow:
  1. Create new receipt with Supplier, Destination Location, and Scheduled Date.
  2. Input product lines with Demand and Received Done quantities.
  3. Validate &rarr; **Stock increases automatically** in destination location.
  4. Automatically writes transaction to the **Stock Ledger**.
- Dual view modes: **Table View** and **Kanban View** (grouped by Draft, Ready, Done).
- Printable packing/receipt slips.

### 4. 📤 Delivery Orders (Outgoing Stock)
- Customer fulfillment flow:
  1. Create order with Customer, Source Location, and Products.
  2. **Check Availability / Reserve**: Checks on-hand unreserved stock. If sufficient, sets status to `Ready` and reserves units; otherwise transitions to `Waiting`.
  3. **Pick & Pack**: Warehouse staff records picked quantities.
  4. **Validate**: Deducts physical stock, releases reserved count, and writes an outgoing delta (`-QTY`) to the Stock Ledger.

### 5. 🔄 Internal Transfers
- Move inventory between locations (e.g. Main Store &rarr; Production Rack, Rack A &rarr; Rack B, Warehouse 1 &rarr; Warehouse 2).
- Total company inventory remains constant while individual storage bay balances update atomically.
- Complete audit trail preserved in Move History.

### 6. ⚖️ Inventory Adjustments (Physical Stock Reconciliation)
- Reconcile physical count variances (damaged goods, lost pallets, annual audit surplus).
- Dynamic difference calculation (`Counted - Recorded = Variance`).
- Requires audit reason (e.g. *"3 kg damaged in transit"*).
- Updates physical balance immediately and records delta in Move History.

### 7. 📜 Move History (Double-Entry Stock Ledger)
- Immutable audit log of every stock mutation:
  - Timestamp, Reference Document (`WH/IN/...`, `WH/OUT/...`, `WH/INT/...`, `INV/ADJ/...`), Product, SKU, Source (`From`), Destination (`To`), Quantity Delta (`+` / `-`), Responsible Operator, and Notes.
- Filter by movement type and search across any parameter.
- Exportable to CSV.

### 8. 🏢 Multi-Warehouse & Location Hierarchy
- Manage multiple warehouse facilities (e.g. *Main Distribution Center [WH]*, *Harbor Secondary Depot [DEPOT]*).
- Configure zones, racks, floors, and virtual locations (Vendor, Customer, Inventory Scrap).

### 9. 🔐 Authentication & Security
- **Sign In**: Login ID or email authentication with error feedback.
- **Sign Up**: Strict validation according to Excalidraw specs:
  - Unique Login ID (6-12 characters)
  - Unique Email validation
  - Strong password policy (&gt;8 characters, uppercase, lowercase, special character)
  - Re-enter password confirmation
- **OTP Password Reset**: Simulated one-time passcode verification dispatch for instant password recovery testing.
- **Pre-configured Demo Accounts**:
  - **Manager**: `admin_manager` / `Admin@123`
  - **Warehouse Staff**: `warehouse_staff` / `Staff@123`

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS + Custom Odoo Enterprise theme tokens (`#714B67` amethyst, `#008784` teal)
- **Icons**: Lucide React
- **State Engine**: Typed Reactive Inventory Store with double-entry stock bookkeeping and `localStorage` persistence
- **Build Tool**: Vite 6, PostCSS, Autoprefixer

---

## 💻 Quickstart & Development

### 1. Clone & Install
```bash
git clone https://github.com/Thatsrijan/StockSense.git
cd StockSense
npm install
```

### 2. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
```

---

## 📂 Project Structure

```
StockSense/
├── public/
├── src/
│   ├── components/
│   │   ├── auth/                # Sign In, Sign Up, OTP Reset
│   │   │   ├── LoginPage.tsx
│   │   │   ├── SignupPage.tsx
│   │   │   └── ForgotPasswordModal.tsx
│   │   ├── layout/              # Navbar, Header, Profile Modal
│   │   │   ├── Navbar.tsx
│   │   │   └── ProfileModal.tsx
│   │   └── views/               # Main Feature Views
│   │       ├── DashboardView.tsx
│   │       ├── ProductsView.tsx
│   │       ├── ReceiptsView.tsx
│   │       ├── DeliveriesView.tsx
│   │       ├── TransfersView.tsx
│   │       ├── AdjustmentsView.tsx
│   │       ├── MoveHistoryView.tsx
│   │       └── SettingsView.tsx
│   ├── store/                   # Reactive State & Double-Entry Engine
│   │   ├── mockData.ts
│   │   └── useInventoryStore.tsx
│   ├── types/                   # Comprehensive TypeScript Models
│   │   └── inventory.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
