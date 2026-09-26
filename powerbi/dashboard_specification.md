# ShopSphere Power BI Dashboard UI/UX Specification

## 1. Global Report Design System & Canvas Specifications
- **Canvas Dimensions**: Standard 16:9 widescreen (1280 × 720 px or 1920 × 1080 px).
- **Background**: Soft Gray (`#F8F9FA`) with container cards in Clean White (`#FFFFFF`) with subtle drop shadows (`X: 0, Y: 2, Blur: 4, Color: rgba(0,0,0,0.06)`).
- **Typography**: Segoe UI / Segoe UI Semibold across all visual titles, KPI callouts, and data labels.
- **Color Palette (Corporate Modern)**:
  - **Primary Brand Navy**: `#1F4E79` (Headers, Primary lines, Major bar series)
  - **Secondary Blue / Accent**: `#2E75B6` (Secondary metrics, interactive highlights)
  - **Success / Profit Green**: `#2CA02C` (Positive growth, gross profit metrics)
  - **Warning / Alert Coral**: `#D9534F` (Returns, cancellations, late delivery alerts)
  - **Neutral Gray**: `#7F7F7F` (Axis lines, benchmark references)

---

## 2. Interactive Global Navigation & Slicers
Placed in a top navigation banner across Pages 1 to 4:
- **Date Range Slicer**: Relative Date Slicer or Between Slider mapped to `DimDate[Date]`.
- **Region Dropdown**: Multi-select dropdown mapped to `DimCustomer[region]`.
- **Category Dropdown**: Multi-select dropdown mapped to `DimProduct[category]`.
- **Customer Segment**: Pill buttons (`Consumer`, `Corporate`, `Small Business`) mapped to `DimCustomer[customer_segment]`.

---

## 3. Granular Page-by-Page Visual Architecture

### PAGE 1 — EXECUTIVE OVERVIEW

#### Top KPI Cards Header (Coordinates: Y: 60px, Height: 90px)
Nine executive cards arranged horizontally:
1. **Net Revenue**: Card visual displaying `[Total Net Revenue]` ($24.4M), secondary label with `[Revenue Growth % (MoM)]`.
2. **Gross Revenue**: `[Total Gross Revenue]` ($26.5M).
3. **Gross Profit**: `[Gross Profit]` ($7.97M) in bold green.
4. **Profit Margin %**: `[Profit Margin %]` (32.63%).
5. **Total Orders**: `[Total Orders]` (102.4K).
6. **Active Customers**: `[Total Customers]` (27.2K).
7. **Average Order Value**: `[Average Order Value (AOV)]` ($238.58).
8. **Return Rate %**: `[Return Rate %]` (8.39%) with conditional formatting (Red if > 8.0%).
9. **Cancellation Rate %**: `[Cancellation Rate %]` (4.77%).

#### Visual 1: 36-Month Sales & Profit Trajectory (Left 60% Width, Y: 165px)
- **Visual Type**: Line and Clustered Column Chart.
- **X-Axis**: `DimDate[MonthYear]` (Sorted chronologically).
- **Column Y-Axis**: `[Total Orders]` (Faint blue bar volume).
- **Line Y-Axis**: `[Total Net Revenue]` (Navy line) & `[Gross Profit]` (Green line).
- **Interactivity**: Cross-filters category and regional visuals upon clicking monthly data points.

#### Visual 2: Revenue & Margin by Category (Top Right 40% Width)
- **Visual Type**: Clustered Bar Chart.
- **Y-Axis**: `DimProduct[category]`.
- **X-Axis**: `[Total Net Revenue]`.
- **Tooltip**: `[Gross Profit]`, `[Profit Margin %]`, `[Total Orders]`.

#### Visual 3: Geographic Sales Density (Bottom Right 40% Width)
- **Visual Type**: Donut Chart or Shape Map.
- **Legend**: `DimCustomer[region]`.
- **Values**: `[Total Net Revenue]`.
- **Data Labels**: Category percent of total and absolute spend.

