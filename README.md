# ShopSphere — E-commerce Sales, Customer & Business Performance Analytics

> **End-to-End Enterprise Data Analyst + Business Analyst Portfolio Project**  
> *Production-Ready Analytics Architecture, Dimensional Star Schema, Advanced SQL, Python EDA & Statistical Testing, Power BI Dashboard Suite, Production Excel Model, and Complete Business Analysis Deliverables.*

---

## 1. Project Overview
**ShopSphere** is an end-to-end, enterprise-scale analytics solution built for a multi-regional digital retail platform. The platform operates across five geographic territories (West, East, Central, South, North) offering 525 products across five commercial categories (Electronics, Apparel & Fashion, Home & Kitchen, Beauty & Personal Care, Sports & Fitness) to an active customer base of over 50,000 registered accounts.

This project demonstrates the complete analytical lifecycle from **consultative business analysis** (problem elicitation, stakeholder alignment, BRD, FRD, user stories, acceptance criteria, gap analysis, business rules, KPI dictionaries, UAT) to **technical data analysis and engineering** (data hygiene profiling, deterministic Python ETL, ANSI SQL analysis, statistical hypothesis testing, Kimball dimensional modeling, certified DAX measure engineering, and interactive dashboard development).

---

## 2. Business Problem Statement
Despite scaling commercial gross merchandise sales to over **$24.4M net revenue across 102,420 orders** over a 36-month timeline (2023–2025), ShopSphere operated without a centralized analytical architecture:
1. **Reporting Latency**: Monthly financial and operational review packs required **8 to 10 business days** of manual spreadsheet stitching.
2. **Margin Dilution & Loss Leaders**: High sales volumes in Electronics masked promotional margin compression and loss-leader SKUs.
3. **Escalating Reverse Logistics Costs**: Product returns averaged **8.39% ($2.1M returned merchandise)**, peaking at 14.2% in Apparel.
4. **Logistics Latency Inducing Returns**: Over **11% of shipments missed promised customer SLAs**, which empirical analysis revealed triggered a **2.8x surge in product return rates**.
5. **Decentralized Metrics**: Conflicting formulas between Sales, Finance, and Operations undermined executive decision-making.

---

## 3. Project Objectives
- **Single Source of Truth (SSOT)**: Build an audited relational database and dimensional Star Schema unifying sales, customer profiles, product catalog, delivery SLAs, and returns.
- **Reporting Velocity**: Reduce executive reporting turnaround from 10 days to automated refreshes (**< 5 minutes**).
- **Margin Optimization**: Identify and isolate loss-leader SKUs and quantify the margin erosion caused by promotional discounts (> 20%).
- **Operational SLA Accountability**: Establish empirical root-cause correlation between carrier delivery tardiness and reverse logistics return spikes.
- **Enterprise Alignment**: Provide a complete, traceable requirements architecture connecting executive business goals directly to verified UAT test cases.

---

## 4. Business Questions Answered
1. What is the enterprise monthly net revenue, gross profit, and margin trajectory over 36 months?
2. Which product categories and specific SKUs generate high sales volume but operate at compressed or negative margins?
3. What is the empirical relationship between promotional discount depth and gross profit margin?
4. How do carrier delivery delays impact customer product return rates and reverse logistics costs?
5. What are the dominant customer-reported root causes for returns in high-return categories like Apparel?
6. How do customer purchasing behaviors, basket sizes, and Average Order Values (AOV) differ across Consumer, Corporate, and Small Business segments?
7. What proportion of active customers return for repeat purchases, and what is the lifetime value (LTV) of top VIP accounts?
8. Which geographic territories suffer the highest delivery delays and order cancellations?

---

## 5. Project Architecture & Flow

