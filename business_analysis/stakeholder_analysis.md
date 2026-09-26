# ShopSphere Stakeholder Analysis & Engagement Matrix

## 1. Stakeholder Assessment Framework
To ensure enterprise alignment and drive user adoption, an exhaustive stakeholder assessment was conducted across commercial, financial, operational, and technical departments. Each stakeholder was evaluated on:
- **Organizational Responsibilities**
- **Core Business Needs & Pain Points**
- **Critical Information Required**
- **Influence & Interest (Power/Interest Grid)**
- **Expected Dashboard Usage & Cadence**

---

## 2. Granular Stakeholder Profiles

### 2.1 Chief Executive Officer (CEO)
- **Role**: Chief Executive Officer
- **Responsibilities**: Overall corporate strategy, investor communication, market positioning, top-line and bottom-line growth.
- **Business Needs**: High-level macro perspective on revenue growth, year-over-year momentum, and strategic risk indicators without getting lost in operational minutiae.
- **Information Required**: Total Net Revenue ($24.4M), Gross Profit ($7.97M), Overall Margin % (32.6%), Regional performance distribution, Active Customer Base.
- **Influence**: High | **Interest**: High (Key Decision Maker / Sponsor)
- **Expected Dashboard Usage**: Weekly executive briefings via **Page 1 (Executive Overview)** and **Page 5 (Management Insights)**.

---

### 2.2 Sales Manager
- **Role**: National Sales Director
- **Responsibilities**: Quota attainment, territory management, B2B sales pipeline, checkout channel performance.
- **Business Needs**: Visibility into regional sales territory performance, B2B corporate customer sales expansion, and high-value client tracking.
- **Information Required**: Revenue by region, corporate customer AOV ($385 vs $210 Consumer), top 20 VIP client accounts, sales by channel.
- **Influence**: High | **Interest**: High
- **Expected Dashboard Usage**: Daily monitoring of **Page 1 (Executive Overview)** and **Page 3 (Customer Analytics)**.

---

### 2.3 Marketing Manager
- **Role**: Head of Growth & Marketing
- **Responsibilities**: Customer acquisition (CAC), promotional campaigns, brand loyalty, discount strategy.
- **Business Needs**: Measure the effectiveness of promotional discounts on customer volume, identify high-converting customer segments, and track repeat buyer loyalty.
- **Information Required**: Repeat customer rate (55.6%), discount rate vs. order volume elasticity, customer lifetime value (LTV), acquisition cohort trends.
- **Influence**: Medium | **Interest**: High
- **Expected Dashboard Usage**: Bi-weekly campaign tracking via **Page 3 (Customer Analytics)** and **Page 2 (Sales & Product Analysis)**.

---

### 2.4 Operations & Logistics Manager
- **Role**: VP of Supply Chain & Fulfillment
- **Responsibilities**: 3PL carrier partnerships, warehousing, on-time delivery SLAs, order dispatch efficiency.
- **Business Needs**: Isolate carrier latency, track late delivery spikes during seasonal Q4 peaks, and identify which shipping tiers fail customer SLAs.
- **Information Required**: Late delivery rate (11.4%), average delay days (3.49 days), carrier SLA breach rates by region, seasonal fulfillment volume.
- **Influence**: High | **Interest**: High
- **Expected Dashboard Usage**: Daily operational monitoring via **Page 4 (Regional & Operations Analysis)**.

---

### 2.5 Finance Manager / CFO
- **Role**: Chief Financial Officer / Controller
- **Responsibilities**: Financial reporting, margin protection, working capital management, COGS auditing.
- **Business Needs**: Eliminate unmonitored margin erosion, identify loss-leader products dragging down net margins, and track discount spend.
- **Information Required**: Gross profit margin by category, product-level COGS vs selling price, discount burn, revenue lost to cancellations ($1.16M).
- **Influence**: High | **Interest**: High
- **Expected Dashboard Usage**: Weekly and month-end close reporting via **Page 1 (Executive Overview)** and **Page 2 (Sales & Product Analysis)**.

---

### 2.6 Customer Support & Experience Manager
- **Role**: Director of Customer Experience (CX)
- **Responsibilities**: Post-purchase customer satisfaction, RMA processing, dispute resolution, customer churn reduction.
- **Business Needs**: Uncover why customers return items, track RMA volume trends, and quantify how shipping delays harm customer trust.
- **Information Required**: Return rate (8.39%), return reason taxonomy (Late Delivery, Size/Fit, Defective), return rate correlation with delayed shipments (19.8% vs 7.1%).
- **Influence**: Medium | **Interest**: High
- **Expected Dashboard Usage**: Weekly RMA review via **Page 4 (Operations)** and **Page 5 (Management Insights)**.

---

### 2.7 Product Merchandising Manager
- **Role**: Head of Product Catalog & Merchandising
- **Responsibilities**: Product assortment planning, vendor brand relationships, inventory replenishment, SKU rationalization.
- **Business Needs**: Identify best-selling SKUs, phase out chronically negative-margin products, and resolve high-return categories.
- **Information Required**: Top 10 revenue-generating SKUs, bottom 10 profit-draining SKUs, category return rates (Apparel at 14.2%), brand sales contribution.
- **Influence**: Medium | **Interest**: High
- **Expected Dashboard Usage**: Weekly assortment planning via **Page 2 (Sales & Product Analysis)**.

---

### 2.8 Lead Data Analyst
- **Role**: Senior Analytics Lead
- **Responsibilities**: Data modeling, quality assurance, statistical analysis, hypothesis testing, SQL query authoring.
- **Business Needs**: Clean, certified staging data with audited referential integrity, standardized data definitions, and automated pipeline scripts.
- **Information Required**: Data quality metrics, schema documentation, correlation coefficients, SQL query execution plans.
- **Influence**: Medium | **Interest**: High
- **Expected Dashboard Usage**: Continuous maintenance, statistical verification, and analytical ad-hoc querying.

---

### 2.9 BI Developer
- **Role**: Senior BI Developer
- **Responsibilities**: Power BI data modeling, Star Schema implementation, DAX optimization, dashboard UI/UX formatting.
- **Business Needs**: Clear visual wireframes, pre-defined DAX formulas, validated relationship cardinalities, and responsive user filters.
- **Information Required**: Fact and dimension table definitions, KPI calculation rules, visual layout specifications.
- **Influence**: Medium | **Interest**: High
- **Expected Dashboard Usage**: Development, report maintenance, user access governance, and report publishing.

---

## 3. Power vs. Interest Stakeholder Grid

```
HIGH POWER |  [Keep Satisfied]           |  [Manage Closely]
           |                             |  - CEO
           |                             |  - Finance Manager / CFO
           |                             |  - Operations Manager
           |                             |  - Sales Manager
-----------+-----------------------------+-----------------------------
LOW POWER  |  [Monitor]                  |  [Keep Informed & Empower]
           |                             |  - Marketing Manager
           |                             |  - Product Manager
           |                             |  - Customer Support Manager
           |                             |  - Data Analyst / BI Developer
           +-----------------------------+-----------------------------
                         LOW INTEREST                 HIGH INTEREST
```
