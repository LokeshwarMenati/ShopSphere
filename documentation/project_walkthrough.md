# ShopSphere End-to-End Project Walkthrough & Master Interview Guide

## How to Use This Document
This document is a comprehensive, stage-by-stage walkthrough of the entire **ShopSphere Analytics** project. It is specifically designed for candidates preparing for interviews as a **Data Analyst**, **Junior Data Analyst**, **Business Analyst**, **Junior Business Analyst**, **BI Analyst**, or **Reporting Analyst**.

Read this guide to understand how every phase connects logically to the next — from the initial business problem to data engineering, SQL, statistical modeling, BI dashboards, root cause analysis, and executive recommendations.

---

## Stage 1: The Business Problem
- **Company Context**: ShopSphere is a multi-regional digital retail platform selling 525 products across 5 departments (Electronics, Apparel, Home, Beauty, Sports) to 50,000+ customers.
- **The Challenge**: The company generated $24.4M in net sales over 3 years, but reporting was fragmented across legacy spreadsheets. Month-end executive reporting took 10 business days. Leadership could not diagnose why margins were eroding, why returns were rising, or how logistics delays impacted customer churn.
- **Our Dual Role**:
  - As **Business Analyst**: Gather requirements, interview stakeholders, map As-Is vs To-Be workflows, define business rules, formulate user stories, and manage UAT.
  - As **Data Analyst**: Audit data hygiene, clean datasets, write complex SQL queries, conduct Python EDA and statistical testing, build the Power BI Star Schema, and derive actionable insights.

---

## Stage 2: Stakeholder Discovery & Analysis
We identified 9 key organizational stakeholders, each with distinct needs:
- **CEO**: Needs macro sales velocity, corporate growth (+14% YoY), and executive decision cards.
- **CFO / Finance**: Needs true gross margins, COGS auditing, and detection of loss-leader SKUs.
- **Operations Manager**: Needs carrier fulfillment SLA monitoring, late delivery percentages, and delay days.
- **Merchandising Manager**: Needs category margin efficiency, best sellers, and return rates.
- **Customer Support Lead**: Needs return reason classification and cancellation attribution.
- **Marketing Manager**: Needs repeat purchase rates (55.6%) and promotional discount elasticity.

---

## Stage 3: Requirements Engineering (BRD & FRD)
- **Business Requirements (BRD)**: Formalized 16 business requirements (`BR-001` to `BR-016`) prioritizing margin protection, logistics SLA tracking, customer retention, and self-service BI.
- **Functional Requirements (FRD)**: Authored 16 technical functional requirements (`FR-001` to `FR-016`) defining input fields, computational logic, and UI visual behaviors.
- **Agile User Stories & Acceptance Criteria**: Created 12 user stories (`US-001` to `US-012`) with Given/When/Then acceptance criteria (e.g. *Given the user selects "West", When the dashboard refreshes, Then all sales KPIs update dynamically to the West region*).

---

## Stage 4: Process Analysis (As-Is vs. To-Be & Gap Analysis)
- **As-Is Process**: Customer Order → Transaction DB → Manual CSV Exports → 3 Days of VLOOKUP stitching in Excel → Conflicting numbers → 10 Days reporting latency.
- **To-Be Process**: Centralized Data Lake → Automated Python/SQL Data Quality Engine → Relational Staging Layer → Dimensional Star Schema in Power BI → 5-minute automated refresh.
- **Gap Analysis**: Closed 6 major organizational gaps across Process, Data Hygiene, Interactivity, Technology Scalability, KPI Governance, and Decision-Making.

---

## Stage 5: Dataset Architecture & Business Relationships
The dataset spans 3 full calendar years (2023 to 2025) and models realistic commercial relationships:
1. `customers.csv` (50,500 profiles): Captures demographics, regional territories, registration dates, and segment tiers (`Consumer`, `Corporate`, `Small Business`).
2. `products.csv` (525 SKUs): Catalogs product hierarchy, wholesale cost (COGS), and list prices.
3. `orders.csv` (102,420 orders): Line-item transactions capturing quantities, discounts, payment channels, and fulfillment statuses.
4. `delivery.csv` (102,420 tracking rows): Logs promised checkout SLAs, carrier completion dates, delay days, and milestone statuses.
5. `returns.csv` (10,594 records): Tracks customer return authorizations (RMA), return dates, quantities, and customer reason codes.

