# ShopSphere Project Charter

## 1. Project Identification
- **Project Name**: ShopSphere — E-commerce Sales, Customer & Business Performance Analytics
- **Project Sponsor**: Executive Leadership Team (CEO, CFO, COO)
- **Lead Business Analyst**: Senior BA Lead
- **Lead Data Analyst / BI Developer**: Analytics Lead
- **Target Launch Date**: Q4 2026
- **Current Lifecycle State**: Production Implementation & Handover

---

## 2. Business Background & Context
ShopSphere is a rapidly scaling multi-category digital retail platform operating across five geographical regions (West, East, Central, South, North). The company has accumulated over 100,000 order transactions, 50,000 registered customer profiles, and a growing catalog of 500+ SKUs spanning Electronics, Apparel, Home & Kitchen, Beauty, and Sports.

Despite strong top-line sales growth ($24.4M net sales over 3 years), executive management lacks a single source of truth (SSOT). Reporting is heavily fragmented across disparate operational silos, manual spreadsheets, and delayed month-end ad-hoc extracts. Consequently, leadership faces critical blind spots regarding true product margins, escalating reverse logistics costs, and carrier delivery delays.

---

## 3. Core Business Problem
1. **Margin Dilution & Loss Leaders**: High sales volumes in promotional categories mask compressed or negative gross margins.
2. **Reverse Logistics Burden**: Customer return rates are escalating (averaging 8.39%, and over 14% in Apparel), destroying profitability and incurring substantial freight overhead.
3. **Logistics Bottlenecks**: Over 11% of shipments miss promised customer delivery SLAs, which preliminary observations indicate causes customer churn and returns.
4. **Data Inconsistency & Reporting Latency**: Disjointed Excel workbooks produce conflicting numbers, requiring up to 10 business days after month-end to compile executive review packages.

---

## 4. Project Objectives (SMART)
- **Objective 1 (Centralized Single Source of Truth)**: Establish an audited, automated relational data repository and dimensional star schema consolidating orders, customers, products, delivery, and returns by end of implementation.
- **Objective 2 (Reporting Acceleration)**: Reduce executive reporting cycle time from 10 business days to near-real-time automated dashboard refreshes (< 5 minutes).
- **Objective 3 (Actionable Visibility)**: Provide drill-down capability across products, regions, customer cohorts, and fulfillment SLAs to identify at least 5 major operational bottlenecks and margin recovery opportunities.
- **Objective 4 (Operational Optimization)**: Uncover empirical root causes connecting delivery delays to return rates, enabling operations to formulate targeted SLA remediation plans.

---

## 5. Project Scope

### In-Scope:
- Ingestion, hygiene profiling, and cleaning of historical data (2023-2025: 102,000+ orders, 50,000+ customers, 525 products, delivery tracking, and returns).
- Relational database schema design and SQLite/PostgreSQL seed implementation.
- In-depth SQL analytical library (32 queries across sales, customers, products, and operations).
- Exploratory data analysis (EDA) and hypothesis testing using Python (Pandas, SciPy, Seaborn).
- 5-page interactive Power BI dashboard suite with DAX measure library.
- Production Excel analytical model with formulaic scorecards and pivot analysis.
- Comprehensive Business Analysis artifacts (BRD, FRD, User Stories, Acceptance Criteria, Process Maps, Gap Analysis, UAT Test Suite, Traceability Matrix).

### Out-of-Scope:
- Real-time streaming data ingestion (Kafka/Flink) — batch updates are sufficient for analytical reporting.
- Production ERP transactional database re-engineering.
- Black-box deep learning or predictive AI models that lack regulatory interpretability.
- Multi-cloud infrastructure orchestration (AWS/GCP/Azure) — focus is on analytical modeling and business intelligence.

---

## 6. Stakeholders & Governance

| Stakeholder Role | Representative | Primary Interest & Engagement |
|---|---|---|
| **Chief Executive Officer (CEO)** | Executive Sponsor | Macro revenue trajectory, market share, corporate growth, executive dashboard review. |
| **VP of Finance / CFO** | Financial Governance | Gross margins, product profitability, discount governance, cash flow, AOV. |
| **VP of Supply Chain & Operations**| Operational Lead | Carrier delivery delays, SLA breach rates, regional fulfillment bottlenecks. |
| **VP of Merchandising** | Commercial Lead | Category margins, SKU velocity, loss leaders, inventory turnover. |
| **Customer Experience Director** | Retention Lead | Return merchandise rates, return root causes, customer lifetime value. |
| **Data Analyst & BI Developer** | Technical Lead | Data hygiene, ETL pipeline, SQL queries, DAX architecture, report design. |
| **Business Analyst** | Process Lead | Requirements elicitation, user stories, business rules, UAT sign-off. |

---

## 7. Assumptions, Constraints & Dependencies

### Assumptions:
- Historical transaction records in source systems reflect finalized commercial settlements.
- Operational carrier delivery timestamps are logged reliably by 3PL logistics partners.
- Business users possess basic familiarity with Power BI report filtering and slice-and-dice functionality.

### Constraints:
- Analytics solution must be lightweight, reproducible, and executable on standard enterprise workstations without requiring dedicated cloud cluster billing.
- All calculations must reconcile perfectly across SQL, Python, Excel, and Power BI.

### Dependencies:
- Extraction of raw transaction logs from legacy retail systems.
- Stakeholder availability for requirements validation and User Acceptance Testing (UAT).

---

## 8. Success Criteria & Expected Deliverables
1. **Data Accuracy**: 100% reconciliation of net revenue, gross profit, and order volumes across SQL, Python, Excel, and Power BI.
2. **User Adoption**: Business stakeholders sign off on 100% of defined UAT test cases.
3. **Evidence-Based Insights**: Identification of concrete, quantified margin improvements and root cause operational remedies.
4. **Handover Deliverables**: Complete documentation repository, clean processed data, SQL query suite, interactive notebooks, Excel workbook, and dashboard specifications.
