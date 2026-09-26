# ShopSphere Enterprise Power BI Data Model Specification

## 1. Architectural Pattern: Star Schema Design
The ShopSphere Power BI data model adheres strictly to dimensional modeling best practices formulated by Ralph Kimball. By segregating business processes into centralized numeric **Fact Tables** surrounded by descriptive **Dimension Tables**, the model ensures:
1. Optimal DAX performance and storage compression using the VertiPaq columnar engine.
2. Unambiguous filter propagation avoiding bi-directional circular ambiguity.
3. Clean user navigation for self-service reporting.

---

## 2. Model Architecture Diagram

```
                 +-------------------+
                 |    DimCustomer    |
                 +-------------------+
                 | PK  customer_id   |
                 |     customer_name |
                 |     gender        |
                 |     age           |
                 |     city          |
                 |     state         |
                 |     region        |
                 |     signup_date   |
                 |     customer_seg  |
                 +---------+---------+
                           | 1
                           | 
                           | *
+-------------------+      |      +-------------------+
|      DimDate      |      |      |    DimProduct     |
+-------------------+      |      +-------------------+
| PK  Date          |      |      | PK  product_id    |
|     Year          |      |      |     product_name  |
|     Quarter       |      |      |     category      |
|     MonthName     |      |      |     subcategory   |
|     MonthYear     |      |      |     brand         |
|     DayOfWeekName |      |      |     unit_cost     |
|     IsWeekend     |      |      |     selling_price |
+---------+---------+      |      +---------+---------+
          | 1              |                | 1
          |                |                |
          | *              |                | *
     +----+----------------+----------------+----+
     |                 FactOrders                |
     +-------------------------------------------+
     | PK  order_id                              |
     | FK  customer_id                           |
     | FK  product_id                            |
     | FK  order_date                            |
     |     quantity                              |
     |     unit_price                            |
     |     discount                              |
     |     payment_method                        |
     |     order_status                          |
     |     shipping_type                         |
     |     gross_revenue                         |
     |     net_revenue                           |
     |     total_cost                            |
     |     gross_profit                          |
     +-----------+-------------------+-----------+
                 | 1                 | 1
                 |                   | 
                 | 1                 | *
     +-----------+-------+   +-------+-----------+
     |   FactDelivery    |   |    FactReturns    |
     +-------------------+   +-------------------+
     | PK/FK order_id    |   | PK  return_id     |
     |     order_date    |   | FK  order_id      |
     |     promised_date |   |     return_date   |
     |     actual_date   |   |     return_reason |
     |     delivery_stat |   |     return_qty    |
     |     delay_days    |   +-------------------+
     +-------------------+
```

---

## 3. Entity Classification & Table Details

### 3.1 Dimension Tables (Conformed Dimensions)

#### 1. `DimCustomer` (Mapped from `customers.csv`)
- **Role**: Captures retail customer profile, demographics, and regional hierarchy.
- **Grain**: One record per unique customer account.
- **Primary Key**: `customer_id`
- **Key Attributes**: `customer_name`, `gender`, `age`, `city`, `state`, `region`, `signup_date`, `customer_segment`.

#### 2. `DimProduct` (Mapped from `products.csv`)
- **Role**: Categorizes commercial catalog hierarchy and baseline pricing.
- **Grain**: One record per Stock Keeping Unit (SKU).
- **Primary Key**: `product_id`
- **Key Attributes**: `product_name`, `category`, `subcategory`, `brand`, `unit_cost`, `selling_price`.

#### 3. `DimDate` (DAX Calculated Calendar Table)
- **Role**: Provides continuous temporal slicing and enables Power BI Time Intelligence functions (`TOTALYTD`, `SAMEPERIODLASTYEAR`, `DATEADD`).
- **Grain**: One record per calendar day (2022-01-01 to 2025-12-31).
- **Primary Key**: `Date`
- **Key Attributes**: `Year`, `Quarter`, `QuarterYear`, `MonthNumber`, `MonthName`, `MonthYear`, `DayOfWeekName`, `IsWeekend`.

---

### 3.2 Fact Tables

#### 1. `FactOrders` (Mapped from `orders.csv`)
- **Role**: Core accumulating transactional fact capturing commercial sales activity.
- **Grain**: One record per line-item order transaction.
- **Primary Key**: `order_id`
- **Foreign Keys**: `customer_id`, `product_id`, `order_date`
- **Measures / Additive Metrics**: `quantity`, `unit_price`, `discount`, `gross_revenue`, `net_revenue`, `total_cost`, `gross_profit`.

#### 2. `FactDelivery` (Mapped from `delivery.csv`)
- **Role**: Operational fulfillment tracking measuring carrier logistics performance and customer SLA compliance.
- **Grain**: One record per shipment (1-to-1 extension of `FactOrders`).
- **Primary Key / Foreign Key**: `order_id`
- **Attributes & Metrics**: `promised_delivery_date`, `actual_delivery_date`, `delivery_status`, `delay_days`.

#### 3. `FactReturns` (Mapped from `returns.csv`)
- **Role**: Reverse logistics fact logging customer merchandise return authorizations (RMA).
- **Grain**: One record per return event.
- **Primary Key**: `return_id`
- **Foreign Key**: `order_id`
- **Attributes & Metrics**: `return_date`, `return_reason`, `return_quantity`.

---

## 4. Relationship Matrix & Cardinality Rules

| From Table | From Column | To Table | To Column | Cardinality | Cross Filter Direction | Security / Enforcement |
|---|---|---|---|---|---|---|
| `DimCustomer` | `customer_id` | `FactOrders` | `customer_id` | 1-to-Many (`1:*`) | Single (`DimCustomer` filters `FactOrders`) | Active |
| `DimProduct` | `product_id` | `FactOrders` | `product_id` | 1-to-Many (`1:*`) | Single (`DimProduct` filters `FactOrders`) | Active |
| `DimDate` | `Date` | `FactOrders` | `order_date` | 1-to-Many (`1:*`) | Single (`DimDate` filters `FactOrders`) | Active |
| `FactOrders` | `order_id` | `FactDelivery` | `order_id` | 1-to-1 (`1:1`) | Both Directions | Active |
| `FactOrders` | `order_id` | `FactReturns` | `order_id` | 1-to-Many (`1:*`) | Single (`FactOrders` filters `FactReturns`) | Active |

---

## 5. Performance Optimization & Best Practices Enforced
1. **Integer & Date Keys**: Surrogate string keys (`CUST-00001`, `PROD-0001`) are hashed efficiently by VertiPaq; foreign keys use clean standardized formats.
2. **Hidden Foreign Keys**: All raw foreign key columns in `FactOrders` (`customer_id`, `product_id`, `order_date`) are marked as hidden in report view to force users to slice exclusively via dimension tables.
3. **No Bi-Directional Bloat**: Bi-directional filtering is restricted exclusively to the 1-to-1 `FactOrders` <-> `FactDelivery` relationship, eliminating ambiguous DAX filter paths.
4. **Column Encoding**: High-cardinality descriptive text is restricted to dimensions, while facts maintain numerical metrics optimized for dictionary encoding.