---

### PAGE 2 — SALES & PRODUCT ANALYSIS

#### Visual 1: Merchandising Category & Subcategory Matrix (Left 50% Width)
- **Visual Type**: Matrix Visual with drill-down (`category` -> `subcategory` -> `product_name`).
- **Values**:
  - `[Units Sold]` (Data bars enabled)
  - `[Total Net Revenue]` ($ format)
  - `[Gross Profit]` ($ format)
  - `[Profit Margin %]` (Color scale: Red below 15%, Green above 40%)
  - `[Return Rate %]` (Color scale: Yellow above 10%, Red above 15%)

#### Visual 2: Top 10 Best Sellers vs. Bottom 10 Profit Drains (Right 50% Width)
- **Top Half**: Horizontal Bar Chart displaying Top 10 SKUs by `[Total Net Revenue]` using visual Top N filter.
- **Bottom Half**: Horizontal Bar Chart displaying Bottom 10 SKUs by `[Gross Profit]` to isolate loss leaders.
- **Highlight Card**: Loss-Leader Callout: *"15 Tech SKUs generate $1.2M in volume but produce -$18K net margin due to aggressive promo discounting."*

#### Visual 3: Discount Depth vs. Realized Gross Margin (Bottom Full Width)
- **Visual Type**: Scatter Plot.
- **X-Axis**: `FactOrders[discount]` (0% to 30%).
- **Y-Axis**: `[Profit Margin %]`.
- **Bubble Size**: `[Total Net Revenue]`.
- **Trend Line**: Demonstrates clear negative regression slope between heavy discounts and margin erosion.

---

### PAGE 3 — CUSTOMER ANALYTICS

#### Visual 1: Customer Acquisition & Retention Cohort Curve (Top Left 50%)
- **Visual Type**: Stacked Area Chart.
- **X-Axis**: `DimDate[Year]`.
- **Values**: New Customer Revenue vs. Returning Customer Revenue.
- **KPI Card**: Repeat Customer Benchmark (`55.60%` repeat buyers).

#### Visual 2: Customer Segment Economics (Top Right 50%)
- **Visual Type**: Multi-row KPI Cards & Donut Chart comparing `Consumer`, `Corporate`, `Small Business`.
- **Metrics**: Total Spend, AOV ($385 Corporate vs $210 Consumer), Average Basket Depth.

#### Visual 3: Customer Purchase Frequency Distribution (Bottom Left 50%)
- **Visual Type**: Column Chart.
- **X-Axis**: Order Buckets (`1 Order`, `2-3 Orders`, `4-6 Orders`, `7+ Orders`).
- **Y-Axis**: Customer Count and Cumulative Revenue Contribution %.
- **Business Finding**: Confirms Pareto concentration (Top 20% of buyers generate 58% of turnover).

#### Visual 4: Top 20 Customer Accounts (Bottom Right 50%)
- **Visual Type**: Table visual.
- **Columns**: `Customer Name`, `Segment`, `Region`, `Orders Placed`, `Total Spend`, `LTV Rank`.

---

### PAGE 4 — REGIONAL & OPERATIONS ANALYSIS

#### Visual 1: Regional SLA & Commercial Matrix (Top Left 50%)
- **Visual Type**: Clustered Column Chart.
- **X-Axis**: `DimCustomer[region]`.
- **Y-Axis (Left)**: `[Total Net Revenue]`.
- **Y-Axis (Right)**: `[Late Delivery Rate %]` (Target reference line at 5.0%).

#### Visual 2: Fulfillment Milestone Funnel (Top Right 50%)
- **Visual Type**: Funnel Chart.
- **Stages**: `Total Orders Placed` -> `Delivered On-Time` -> `Delivered Late` -> `Cancelled` -> `Returned`.

#### Visual 3: Root Cause: Delivery Delay vs. Product Return Propensity (Bottom Left 50%)
- **Visual Type**: Paired Column Chart.
- **Categories**: `Delivered On-Time` vs. `Delivered Late`.
- **Metric**: Return Rate % (`7.12%` On-Time vs `19.84%` Late).
- **Callout Banner**: *"Orders delayed >3 days past promised SLA experience 2.8x higher return rates."*