---

## Stage 6: Data Quality Assessment & Profiling
Prior to modeling, we audited raw ingestion files for intentional, realistic data defects:
- **Duplicates**: Pruned duplicate primary keys across customers (180), products (8), orders (220), delivery (210), and returns (50).
- **Inconsistent Casing**: Normalized string casing variations (`electronics`, `ELECTRONICS` → `Electronics`).
- **Date Standardization**: Parsed non-standard date formats (`DD/MM/YYYY`, `YYYY/MM/DD`) into standard ISO `YYYY-MM-DD`.
- **Outliers**: Imputed biological age outliers (`-5`, `150`) with median customer age (35 years); capped extreme quantity entry errors.
- **Referential Pruning**: Discarded 80 orphaned order records lacking valid customer or product keys.
- **Automated Validation**: Deployed `tests/data_validation.py` running 13 automated unit tests with a 100% pass rate.

---

## Stage 7: Data Cleaning & Feature Engineering
Cleaned datasets were persisted to `data/processed/` without altering raw files:
- Engineered core financial features:
  - $\text{Gross Revenue} = \text{quantity} \times \text{unit\_price}$
  - $\text{Net Revenue} = \text{Gross Revenue} \times (1 - \text{discount})$
  - $\text{Total Cost} = \text{quantity} \times \text{unit\_cost}$
  - $\text{Gross Profit} = \text{Net Revenue} - \text{Total Cost}$
  - $\text{Profit Margin \%} = (\text{Gross Profit} / \text{Net Revenue}) \times 100$
  - $\text{Delay Days} = \max(0, \text{actual\_date} - \text{promised\_date})$

---

## Stage 8: Relational Database Implementation
- **Database**: SQLite 3 database (`database/shopsphere.db`) and ANSI-compliant SQL scripts (`database/schema.sql`, `seed_data.sql`).
- **Schema**: Enforced primary keys, foreign key cascading constraints, check constraints (`quantity > 0`, `discount BETWEEN 0 AND 1`), and performance indexes on customer IDs, order dates, and status codes.

---

## Stage 9: Deep SQL Analysis (32 Queries Across 6 Files)
Authored and verified 32 comprehensive SQL queries:
1. `01_basic_analysis.sql`: Order status distribution, financial baseline ($24.4M net sales, $7.97M profit), AOV ($238.58), payment channels, and shipping tiers.
2. `02_sales_analysis.sql`: Monthly trends, MoM revenue/profit growth using `LAG()`, YoY performance, and day-of-week volume.
3. `03_customer_analysis.sql`: Customer segment economics, Top 20 VIP accounts using `DENSE_RANK()`, purchase frequency buckets, repeat customer rate (55.60%), cohort retention, and RFM scoring using `NTILE(4)`.
4. `04_product_analysis.sql`: Category performance, Top 10 best sellers, Bottom 10 profit drains, loss-leader SKU identification, and category return rates.
5. `05_operations_analysis.sql`: Regional sales density, delivery SLA breakdown, average delay days by shipping tier, delivery delay vs return correlation, cancellations, and return reasons.
6. `06_advanced_analysis.sql`: Cohort cumulative LTV progression, Pareto 80/20 customer concentration, 3-month rolling averages, and executive scorecard.

---

## Stage 10: Python Exploratory Data Analysis (EDA)
In `03_eda.ipynb`, we uncovered major empirical trends:
- **Seasonality**: November-December sales surge by +55% over baseline, followed by a 25% contraction in January.
- **Category Disparity**: Electronics generates 45% of sales volume but only 28% of profit (18.5% margin), while Apparel and Beauty deliver 58%–66% margins.
- **Segment Contribution**: Corporate accounts achieve an AOV of $386.42 vs $210.15 for Consumers.
- **Every chart was paired with**: Finding, Interpretation, and Business Implication.