```
[Operational Source Feeds] ──> (customers.csv, products.csv, orders.csv, delivery.csv, returns.csv)
                                              │
                                              ▼
[Data Engineering & Quality] ──> (clean_and_profile.py / data_validation.py / 13 Unit Tests)
                                              │
                                              ▼
[Audited Staging Layer] ─────> (data/processed/ ── 100% Referential Integrity)
                                              │
               ┌──────────────────────────────┴──────────────────────────────┐
               ▼                                                             ▼
[Relational Database (SQLite / Postgres)]                  [Kimball Star Schema (Power BI)]
   - database/shopsphere.db                                   - FactOrders, FactDelivery, FactReturns
   - database/schema.sql                                      - DimCustomer, DimProduct, DimDate
   - sql/ (32 Complex Analytical Queries)                     - 16 Certified DAX Measures
               │                                                             │
               ▼                                                             ▼
[Python EDA & Hypothesis Testing]                          [Interactive Reporting Suite]
   - 01_data_quality.ipynb                                    - 5-Page Power BI Dashboard Suite
   - 02_data_cleaning.ipynb                                   - 8-Sheet Production Excel Model
   - 03_eda.ipynb                                                            │
   - 04_statistical_analysis.ipynb                                           ▼
                                                           [Executive Strategy & Handover]
                                                              - Root Cause Analysis (5-Whys)
                                                              - Cross-Functional Recommendations
                                                              - Executive Briefing & UAT Sign-Off
```

---

## 6. Dataset Summary & Commercial Baseline (2023 – 2025)

| Metric Dimension | Verified Baseline Value | Metric Dimension | Verified Baseline Value |
|---|---|---|---|
| **Total Net Commercial Revenue** | **$24,435,345.82** | **Active Purchasing Customers** | **27,200 Accounts** |
| **Total Gross Merchandise Revenue** | **$26,498,021.38** | **Repeat Customer Rate** | **55.60% (15,122 Repeat Buyers)** |
| **Total Cost of Goods Sold (COGS)** | **$16,462,054.98** | **Average Order Value (AOV)** | **$238.58** |
| **Total Realized Gross Profit** | **$7,973,290.84** | **Platform Product Return Rate** | **8.39% (10,594 Orders)** |
| **Enterprise Gross Profit Margin %** | **32.63%** | **Late Delivery Rate (> Promised SLA)**| **11.38% (11,660 Shipments)** |
| **Total Processed Orders** | **102,420 Transactions** | **Mean Delay (Late Shipments)** | **3.49 Calendar Days** |
| **Total Active Catalog SKUs** | **525 Products** | **Pre-Delivery Cancellation Rate** | **4.77% ($1.16M Lost Gross Sales)** |

---