#### Visual 4: Return Reasons by Product Category (Bottom Right 50%)
- **Visual Type**: 100% Stacked Bar Chart.
- **Y-Axis**: `DimProduct[category]`.
- **X-Axis**: Share of Returns.
- **Legend**: `return_reason` (`Late Delivery`, `Size / Fit Issue`, `Defective / Damaged`, `Changed Mind`).

---

### PAGE 5 — MANAGEMENT INSIGHTS & ACTION MATRIX
*This page prioritizes executive decisions and organizational accountability over raw charting.*

Arranged as 5 Structured Decision Cards:

```
+----------------------------------------------------------------------------------------------------+
| 1. LOGISTICS LATENCY & RETURN SPILLOVER                                             [PRIORITY: P1] |
| Finding:        11.4% of orders suffer delivery delays, triggering a 2.8x higher return rate.      |
| Evidence:       Late deliveries produce 19.8% return rate vs 7.1% on-time ($1.4M revenue at risk). |
| Business Impact: $420K annual reverse logistics freight burn + customer churn.                     |
| Recommendation: Renegotiate 3PL SLAs in East & Central; implement automated delay notification.    |
| Responsible:    Head of Supply Chain & Logistics             KPI: Late Delivery % < 5.0%           |
+----------------------------------------------------------------------------------------------------+
| 2. ELECTRONICS MARGIN COMPRESSION & LOSS LEADERS                                    [PRIORITY: P1] |
| Finding:        Electronics drives 45% of revenue but only 28% of gross profit.                    |
| Evidence:       15 flagship SKUs sold at sub-5% or negative margins during Q4 promotional discount. |
| Business Impact: Margin dilution of 420 bps across the catalog.                                    |
| Recommendation: Enforce minimum advertised price (MAP) and mandate high-margin accessory bundles.   |
| Responsible:    VP of Merchandising                          KPI: Category Margin % > 25.0%        |
+----------------------------------------------------------------------------------------------------+
| 3. APPAREL & FASHION SIZE / FIT RETURNS                                             [PRIORITY: P2] |
| Finding:        Apparel return rate is 14.2%, with 62% citing 'Size / Fit Issue'.                  |
| Evidence:       $680K in returned apparel merchandise annually.                                    |
| Business Impact: High inventory restocking depreciation and customer disappointment.               |
| Recommendation: Deploy interactive 3D sizing guide and normalize supplier garment specs.           |
| Responsible:    E-commerce Product Lead                      KPI: Apparel Return Rate < 9.0%       |
+----------------------------------------------------------------------------------------------------+
| 4. B2B CORPORATE SEGMENT UNDER-MONETIZATION                                         [PRIORITY: P2] |
| Finding:        Corporate buyers generate an AOV of $385 (83% higher than retail consumers).       |
| Evidence:       Corporate accounts account for only 22% of total order volume.                     |
| Business Impact: Significant untapped expansion in predictable recurring cash flows.              |
| Recommendation: Launch dedicated ShopSphere Corporate Portal with tiered volume pricing & net-30.   |
| Responsible:    Commercial Sales Director                    KPI: Corporate Revenue Share > 30%    |
+----------------------------------------------------------------------------------------------------+
| 5. Q4 PEAK CAPACITY BOTTLENECKS                                                     [PRIORITY: P3] |
| Finding:        November and December generate 1.5x baseline order volume.                          |
| Evidence:       Late delivery rates double to 22% during holiday peak periods.                      |
| Business Impact: Brand reputation damage during highest customer acquisition window.              |
| Recommendation: Buffer inventory in regional hubs by October 15 and secure temporary flex carriers. |
| Responsible:    Operations & Warehouse Director              KPI: Peak On-Time SLA > 92.0%         |
+----------------------------------------------------------------------------------------------------+
```
