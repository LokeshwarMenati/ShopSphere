# ShopSphere Enterprise Data Dictionary

## 1. Overview
The ShopSphere Enterprise Data Warehouse schema models end-to-end e-commerce operations spanning retail ordering, multi-regional fulfillment, inventory logistics, and returns processing. It serves as the single source of truth (SSOT) across Business Intelligence, Financial Planning & Analysis (FP&A), and Operational Analytics.

---

## 2. Entity Relationship Summary
The logical relational model contains 5 core operational tables:
- **`customers`**: Customer demographic profiles, segmentation, and geographic attribution.
- **`products`**: Product catalog hierarchy, manufacturer branding, baseline wholesale cost (COGS), and list prices.
- **`orders`**: Transaction line items capturing quantity, sales prices, discount allowances, payment channels, and order lifecycle states.
- **`returns`**: Reverse logistics records detailing return merchandise authorization (RMA), return reasons, and quantities.
- **`delivery`**: Logistics fulfillment tracking capturing promised customer SLAs, carrier completion timestamps, and milestone performance.

---

## 3. Table Specifications

### 3.1 `customers`
*Grain: One record per registered customer.*

| Column | Data Type | Nullable | Key | Business Meaning & Description | Validation Rules & Allowed Values |
|---|---|---|---|---|---|
| `customer_id` | `VARCHAR(20)` | No | PK | Unique surrogate key identifying each customer account. | Pattern: `CUST-#####` (5 digits) |
| `customer_name` | `VARCHAR(100)` | No | - | Customer full legal name. | Non-empty, Title Case |
| `gender` | `VARCHAR(10)` | Yes | - | Self-reported customer demographic gender. | `Male`, `Female`, `Other` |
| `age` | `INTEGER` | No | - | Age of customer in years at account creation. | Valid range: 18 to 95 |
| `city` | `VARCHAR(50)` | Yes | - | Primary residential city of customer. | Valid US municipality |
| `state` | `VARCHAR(50)` | No | - | Primary US state of residence. | Valid US state name |
| `region` | `VARCHAR(20)` | No | - | Macro sales territory classification. | `West`, `East`, `Central`, `South`, `North` |
| `signup_date` | `DATE` | No | - | Date on which the customer profile was created. | `YYYY-MM-DD`, must be <= order date |
| `customer_segment` | `VARCHAR(30)` | No | - | Strategic business segmentation tier. | `Consumer`, `Corporate`, `Small Business` |

---

### 3.2 `products`
*Grain: One record per unique Stock Keeping Unit (SKU) in catalog.*

| Column | Data Type | Nullable | Key | Business Meaning & Description | Validation Rules & Allowed Values |
|---|---|---|---|---|---|
| `product_id` | `VARCHAR(20)` | No | PK | Unique identifier for product SKU. | Pattern: `PROD-####` (4 digits) |
| `product_name` | `VARCHAR(150)` | No | - | Full commercial descriptive name of product. | Non-empty string |
| `category` | `VARCHAR(50)` | No | - | High-level merchandising department. | `Electronics`, `Apparel & Fashion`, `Home & Kitchen`, `Beauty & Personal Care`, `Sports & Fitness` |
| `subcategory` | `VARCHAR(50)` | Yes | - | Granular product taxonomy grouping. | Specific to category (e.g. `Smartphones`, `Laptops`, `Footwear`) |
| `brand` | `VARCHAR(50)` | Yes | - | Trademarked brand or supplier name. | Verified vendor brands |
| `unit_cost` | `DECIMAL(10,2)` | No | - | Direct Cost of Goods Sold (COGS) per unit. | `unit_cost > 0.00` |
| `selling_price` | `DECIMAL(10,2)` | No | - | Manufacturer's baseline list price (MSRP). | `selling_price > 0.00` |

---

### 3.3 `orders`
*Grain: One record per order transaction line item.*