## 7. Business Analyst Work & Governance Deliverables
The repository contains a complete suite of enterprise Business Analysis documentation located in `business_analysis/`:
- [Project Charter](file:///e:/ShopSphere/business_analysis/project_charter.md): Background, objectives, scope boundaries, risks, assumptions, and success criteria.
- [Stakeholder Analysis Matrix](file:///e:/ShopSphere/business_analysis/stakeholder_analysis.md): Detailed profiles and Power/Interest grids for 9 organizational stakeholders.
- [Business Requirements Document (BRD)](file:///e:/ShopSphere/business_analysis/BRD.md): 16 prioritized business requirements (`BR-001` through `BR-016`).
- [Functional Requirements Document (FRD)](file:///e:/ShopSphere/business_analysis/functional_requirements.md): 16 technical functional requirements specifying input data, calculation rules, and visual behaviors (`FR-001` through `FR-016`).
- [Agile User Stories](file:///e:/ShopSphere/business_analysis/user_stories.md): 12 standardized user stories (`US-001` through `US-012`).
- [Acceptance Criteria (BDD)](file:///e:/ShopSphere/business_analysis/acceptance_criteria.md): Given/When/Then acceptance criteria for all major features.
- [As-Is Process Map](file:///e:/ShopSphere/business_analysis/as_is_process.md): Detailed workflow documentation and Mermaid diagram of legacy reporting bottlenecks.
- [To-Be Process Map](file:///e:/ShopSphere/business_analysis/to_be_process.md): Target-state architecture eliminating 95% of reporting latency.
- [Gap Analysis Matrix](file:///e:/ShopSphere/business_analysis/gap_analysis.md): Cross-dimensional evaluation comparing Current vs. Future states across Process, Data, Tech, Reporting, and Strategy.
- [Business Rules Document](file:///e:/ShopSphere/business_analysis/business_rules.md): 12 immutable mathematical and operational business rules, clearly demarcating requirements vs rules vs functional behaviors.
- [KPI Dictionary](file:///e:/ShopSphere/business_analysis/KPI_dictionary.md): Authoritative dictionary defining formulas, data sources, update cadence, owners, and benchmark targets for 16 KPIs.
- [User Acceptance Testing (UAT) Suite](file:///e:/ShopSphere/business_analysis/UAT_test_cases.md): 16 formal UAT test scenarios with 100% verified `PASS` status.
- [Requirements Traceability Matrix (RTM)](file:///e:/ShopSphere/business_analysis/requirements_traceability_matrix.md): Complete bi-directional traceability connecting BR → FR → US → AC → Visuals → KPIs → UAT.

---

## 8. Data Analyst Work & Technical Deliverables

### 8.1 Automated Data Hygiene & Quality Engineering
- **Script**: `python/scripts/clean_and_profile.py`
- **Automated Validation Suite**: `tests/data_validation.py`
- Enforces 13 automated unit tests verifying primary key uniqueness, foreign key integrity, non-negative quantities, valid price bounds, discount constraints, and temporal order-to-delivery sequencing.
- Documented in [data_quality_report.md](file:///e:/ShopSphere/documentation/data_quality_report.md).

### 8.2 Relational Database Schema & Seeding
- **Database**: SQLite 3 database (`database/shopsphere.db`) and ANSI-compliant SQL scripts (`database/schema.sql`, `seed_data.sql`).
- Relational schema enforcing primary/foreign keys, domain check constraints, and B-Tree indexes for fast analytical query execution.

### 8.3 Advanced SQL Analytical Library (32 Queries Across 6 Files)
- [01_basic_analysis.sql](file:///e:/ShopSphere/sql/01_basic_analysis.sql): Overall order volume, financial baseline, AOV, payment methods, shipping tiers.
- [02_sales_analysis.sql](file:///e:/ShopSphere/sql/02_sales_analysis.sql): Monthly trends, MoM revenue/profit growth using `LAG()`, YoY performance, day-of-week volume.
- [03_customer_analysis.sql](file:///e:/ShopSphere/sql/03_customer_analysis.sql): Customer segment economics, Top 20 VIP accounts using `DENSE_RANK()`, purchase frequency buckets, repeat customer rates (55.6%), cohort retention, and RFM scoring using `NTILE(4)`.
- [04_product_analysis.sql](file:///e:/ShopSphere/sql/04_product_analysis.sql): Category performance, Top 10 best sellers, Bottom 10 profit drains, loss-leader SKU identification, and category return rates.
- [05_operations_analysis.sql](file:///e:/ShopSphere/sql/05_operations_analysis.sql): Regional sales density, delivery SLA breakdown, average delay days by shipping tier, delivery delay vs return correlation, cancellations, and return reasons.
- [06_advanced_analysis.sql](file:///e:/ShopSphere/sql/06_advanced_analysis.sql): Cohort cumulative LTV progression, Pareto 80/20 customer concentration, 3-month rolling averages, and executive scorecard.

### 8.4 Jupyter Notebooks Suite
- [01_data_quality.ipynb](file:///e:/ShopSphere/python/01_data_quality.ipynb): Raw data profiling, null patterns, duplicate detection, and outlier analysis.
- [02_data_cleaning.ipynb](file:///e:/ShopSphere/python/02_data_cleaning.ipynb): Deterministic cleaning pipeline, date parsing, text normalization, and financial feature engineering.
- [03_eda.ipynb](file:///e:/ShopSphere/python/03_eda.ipynb): Multi-dimensional exploratory analysis with paired findings, interpretations, and business implications.
- [04_statistical_analysis.ipynb](file:///e:/ShopSphere/python/04_statistical_analysis.ipynb): Parametric and non-parametric distribution metrics, correlation matrices, OLS regression, Chi-Square test of independence, and One-Way ANOVA.

### 8.5 Production Microsoft Excel Workbook
- Located at [ShopSphere_Analysis.xlsx](file:///e:/ShopSphere/excel/ShopSphere_Analysis.xlsx).
- Contains 8 professionally formatted sheets utilizing advanced formulas (`XLOOKUP`, `SUMIFS`, `COUNTIFS`, `IFERROR`), dynamic pivot matrix tables, conditional formatting, and KPI scorecards.

### 8.6 Power BI Data Model & Dashboard Suite
- [Data Model Specification](file:///e:/ShopSphere/powerbi/data_model.md): Kimball Star Schema architecture (`FactOrders`, `FactDelivery`, `FactReturns`, `DimCustomer`, `DimProduct`, `DimDate`).
- [DAX Measures Library](file:///e:/ShopSphere/powerbi/dax_measures.md): 16 certified DAX measures organized into 5 functional folders.
- [Dashboard Specification](file:///e:/ShopSphere/powerbi/dashboard_specification.md): Granular UI/UX layouts, visual configurations, coordinates, and styling tokens for the 5-page report:
  - **Page 1**: Executive Overview
  - **Page 2**: Sales & Product Analysis
  - **Page 3**: Customer Analytics
  - **Page 4**: Regional & Operations Analysis
  - **Page 5**: Management Insights & Decision Matrix

---

## 9. Key Empirical Insights
1. **Delivery Delays Drive a 2.8x Surge in Product Returns**: On-time orders exhibit an ~7.1% return rate, whereas orders marked "Delivered Late" suffer an **19.84% return rate** ($\chi^2 = 1842.15, p < 0.001$).
2. **Electronics Margin Squeeze**: Electronics contributes **44.8% of sales volume** ($11.9M) but only **27.6% of gross profit** ($2.2M) due to low gross margins (18.5%) and unconstrained discounting on loss-leader tech hardware.
3. **Apparel Sizing Returns**: Apparel & Fashion commands strong 58.2% gross margins but suffers from an **elevated 14.2% return rate** ($684K returned), with **58.4% of returns driven by sizing and fit mismatches**.
4. **Corporate B2B Opportunity**: Corporate accounts deliver an Average Order Value of **$386.42** (84% higher than retail consumers at $210.15) with lower cancellation rates (3.8%).
5. **Q4 Seasonality Bottlenecks**: Holiday order volumes surge by **+55% in November-December**, doubling carrier late delivery rates to 21.8% and driving substantial January return surges.

---

## 10. Strategic Recommendations
- **Supply Chain**: Enforce 3PL penalty clauses for late delivery rates exceeding 5%; establish a forward-deployed fulfillment depot in Texas to service Central/South customers within 48 hours.
- **Merchandising**: Implement automated minimum-margin pricing floors (blocking discounts on products under 15% margin); mandate high-margin accessory attach rules.
- **Product & UX**: Deploy an interactive 3D digital sizing tool and standardized measurement charts on all apparel product pages.
- **Commercial Sales**: Launch a dedicated "ShopSphere Business" corporate portal featuring volume discounts, invoice billing, and Net-30 payment terms.
- **Customer Experience**: Deploy automated SMS verification for Cash on Delivery purchases and send proactive courtesy credits when delivery delays occur to defuse return intent.

---

## 11. Project Repository Structure

```
shopsphere-analytics/
├── README.md                                  # Master project documentation
│
├── data/
│   ├── raw/                                   # Immutable raw operational feeds
│   │   ├── customers.csv
│   │   ├── products.csv
│   │   ├── orders.csv
│   │   ├── delivery.csv
│   │   └── returns.csv
│   ├── processed/                             # Audited, cleaned staging datasets
│   │   ├── customers.csv
│   │   ├── products.csv
│   │   ├── orders.csv
│   │   ├── delivery.csv
│   │   └── returns.csv
│   └── data_dictionary.csv                    # Machine-readable schema dictionary
│
├── database/
│   ├── schema.sql                             # Relational DDL schema & indexes
│   ├── seed_data.sql                          # DML import instructions & COPY commands
│   └── shopsphere.db                          # Seeded SQLite database (32 queries verified)
│
├── sql/
│   ├── 01_basic_analysis.sql                  # Baseline volumes, financials, AOV, channels
│   ├── 02_sales_analysis.sql                  # Monthly trends, MoM/YoY growth via LAG()
│   ├── 03_customer_analysis.sql               # Segments, LTV, repeat rates, RFM scoring
│   ├── 04_product_analysis.sql                # Category performance, top/bottom SKUs, loss leaders
│   ├── 05_operations_analysis.sql             # Regional SLAs, delay vs return correlation, cancellations
│   └── 06_advanced_analysis.sql               # Cohort LTV, Pareto 80/20, rolling averages, scorecard
│
├── python/
│   ├── 01_data_quality.ipynb                  # Data profiling & missingness audit
│   ├── 02_data_cleaning.ipynb                 # Deterministic cleaning & feature engineering
│   ├── 03_eda.ipynb                           # Exploratory data analysis & business interpretations
│   ├── 04_statistical_analysis.ipynb          # Distribution profiling, OLS, Chi-Square, ANOVA
│   └── scripts/
│       ├── generate_data.py                   # Synthetic generation script with business rules
│       ├── clean_and_profile.py               # Data cleaning, DB seeding & baseline calculation
│       ├── build_notebooks.py                 # Jupyter Notebook generation script
│       └── build_excel.py                     # Excel workbook generation script
│
├── excel/
│   └── ShopSphere_Analysis.xlsx               # 8-Sheet production workbook with formulas & pivots
│
├── powerbi/
│   ├── README.md                              # Power BI architecture & recreation steps
│   ├── data_model.md                          # Kimball Star Schema specification
│   ├── dax_measures.md                        # Complete DAX measures library
│   └── dashboard_specification.md             # 5-Page visual UI/UX layout specification
│
├── business_analysis/
│   ├── project_charter.md                     # Project charter, scope, and objectives
│   ├── stakeholder_analysis.md                # 9 Stakeholder profiles & Power/Interest grid
│   ├── BRD.md                                 # Business Requirements Document (16 BRs)
│   ├── functional_requirements.md             # Functional Requirements Document (16 FRs)
│   ├── user_stories.md                        # 12 Agile User Stories
│   ├── acceptance_criteria.md                 # Given/When/Then acceptance criteria
│   ├── as_is_process.md                       # Current-state workflow & pain points
│   ├── to_be_process.md                       # Future-state architecture & workflow
│   ├── gap_analysis.md                        # Gap analysis matrix across 6 dimensions
│   ├── business_rules.md                      # 12 Immutable business calculation rules
│   ├── KPI_dictionary.md                      # Authoritative KPI governance dictionary
│   ├── UAT_test_cases.md                      # 16 Formal UAT test scenarios (100% Pass)
│   └── requirements_traceability_matrix.md    # End-to-end RTM matrix
│
├── documentation/
│   ├── data_quality_report.md                 # Detailed data quality assessment report
│   ├── data_dictionary.md                     # Comprehensive markdown data dictionary
│   ├── methodology.md                         # End-to-end delivery framework
│   ├── insights.md                            # 10 Evidence-backed business findings
│   ├── root_cause_analysis.md                 # 5 Deep-dive RCAs (5-Whys, Pareto)
│   ├── recommendations.md                     # Cross-functional strategic recommendations
│   ├── executive_summary.md                   # 1-Page C-suite executive briefing
│   ├── project_walkthrough.md                 # Master interview preparation walkthrough
│   └── verified_metrics.txt                   # Baseline numbers reference sheet
│
├── tests/
│   └── data_validation.py                     # Automated 13-point data integrity test suite
│
└── resume/
    ├── resume_project_description.md          # Resume bullets & 30s/2m elevator pitches
    └── interview_questions.md                 # 45 Categorized interview Q&As
```

---

## 12. How to Run & Reproduce the Project

### Prerequisites
- Python 3.10+ installed
- Required Python libraries:
  ```bash
  pip install pandas numpy openpyxl matplotlib seaborn scipy nbformat
  ```

### Step 1: Re-Generate Synthetic Data (Optional)
```bash
python python/scripts/generate_data.py
```

### Step 2: Execute Cleaning, Profiling & SQLite Database Seeding
```bash
python python/scripts/clean_and_profile.py
```

### Step 3: Run Automated Data Validation Test Suite
```bash
python tests/data_validation.py
```

### Step 4: Re-Generate Excel Model and Jupyter Notebooks
```bash
python python/scripts/build_excel.py
python python/scripts/build_notebooks.py
```

### Step 5: Execute SQL Analysis
Connect to `database/shopsphere.db` using any SQLite client (or run queries directly via DBeaver, VS Code, or Python script).

---

## 13. Future Improvements & Next Steps
1. **Dynamic Inventory Optimization**: Integrate warehouse stock levels and supplier reorder lead times to predict and prevent out-of-stock events during Q4 peaks.
2. **Predictive Customer Churn Modeling**: Develop a machine learning classification model (Logistic Regression / Random Forest) to identify customers at risk of churn based on days since last purchase.
3. **Automated Marketing Personalization**: Deploy recommendation algorithms to suggest high-margin accessories during checkout, raising overall basket margins.
