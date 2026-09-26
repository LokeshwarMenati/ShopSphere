# ShopSphere Analytics & Business Analysis Methodology

## 1. End-to-End Delivery Framework
The ShopSphere Analytics initiative follows a rigorous, multi-stage delivery framework that bridges technical data engineering, statistical analysis, and consultative business analysis:

```
[Business Problem Elicitation]
             │
             ▼
[Stakeholder & Requirements Discovery (BRD / FRD / User Stories)]
             │
             ▼
[Data Discovery & Quality Profiling (Raw Feeds Assessment)]
             │
             ▼
[Data Engineering, Cleansing & Integrity Testing (Python / SQL)]
             │
             ▼
[Dimensional Modeling (Kimball Star Schema in Power BI / VertiPaq)]
             │
             ▼
[Exploratory Data Analysis (EDA) & Formal Hypothesis Testing (SciPy)]
             │
             ▼
[BI Dashboard Development & DAX Measure Engineering]
             │
             ▼
[User Acceptance Testing (UAT) & Requirements Verification]
             │
             ▼
[Root Cause Analysis (5-Whys, Pareto) & Executive Recommendations]
```

---

## 2. Phase-by-Phase Methodological Execution

### Phase 1: Business Requirements & Process Mapping
- **Elicitation**: Conducted structured stakeholder interviews across Executive, Sales, Finance, Supply Chain, and Customer Support leadership.
- **Artifacts Created**: Project Charter, Stakeholder Power/Interest Matrix, Business Requirements Document (16 requirements), Functional Requirements Document (16 functional specifications), and 12 Agile User Stories with Given/When/Then Acceptance Criteria.
- **Process Analysis**: Mapped As-Is manual spreadsheet reporting versus To-Be automated data architecture; quantified gaps across Process, Data, Technology, Reporting, and Decision-Making.

### Phase 2: Data Engineering & Quality Hygiene
- **Raw Data Ingestion**: Audited 5 raw transactional feeds (`customers`, `products`, `orders`, `delivery`, `returns`).
- **Hygiene & Remediation**: Built automated profiling scripts to detect duplicate primary keys, inconsistent text casing, date formatting anomalies, demographic age outliers, and missing carrier delivery statuses.
- **Automated Validation**: Deployed 13 programmatic integrity unit tests (`tests/data_validation.py`) enforcing referential integrity, positive price constraints, valid discount bounds, and temporal order-to-delivery sequencing.

### Phase 3: Relational Architecture & Dimensional Modeling
- **Relational Schema**: Implemented normalized, indexed relational database tables in SQLite (`database/shopsphere.db`) and ANSI-compliant SQL scripts (`schema.sql`, `seed_data.sql`).
- **Star Schema Design**: Designed a Kimball star schema in Power BI separating transactional facts (`FactOrders`, `FactDelivery`, `FactReturns`) from conformed descriptive dimensions (`DimCustomer`, `DimProduct`, `DimDate`).

### Phase 4: Exploratory Data Analysis & Statistical Rigor
- **Exploratory Profiling**: Analyzed 36-month revenue trajectories, Q4 seasonality, category margin efficiency, and regional geographic density.
- **Hypothesis Testing**:
  - Pearson correlation and linear regression evaluating promotional discount depth vs. gross margin squeeze ($p < 0.001$).
  - Pearson Chi-Square ($\chi^2$) test of independence demonstrating that delivery delays significantly increase return propensity ($p < 0.001$).
  - One-Way ANOVA confirming statistically significant variance in Average Order Value (AOV) across customer segments ($p < 0.001$).
- **Methodological Rule**: Correlation was rigorously separated from causation; statistical findings were triangulated with qualitative customer return reasons.

### Phase 5: Business Intelligence & Decision Support
- **DAX Engineering**: Developed 16 certified DAX measures organized into functional display folders.
- **Dashboard Construction**: Designed a 5-page interactive dashboard suite adhering to corporate UI design tokens, responsive slicers, and executive decision cards.
- **Production Excel Model**: Built an 8-sheet enterprise workbook utilizing `SUMIFS`, `XLOOKUP`, `IFERROR`, dynamic pivot tables, and conditional formatting.

### Phase 6: Root Cause Analysis & Governance Handover
- **Root Cause Analysis (RCA)**: Deployed 5-Whys methodology and Pareto analysis to isolate underlying causes for delivery delay spillovers, loss-leader margins, and apparel returns.
- **UAT & Sign-Off**: Executed 16 User Acceptance Testing scenarios with 100% pass rate, validated through a complete Requirements Traceability Matrix (RTM).
