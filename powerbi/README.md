# ShopSphere Power BI Business Intelligence Solution

## 1. Solution Overview
The ShopSphere Power BI analytical suite provides an enterprise-grade reporting engine for C-suite executives, merchandising category managers, regional sales heads, and supply chain operators. It transforms raw transactional and reverse-logistics data into strategic, actionable decision support.

---

## 2. Directory Structure & BI Deliverables
- [data_model.md](file:///e:/ShopSphere/powerbi/data_model.md): Detailed Star Schema architecture, fact/dimension table definitions, relationship cardinalities, filter propagation directions, and table grain.
- [dax_measures.md](file:///e:/ShopSphere/powerbi/dax_measures.md): Complete repository of production-grade DAX measures spanning core financial KPIs, time intelligence (MoM, YoY), customer retention, and logistics SLA monitoring.
- [dashboard_specification.md](file:///e:/ShopSphere/powerbi/dashboard_specification.md): Granular layout, visual configurations, color palettes, interactive filter behaviors, and wireframe layouts for the 5-page reporting suite.

---

## 3. Step-by-Step Instructions to Recreate the Power BI Report (.pbix)

### Step 1: Ingest Processed Data Sources
1. Open **Power BI Desktop**.
2. Click **Get Data** -> **Text/CSV**.
3. Sequentially import the 5 audited datasets located in `data/processed/`:
   - `customers.csv`
   - `products.csv`
   - `orders.csv`
   - `delivery.csv`
   - `returns.csv`
4. In Power Query Editor, verify data types:
   - Currency columns (`unit_price`, `unit_cost`, `gross_revenue`, `net_revenue`, `gross_profit`) set to `Fixed decimal number ($)`.
   - Date columns (`order_date`, `signup_date`, `promised_delivery_date`, `actual_delivery_date`, `return_date`) set to `Date`.
   - Integer counts (`quantity`, `return_quantity`, `age`, `delay_days`) set to `Whole Number`.

### Step 2: Generate the Dynamic Calendar Dimension (`DimDate`)
In Power BI Desktop, navigate to **Modeling** -> **New Table** and paste:
```dax
DimDate = 
VAR MinDate = DATE(2022, 1, 1)
VAR MaxDate = DATE(2025, 12, 31)
RETURN
    ADDCOLUMNS(
        CALENDAR(MinDate, MaxDate),
        "Year", YEAR([Date]),
        "Quarter", "Q" & FORMAT([Date], "Q"),
        "QuarterYear", "Q" & FORMAT([Date], "Q") & " " & YEAR([Date]),
        "MonthNumber", MONTH([Date]),
        "MonthName", FORMAT([Date], "MMMM"),
        "MonthYear", FORMAT([Date], "YYYY-MM"),
        "DayOfWeekNumber", WEEKDAY([Date], 2),
        "DayOfWeekName", FORMAT([Date], "dddd"),
        "IsWeekend", IF(WEEKDAY([Date], 2) >= 6, "Weekend", "Weekday")
    )
```
*Mark `DimDate` as a Date Table (Table Tools -> Mark as Date Table -> select `[Date]`).*

### Step 3: Establish Star Schema Relationships
Navigate to the **Model View** and create the active relationships detailed in [data_model.md](file:///e:/ShopSphere/powerbi/data_model.md):
- `customers[customer_id]` (1) to `orders[customer_id]` (*) (Single direction)
- `products[product_id]` (1) to `orders[product_id]` (*) (Single direction)
- `DimDate[Date]` (1) to `orders[order_date]` (*) (Single direction)
- `orders[order_id]` (1) to `delivery[order_id]` (1) (Both directions)
- `orders[order_id]` (1) to `returns[order_id]` (*) (Single direction)

### Step 4: Create Measure Organization Table
1. Click **Enter Data**, name the table `_DAX Measures`, and click **Load**.
2. Create the DAX measures detailed in [dax_measures.md](file:///e:/ShopSphere/powerbi/dax_measures.md).
3. Assign each measure to its respective display folder (`01_Core_Financials`, `02_Time_Intelligence`, `03_Customer_Metrics`, `04_Logistics_Returns`).

### Step 5: Construct the 5 Dashboard Pages
Follow the visual layouts, formatting coordinates, and chart configurations defined in [dashboard_specification.md](file:///e:/ShopSphere/powerbi/dashboard_specification.md).
