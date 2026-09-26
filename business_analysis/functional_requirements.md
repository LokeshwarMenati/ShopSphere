# ShopSphere Functional Requirements Document (FRD)

## 1. Document Overview
This document specifies the functional capabilities, computational rules, user interaction behaviors, and data filtering logic required for the ShopSphere Business Intelligence solution.

---

## 2. Functional Requirements Register (FR-001 through FR-016)

### FR-001: Date Range Dynamic Filtering
- **Description**: The system shall provide an interactive temporal filter allowing users to select single or multi-year date ranges between 2023-01-01 and 2025-12-31.
- **Input Fields**: `DimDate[Date]`, `DimDate[Year]`, `DimDate[Quarter]`.
- **Processing Logic**: Evaluates active filter context and propagates date constraints to `FactOrders[order_date]`, `FactDelivery[order_date]`, and `FactReturns[return_date]`.
- **Output / Visual Behavior**: All KPI cards, charts, and summary matrices dynamically refresh to reflect only transactions finalized within the selected window.
- **Traceability**: [BR-001](file:///e:/ShopSphere/business_analysis/BRD.md), [BR-015](file:///e:/ShopSphere/business_analysis/BRD.md).

---

### FR-002: Multi-Region Geographical Slicing
- **Description**: The system shall provide a multi-select dropdown slicer enabling filtering across the five operational territories (`West`, `East`, `Central`, `South`, `North`).
- **Input Fields**: `DimCustomer[region]`.
- **Processing Logic**: Filters `DimCustomer` rows, which cascades via the 1-to-many relationship to `FactOrders`.
- **Output / Visual Behavior**: Regional charts update to isolate selected regions; summary cards recalculate regional revenue, margin, and order volume.
- **Traceability**: [BR-002](file:///e:/ShopSphere/business_analysis/BRD.md).

---

### FR-003: Product Category & Subcategory Drill-Down
- **Description**: The system shall provide a hierarchical category matrix allowing users to expand categories into subcategories and down to individual SKU line items.
- **Input Fields**: `DimProduct[category]`, `DimProduct[subcategory]`, `DimProduct[product_name]`.
- **Processing Logic**: Aggregates `SUM(net_revenue)`, `SUM(gross_profit)`, and computes `DIVIDE(Gross Profit, Net Revenue)`.
- **Output / Visual Behavior**: Interactive tree matrix visual with +/- expand/collapse icons, conditional formatting on profit margins.
- **Traceability**: [BR-003](file:///e:/ShopSphere/business_analysis/BRD.md).

---

### FR-004: Customer Segment Multi-Pill Selection
- **Description**: The system shall provide horizontal pill selection buttons for `Consumer`, `Corporate`, and `Small Business` customer segments.
- **Input Fields**: `DimCustomer[customer_segment]`.
- **Processing Logic**: Contextually filters customer dimensions and orders placed by the selected segment.
- **Output / Visual Behavior**: Segment comparison charts highlight the chosen tier; AOV cards update to reflect segment-specific spending.
- **Traceability**: [BR-008](file:///e:/ShopSphere/business_analysis/BRD.md).

---

### FR-005: Net Revenue Calculation & Card Rendering
- **Description**: The system shall compute Net Revenue for every line item using the formula: `quantity * unit_price * (1 - discount)`.
- **Input Fields**: `FactOrders[quantity]`, `FactOrders[unit_price]`, `FactOrders[discount]`.
- **Processing Logic**: DAX Measure `[Total Net Revenue] = SUMX(FactOrders, FactOrders[quantity] * FactOrders[unit_price] * (1 - FactOrders[discount]))`.
- **Output / Visual Behavior**: Rendered in currency format (`$#,##0.00`) across all KPI scorecards and trend axes.
- **Traceability**: [BR-001](file:///e:/ShopSphere/business_analysis/BRD.md).

---

### FR-006: Product Cost (COGS) & Gross Profit Computation
- **Description**: The system shall compute total cost of goods sold and subtract it from net revenue to determine gross profit.
- **Input Fields**: `FactOrders[quantity]`, `DimProduct[unit_cost]`, `[Total Net Revenue]`.
- **Processing Logic**: `[Total Cost] = SUMX(FactOrders, FactOrders[quantity] * RELATED(DimProduct[unit_cost]))`, `[Gross Profit] = [Total Net Revenue] - [Total Cost]`.
- **Output / Visual Behavior**: Displayed on executive KPI cards, product matrices, and monthly financial waterfalls.
- **Traceability**: [BR-001](file:///e:/ShopSphere/business_analysis/BRD.md), [BR-003](file:///e:/ShopSphere/business_analysis/BRD.md).

---

### FR-007: Profit Margin Percentage & Conditional Formatting
- **Description**: The system shall calculate gross margin percentage as `[Gross Profit] / [Total Net Revenue]` and apply color-coded threshold alerts.
- **Input Fields**: `[Gross Profit]`, `[Total Net Revenue]`.
- **Processing Logic**: `[Profit Margin %] = DIVIDE([Gross Profit], [Total Net Revenue], 0)`.
- **Output / Visual Behavior**: Percentage formatted (`0.00%`). Values < 15.0% highlighted in Light Coral; values > 40.0% highlighted in Soft Green.
- **Traceability**: [BR-003](file:///e:/ShopSphere/business_analysis/BRD.md), [BR-004](file:///e:/ShopSphere/business_analysis/BRD.md).

---

### FR-008: Average Order Value (AOV) Computation
- **Description**: The system shall compute Average Order Value as total net revenue divided by total unique completed orders.
- **Input Fields**: `[Total Net Revenue]`, `[Total Orders]`.
- **Processing Logic**: `[Average Order Value (AOV)] = DIVIDE([Total Net Revenue], [Total Orders], 0)`.
- **Output / Visual Behavior**: KPI card formatted as currency ($238.58 baseline). Updates dynamically across slicer selections.
- **Traceability**: [BR-008](file:///e:/ShopSphere/business_analysis/BRD.md).

---

### FR-009: Customer Lifetime Value (LTV) & VIP Ranking
- **Description**: The system shall rank all registered customer profiles by cumulative lifetime spend and display the Top 20 accounts.
- **Input Fields**: `FactOrders[customer_id]`, `DimCustomer[customer_name]`, `[Total Net Revenue]`.
- **Processing Logic**: `DENSE_RANK() OVER (ORDER BY SUM(net_revenue) DESC)` in SQL / Top N Visual Filter in Power BI.
- **Output / Visual Behavior**: Sortable table displaying Rank (1–20), Customer ID, Name, Segment, Spend, and Gross Profit.
- **Traceability**: [BR-009](file:///e:/ShopSphere/business_analysis/BRD.md).

---

### FR-010: Customer Repeat Purchase Rate Calculation
- **Description**: The system shall calculate the percentage of purchasing customers who have completed 2 or more distinct orders.
- **Input Fields**: `FactOrders[customer_id]`, `FactOrders[order_id]`.
- **Processing Logic**: Iterates over customer IDs, counts unique orders, and divides customers with `count > 1` by total active purchasing customers.
- **Output / Visual Behavior**: Dedicated KPI Card displaying `55.60%` benchmark.
- **Traceability**: [BR-010](file:///e:/ShopSphere/business_analysis/BRD.md).

---

### FR-011: Delivery Delay Quantification & SLA Tracking
- **Description**: The system shall calculate delivery delay in calendar days as `MAX(0, actual_delivery_date - promised_delivery_date)`.
- **Input Fields**: `FactDelivery[promised_delivery_date]`, `FactDelivery[actual_delivery_date]`.
- **Processing Logic**: Non-negative integer difference between carrier completion date and promised SLA date.
- **Output / Visual Behavior**: Average Late Delivery Delay card (3.49 days); distribution charts by shipping type and region.
- **Traceability**: [BR-005](file:///e:/ShopSphere/business_analysis/BRD.md).

---

### FR-012: Return Rate & Fulfillment Status Cross-Correlation
- **Description**: The system shall calculate product return rate % segmented by fulfillment status (`Delivered On-Time` vs `Delivered Late`).
- **Input Fields**: `FactDelivery[delivery_status]`, `FactOrders[order_status]`, `FactReturns[return_id]`.
- **Processing Logic**: Ratio of returned orders to total orders partitioned by delivery status.
- **Output / Visual Behavior**: Paired bar chart demonstrating the 2.8x escalation in returns on late deliveries (19.8% vs 7.1%).
- **Traceability**: [BR-006](file:///e:/ShopSphere/business_analysis/BRD.md).

---

### FR-013: Return Reason Taxonomy Categorization
- **Description**: The system shall aggregate and rank customer-submitted return reasons by product category.
- **Input Fields**: `FactReturns[return_reason]`, `DimProduct[category]`, `FactReturns[return_quantity]`.
- **Processing Logic**: Grouping by category and return reason with 100% stacked percentage distribution.
- **Output / Visual Behavior**: Visual breakdown highlighting Apparel size/fit issues (62%) and Electronics defect/delivery issues.
- **Traceability**: [BR-007](file:///e:/ShopSphere/business_analysis/BRD.md).

---

### FR-014: Order Cancellation Financial Impact Tracking
- **Description**: The system shall calculate the order cancellation rate and total net dollar value lost to pre-delivery cancellations.
- **Input Fields**: `FactOrders[order_status]`, `FactOrders[net_revenue]`.
- **Processing Logic**: `[Cancellation Rate %] = DIVIDE(Cancelled Orders, Total Orders, 0)`, `[Cancelled Revenue] = SUMX(FILTER(FactOrders, order_status = "Cancelled"), net_revenue)`.
- **Output / Visual Behavior**: KPI card displaying `4.77%` cancellation rate and `$1,164,820` lost revenue callout.
- **Traceability**: [BR-014](file:///e:/ShopSphere/business_analysis/BRD.md).

---

### FR-015: Loss-Leader Identification & Visual Flagging
- **Description**: The system shall automatically flag SKUs with net sales exceeding $30,000 but realizing a gross profit margin below 10.0%.
- **Input Fields**: `DimProduct[product_id]`, `[Total Net Revenue]`, `[Profit Margin %]`.
- **Processing Logic**: Conditional logic rule: `IF([Total Net Revenue] > 30000 && [Profit Margin %] < 0.10, "Loss Leader / Margin Risk", "Healthy")`.
- **Output / Visual Behavior**: Dedicated table visual on Page 2 and Page 5 with Warning badges.
- **Traceability**: [BR-004](file:///e:/ShopSphere/business_analysis/BRD.md).

---

### FR-016: Data Export & Management Reporting Extraction
- **Description**: The system shall allow authorized users to export summarized grid tables to Microsoft Excel (.xlsx) and CSV formats.
- **Input Fields**: Any rendered table or matrix visual.
- **Processing Logic**: Standard Power BI visual context export with underlying data permissions.
- **Output / Visual Behavior**: Filtered dataset exported directly to user workstation for ad-hoc board presentations.
- **Traceability**: [BR-016](file:///e:/ShopSphere/business_analysis/BRD.md).
