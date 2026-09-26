# ShopSphere Acceptance Criteria (Given-When-Then Specification)

## Document Overview
This document formalizes acceptance criteria using the Behavior-Driven Development (BDD) **Given / When / Then** syntax. These criteria serve as the binding contract for feature completion, automated validation, and User Acceptance Testing (UAT) sign-off.

---

## Acceptance Criteria Register

### AC-001 (Mapped to US-001 & BR-002: Regional Slicing)
- **Scenario**: User filters the Executive Overview by a specific geographical territory.
- **Given**: The user is viewing Page 1 (Executive Overview) with all historical data loaded.
- **When**: The user selects "West" from the Region dropdown slicer.
- **Then**:
  - The `[Total Net Revenue]` card updates to reflect only sales from customers residing in the West region.
  - The `[Gross Profit]` and `[Profit Margin %]` cards recalculate dynamically based exclusively on West transactions.
  - The 36-Month Sales trend chart updates its series to reflect only West monthly order volume and revenue.
  - The Category Breakdown chart updates to show category revenue generated within the West.

---

### AC-002 (Mapped to US-002 & BR-001: Date Filtering & Time Intelligence)
- **Scenario**: User adjusts the calendar time horizon to evaluate a single fiscal year.
- **Given**: The dashboard is displayed with the default 36-month timeline (2023 to 2025).
- **When**: The user adjusts the Date Slicer to "2024-01-01 to 2024-12-31".
- **Then**:
  - All top-level KPI cards recalculate to reflect exclusively FY2024 transactions.
  - The monthly trend chart filters its X-axis to display only the 12 months of 2024.
  - The `[Previous Month Revenue]` and `[Revenue Growth % (MoM)]` measures continue to calculate correctly, referencing December 2023 for January 2024's baseline without throwing `#DIV/0!` errors.

---

### AC-003 (Mapped to US-003 & BR-004: Loss-Leader Identification)
- **Scenario**: CFO filters the product table to identify heavily discounted, low-margin products.
- **Given**: The user is on Page 2 (Sales & Product Analysis).
- **When**: The user reviews the Bottom 10 Profit Drains table or applies a margin filter for `< 10.0%`.
- **Then**:
  - The table displays SKUs where net revenue exceeds $30,000 but gross profit margin is below 10.0% or negative.
  - Rows exhibiting negative gross profit are highlighted with an Alert fill (`#FCE4D6`) and bold red text.
  - Tooltips display the units sold, unit cost, selling price, and average discount applied.

---

### AC-004 (Mapped to US-004 & BR-005: Delivery Delay SLA Tracking)
- **Scenario**: Supply Chain Manager evaluates logistics carrier delivery delay rates.
- **Given**: The user navigates to Page 4 (Regional & Operations Analysis).
- **When**: The user inspects the Delivery Performance visual.
- **Then**:
  - The system displays the overall late delivery rate (benchmark: 11.38%).
  - The Average Late Delivery Delay card displays the mean delay days (benchmark: 3.49 days).
  - The late delivery percentage is broken down across the 4 shipping types (`Standard`, `Express`, `Economy`, `Same Day`).

---

### AC-005 (Mapped to US-005 & BR-006: Delivery Delay Impact on Returns)
- **Scenario**: Measuring return propensity differences between on-time and late orders.
- **Given**: The user is viewing the Logistics & Reverse Logistics correlation visual on Page 4.
- **When**: The visual aggregates order returns across fulfillment milestones.
- **Then**:
  - Orders marked as "Delivered On-Time" display a return rate of approximately 7.1%.
  - Orders marked as "Delivered Late" display a return rate of approximately 19.8% (demonstrating the ~2.8x escalation).
  - Hovering over data points reveals the underlying order counts and returned unit counts.

---

### AC-006 (Mapped to US-006 & BR-007: Category Return Reason Breakdown)
- **Scenario**: Merchandiser investigates why Apparel & Fashion exhibits high return volumes.
- **Given**: The user is on Page 4 and selects "Apparel & Fashion" from the category filter.
- **When**: The Return Reason 100% Stacked Bar visual renders.
- **Then**:
  - "Size / Fit Issue" is shown as the dominant root cause, accounting for over 55% of category returns.
  - Secondary reasons ("Changed Mind", "Not as Described") populate the remaining return share.
  - The total return volume and dollar value returned reconcile with the returns fact table.

---

### AC-007 (Mapped to US-007 & BR-008: Customer Segment Economics)
- **Scenario**: Commercial Sales Director compares customer segment spending behavior.
- **Given**: The user is on Page 3 (Customer Analytics).
- **When**: The user compares Consumer, Corporate, and Small Business visual cards.
- **Then**:
  - Corporate AOV is calculated and displayed as significantly higher than Consumer AOV (benchmark: ~$385 for Corporate vs. ~$210 for Consumer).
  - Segment revenue share, order volume, and repeat buyer rates are displayed side-by-side.

---

### AC-008 (Mapped to US-008 & BR-009: Top 20 Customer Ranking)
- **Scenario**: Loyalty Manager reviews the highest spending customer accounts.
- **Given**: The user is on Page 3 (Customer Analytics).
- **When**: The user views the Top 20 VIP Accounts grid.
- **Then**:
  - Exactly 20 unique customer records are displayed, sorted in descending order by `[Total Spend ($)]`.
  - Displayed columns include: Rank (1 to 20), Customer ID, Full Name, Segment, Region, Total Orders Placed, Cumulative Spend, and Gross Profit Contributed.

---

### AC-009 (Mapped to US-009 & BR-010: Repeat Purchase Rate Calculation)
- **Scenario**: Marketing Director evaluates brand retention.
- **Given**: All active customer transactions are loaded into the data model.
- **When**: The `[Repeat Customer Rate %]` DAX measure evaluates.
- **Then**:
  - The measure evaluates total unique active customers (27,200).
  - The measure evaluates customers with order count > 1 (15,122).
  - The KPI card renders `55.60%` with zero division-by-zero errors.

---

### AC-010 (Mapped to US-010 & BR-014: Order Cancellation Tracking)
- **Scenario**: Operations evaluates cancelled orders and lost top-line revenue.
- **Given**: The user navigates to the Operations & Logistics dashboard.
- **When**: The user filters by order status or reviews the Cancellation KPI card.
- **Then**:
  - The cancellation rate is displayed as `4.77%` of total orders.
  - The dollar value of cancelled revenue is calculated and displayed as ~$1.16M USD.
  - The cancellation rate is cross-tabulated by checkout payment channel.

---

### AC-011 (Mapped to US-011 & BR-003: Hierarchical Category Drill-Down)
- **Scenario**: Category Manager drills down into Electronics subcategories.
- **Given**: The user is viewing the Merchandising Matrix on Page 2.
- **When**: The user clicks the `+` expand icon next to "Electronics".
- **Then**:
  - The visual expands to reveal subcategories: Smartphones, Laptops, Audio & Headphones, Wearables, Accessories.
  - Net revenue, units sold, gross profit, and margin % are aggregated correctly at the subcategory level.
  - Clicking `+` on "Smartphones" reveals individual SKU names and their specific margin %.

---

### AC-012 (Mapped to US-012 & BR-016: Data Export to Excel)
- **Scenario**: Financial Analyst exports summarized monthly financials.
- **Given**: The user is viewing any grid table on Page 1 or Page 2.
- **When**: The user clicks the visual's header options (`...`) and selects "Export data" -> "Summarized data (.xlsx)".
- **Then**:
  - A clean `.xlsx` file downloads to the user's local machine within 5 seconds.
  - The exported file contains all active filter selections, proper column headers, and matching numerical values.