| Column | Data Type | Nullable | Key | Business Meaning & Description | Validation Rules & Allowed Values |
|---|---|---|---|---|---|
| `order_id` | `VARCHAR(20)` | No | PK | Unique commercial sales order identifier. | Pattern: `ORD-######` (6 digits) |
| `customer_id` | `VARCHAR(20)` | No | FK | Reference to purchasing customer in `customers`. | Must exist in `customers.customer_id` |
| `order_date` | `DATE` | No | - | Date transaction was finalized and logged. | `YYYY-MM-DD`, between 2023-01-01 and 2025-12-31 |
| `product_id` | `VARCHAR(20)` | No | FK | Reference to SKU purchased in `products`. | Must exist in `products.product_id` |
| `quantity` | `INTEGER` | No | - | Count of units purchased for this order. | Integer between 1 and 20 |
| `unit_price` | `DECIMAL(10,2)` | No | - | Base price charged per unit at transaction time. | `unit_price > 0.00` |
| `discount` | `DECIMAL(4,2)` | No | - | Percentage promotional rebate applied. | Range: `0.00` to `0.30` |
| `payment_method` | `VARCHAR(30)` | No | - | Payment instrument used during checkout. | `Credit Card`, `Debit Card`, `PayPal`, `UPI / Net Banking`, `Cash on Delivery (COD)` |
| `order_status` | `VARCHAR(20)` | No | - | Current state in the order fulfillment cycle. | `Delivered`, `Shipped`, `Cancelled`, `Returned` |
| `shipping_type` | `VARCHAR(20)` | No | - | Service level selected for order transit. | `Standard`, `Express`, `Economy`, `Same Day` |

---

### 3.4 `returns`
*Grain: One record per return merchandise authorization (RMA).*

| Column | Data Type | Nullable | Key | Business Meaning & Description | Validation Rules & Allowed Values |
|---|---|---|---|---|---|
| `return_id` | `VARCHAR(20)` | No | PK | Unique identifier for the return event. | Pattern: `RET-######` (6 digits) |
| `order_id` | `VARCHAR(20)` | No | FK | Reference to original purchase order. | Must exist in `orders.order_id` |
| `return_date` | `DATE` | No | - | Date return item was received and inspected. | `return_date >= order_date` |
| `return_reason` | `VARCHAR(100)` | Yes | - | Customer stated root cause for returning item. | `Defective / Damaged`, `Late Delivery`, `Size / Fit Issue`, `Changed Mind`, `Not as Described`, `Wrong Item Delivered`, `Found Better Price`, `Missing Parts / Accessories` |
| `return_quantity` | `INTEGER` | No | - | Quantity of units accepted for return credit. | `1 <= return_quantity <= order.quantity` |

---

### 3.5 `delivery`
*Grain: One record per fulfillment tracking record (1-to-1 relationship with `orders`).*

| Column | Data Type | Nullable | Key | Business Meaning & Description | Validation Rules & Allowed Values |
|---|---|---|---|---|---|
| `order_id` | `VARCHAR(20)` | No | PK, FK | Reference to matching transaction order. | Must exist in `orders.order_id` |
| `order_date` | `DATE` | No | - | Date order was placed and handed to depot. | Matches `orders.order_date` |
| `promised_delivery_date`| `DATE` | No | - | SLA promised date presented at checkout. | `promised_delivery_date >= order_date` |
| `actual_delivery_date` | `DATE` | Yes | - | Carrier recorded doorstep delivery date. | Nullable for Cancelled or In Transit orders |
| `delivery_status` | `VARCHAR(30)` | Yes | - | Operational SLA milestone classification. | `Delivered On-Time`, `Delivered Late`, `Cancelled`, `In Transit`, `Failed Delivery` |

---

## 4. Calculated Financial & Operational Metrics
1. **Gross Revenue**: `quantity * unit_price`
2. **Net Revenue**: `quantity * unit_price * (1 - discount)`
3. **Total Product Cost (COGS)**: `quantity * unit_cost`
4. **Gross Profit**: `Net Revenue - Total Product Cost`
5. **Gross Profit Margin %**: `(Gross Profit / Net Revenue) * 100`
6. **Delivery Delay (Days)**: `MAX(0, actual_delivery_date - promised_delivery_date)`