---

## Stage 11: Statistical Analysis & Hypothesis Testing
In `04_statistical_analysis.ipynb`, we proved hypotheses empirically:
- **Hypothesis 1 (Discount vs Margin)**: Pearson linear regression confirmed a severe negative correlation ($r = -0.52, p < 0.001$), proving deep discounts destroy dollar margin.
- **Hypothesis 2 (Delivery Delay vs Returns)**: Pearson Chi-Square test ($\chi^2 = 1842.15, p < 0.001$) rejected independence, proving delays directly cause return spikes.
- **Hypothesis 3 (Segment AOV)**: One-Way ANOVA ($F = 214.5, p < 0.001$) confirmed statistically significant spending differences across customer tiers.
- **Methodological Disclaimer**: Correlation was carefully separated from causation.

---

## Stage 12: Production Excel Model
Created `excel/ShopSphere_Analysis.xlsx` containing 8 formatted sheets:
- Executive Summary, KPI Analysis (with `SUMIFS`, `IFERROR`, MoM formulas, line chart), Sales Analysis (with dynamic `XLOOKUP` SKU tool), Customer Analysis, Product Analysis, Regional Analysis, Pivot Matrix, and Data Quality Audit.

---

## Stage 13: Power BI Dimensional Star Schema
- Modeled conformed dimensions (`DimCustomer`, `DimProduct`, `DimDate`) filtering transactional facts (`FactOrders`, `FactDelivery`, `FactReturns`).
- Eliminated bi-directional ambiguity; hidden raw foreign keys; optimized columnar VertiPaq compression.

---

## Stage 14: Certified DAX Measures Suite
Authored 16 DAX measures across 5 display folders:
- Core Financials: `[Total Gross Revenue]`, `[Total Net Revenue]`, `[Gross Profit]`, `[Profit Margin %]`.
- Volume & Basket: `[Total Orders]`, `[Total Customers]`, `[Average Order Value (AOV)]`.
- Time Intelligence: `[Previous Month Revenue]`, `[Revenue Growth % (MoM)]`, `[Previous Year Revenue]`, `[Profit Growth % (YoY)]`.
- Customer & Operations: `[Repeat Customer Rate %]`, `[Customer Lifetime Value (LTV)]`, `[Return Rate %]`, `[Cancellation Rate %]`, `[Average Delivery Delay]`.

---

## Stage 15: 5-Page Power BI Dashboard Specification
Detailed layout specifications and visual hierarchies:
- **Page 1: Executive Overview**: Top KPI cards, 36-month sales and profit trend, regional split, category contribution.
- **Page 2: Sales & Product Analysis**: Merchandising matrix drill-down, top 10 best sellers, bottom 10 profit drains, discount scatter plot.
- **Page 3: Customer Analytics**: New vs returning revenue, segment economics, purchase frequency distribution, Top 20 VIP accounts.
- **Page 4: Regional & Operations Analysis**: Regional SLA performance, carrier fulfillment funnel, delivery delay vs return correlation, return reason taxonomy.
- **Page 5: Management Insights**: Decision-focused action cards with empirical evidence, priority, responsible team, and target KPI.

---

## Stage 16: Root Cause Analysis (RCA) & Recommendations
- **RCA Findings**: Conducted 5-Whys on delivery delay return spillovers, electronics margin dilution, apparel sizing returns, COD cancellation friction, and Q4 holiday chokepoints.
- **Recommendations**: Provided cross-functional recommendations across Sales (B2B portal), Marketing (discount caps), Merchandising (loss-leader floors & 3D sizing guide), Supply Chain (Texas regional hub & 3PL penalty clauses), CX (automated COD verification), and Finance (centralized SSOT).

---

## Stage 17: User Acceptance Testing (UAT) & Sign-Off
- Executed 16 UAT test scenarios verifying filter interactions, currency calculations, date ranges, drill-downs, and Excel exports.
- Achieved **100% Pass Rate (16/16)** with zero critical defects.
- Completed the **Requirements Traceability Matrix (RTM)** establishing 100% line-of-sight from business needs to verified deliverables.
