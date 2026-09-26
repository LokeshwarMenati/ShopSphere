# ShopSphere Comprehensive Data Quality & Hygiene Assessment Report

## 1. Executive Quality Summary
Prior to deploying analytical models, database schemas, and Business Intelligence dashboards, an exhaustive Data Quality Assessment (DQA) was conducted on all raw operational ingestion feeds (`customers`, `products`, `orders`, `delivery`, `returns`). 

Data anomalies, schema drift, referential violations, and demographic outliers were cataloged using automated profiling scripts, systematically remediated, and stored in the audited staging layer (`data/processed/`).

### Summary Metrics of Raw vs. Clean Datasets
| Entity / Table | Raw Ingestion Records | Clean Processed Records | Variance / Discarded | Primary Remediation Strategy |
|---|---|---|---|---|
| **`customers`** | 50,680 | 50,500 | -180 | Deduplicated surrogate keys, standardized dates & segment casing, imputed age outliers |
| **`products`** | 533 | 525 | -8 | Deduplicated SKU IDs, normalized category casing, imputed missing vendor brands |
| **`orders`** | 102,720 | 102,420 | -300 | Removed duplicate orders, pruned unlinked foreign keys, capped extreme quantity anomalies |
| **`delivery`** | 102,710 | 102,420 | -290 | Deduplicated tracking rows, aligned to valid orders, dynamically imputed missing milestone status |
| **`returns`** | 10,650 | 10,594 | -56 | Deduplicated RMA records, imputed missing return reasons, standardized reason taxonomy |

---

## 2. Detailed Data Quality Issues Log

| Table | Identified Quality Defect | Records Impacted | Detection Methodology | Applied Treatment & Remediation | Business & Analytical Rationale |
|---|---|---|---|---|---|
| `products` | **Duplicate Product IDs** | 8 | `df.duplicated(subset=['product_id'])` | Dropped duplicate rows keeping first occurrence | Product ID is the primary key and must be unique. |
| `products` | **Inconsistent Category Casing** | 8 | `Membership check against canonical category list` | Standardized to Title Case using canonical dictionary mapping | Ensure uniform grouping in SQL and BI reporting. |
| `products` | **Missing Brand Values** | 6 | `df['brand'].isna().sum()` | Imputed missing brand as 'Generic / Store Brand' | Maintain data completeness without dropping valid SKUs. |
| `customers` | **Duplicate Customer Records** | 180 | `df.duplicated(subset=['customer_id'])` | Deduplicated keeping the earliest registered profile | Customer ID must be a unique entity identifier for RFM and cohort analysis. |
| `customers` | **Non-Standard Date Formats (DD/MM/YYYY)** | 150 | `Regex string pattern search for '/'` | Parsed into standard ISO-8601 'YYYY-MM-DD' format | ISO-8601 formatting required for relational database ingest and date dimension modeling. |
| `customers` | **Invalid / Outlier Customer Ages (<=0 or >100)** | 25 | `Range validation check (age <= 0 OR age > 100)` | Imputed with median customer age (36 years) | Preserve customer profile while eliminating biologically impossible values. |
| `customers` | **Missing Demographic Gender** | 60 | `df['gender'].isna().sum()` | Imputed as 'Unspecified' | Customer opted out of gender disclosure; maintain demographic category. |
| `customers` | **Missing Customer City** | 60 | `df['city'].isna().sum()` | Imputed as 'Metro Area Unknown' | Allows regional rollups via state and region while flagging missing city nodes. |
| `customers` | **Inconsistent Segment Casing** | 180 | `Membership check against canonical segment list` | Normalized string casing to Title Case ('Consumer', 'Corporate', 'Small Business') | Avoid bifurcated customer segmentation in downstream reporting. |
| `orders` | **Duplicate Order IDs** | 220 | `df.duplicated(subset=['order_id'])` | Removed duplicate transaction rows keeping first occurrence | Prevent gross revenue overstatement and distorted sales aggregates. |
| `orders` | **Orphaned Transactions (Missing customer_id or product_id)** | 80 | `df[['customer_id', 'product_id']].isna().sum()` | Filtered out unlinked order records from analytical dataset | Referential integrity requires valid customer and SKU links for accurate attribution. |
| `orders` | **Invalid / Extreme Order Quantities (<=0 or >50)** | 20 | `Validation rule (quantity <= 0 OR quantity > 50)` | Replaced negative quantities with absolute values; capped extreme outliers to 5 units | Repair erroneous entry signs and truncate testing/system anomalies. |
| `orders` | **Inconsistent Payment Method Casing** | 179 | `Membership check against canonical payment methods` | Standardized to canonical title case and acronyms | Maintain accurate payment gateway reconciliation and BI slicing. |
| `delivery` | **Duplicate Delivery Tracking Records** | 210 | `df.duplicated(subset=['order_id'])` | Deduplicated keeping earliest tracking record | Fulfillment requires a 1-to-1 relationship with valid sales orders. |
| `delivery` | **Missing Delivery Status Values** | 40 | `df['delivery_status'].isna().sum()` | Inferred status dynamically based on actual vs promised dates | Maintain complete logistics visibility for operational SLA monitoring. |
| `returns` | **Duplicate Return Authorization IDs** | 50 | `df.duplicated(subset=['return_id'])` | Removed duplicate return rows keeping first record | Prevent double-counting return credits and distorted reverse logistics KPIs. |
| `returns` | **Missing Return Reason Codes** | 60 | `df['return_reason'].isna().sum()` | Imputed as 'Reason Not Specified' | Maintain log completeness while identifying gaps in return intake workflow. |

---

## 3. Data Integrity & Validation Rules Enforced
1. **Uniqueness**: Surrogate primary keys (`customer_id`, `product_id`, `order_id`, `return_id`) have 100% uniqueness with zero duplicate occurrences.
2. **Referential Integrity**: 100% of foreign keys in `orders` resolve cleanly to parent dimension tables (`customers` and `products`). 100% of `delivery` and `returns` records bind to verified `orders`.
3. **Temporal Validity**: 
   - `order_date >= customer.signup_date` for all orders.
   - `promised_delivery_date >= order_date`.
   - `actual_delivery_date >= order_date` (where delivered).
   - `return_date >= order_date` for all returns.
4. **Domain Boundaries**:
   - `age`: Constrained between 18 and 85 years (median imputation applied to out-of-bounds records).
   - `discount`: Constrained between 0.00 and 0.30.
   - `quantity`: Positive integer, capped at realistic consumer/business order thresholds.
   - `unit_price` & `unit_cost`: Strictly positive decimals (`> $0.00`).

---

## 4. Analytical Readiness Sign-Off
- **Raw Data Integrity**: Preserved immutably in `data/raw/` for auditing and lineage tracking.
- **Processed Staging Layer**: Production-ready data persisted in `data/processed/`.
- **Database Load Status**: Schema constraints and index structures verified for relational ingestion.
