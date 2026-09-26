# ShopSphere Enterprise DAX Measures Library

This repository contains the complete library of production-grade DAX measures implemented in the ShopSphere Power BI analytical model. All measures are grouped into logical business display folders for maintainability and self-service governance.

---

## 1. Folder: `01_Core_Financials`

### 1.1 `[Total Gross Revenue]`
- **DAX Formula**:
  ```dax
  Total Gross Revenue = 
  SUMX(FactOrders, FactOrders[quantity] * FactOrders[unit_price])
  ```
- **What it calculates**: Aggregate dollar value of all ordered goods prior to deducting promotional discounts.
- **Why it matters**: Establishes top-line demand baseline before evaluating commercial discounting depth.
- **Where it is used**: Executive Overview, Sales & Product Analysis, KPI Cards.

---

### 1.2 `[Total Net Revenue]`
- **DAX Formula**:
  ```dax
  Total Net Revenue = 
  SUMX(FactOrders, FactOrders[quantity] * FactOrders[unit_price] * (1 - FactOrders[discount]))
  ```
- **What it calculates**: Realized top-line commercial turnover after applying customer discounts.
- **Why it matters**: True financial top-line benchmark for financial planning, revenue growth, and AOV calculations.
- **Where it is used**: Primary financial metric across all 5 report pages and KPI cards.

---

### 1.3 `[Total Cost]`
- **DAX Formula**:
  ```dax
  Total Cost = 
  SUMX(FactOrders, FactOrders[quantity] * RELATED(DimProduct[unit_cost]))
  ```
- **What it calculates**: Total Cost of Goods Sold (COGS) across all ordered products based on baseline acquisition unit cost.
- **Why it matters**: Essential for computing true gross margin and identifying loss-leader SKUs.
- **Where it is used**: Product Profitability matrix, Financial waterfalls, Margin monitoring.

---

### 1.4 `[Gross Profit]`
- **DAX Formula**:
  ```dax
  Gross Profit = 
  [Total Net Revenue] - [Total Cost]
  ```
- **What it calculates**: Retained earnings generated from commercial merchandise sales.
- **Why it matters**: Primary profitability health metric; ensures revenue growth generates actual enterprise value.
- **Where it is used**: Executive Overview, Product Profitability Analysis, Regional Scorecards.

---

### 1.5 `[Profit Margin %]`
- **DAX Formula**:
  ```dax
  Profit Margin % = 
  DIVIDE([Gross Profit], [Total Net Revenue], 0)
  ```
- **What it calculates**: Percentage of net revenue retained as gross profit after accounting for product costs.
- **Why it matters**: Reveals margin compression caused by excessive discounts or low-margin product mix.
- **Where it is used**: Header KPI Card, Product Performance tables, Category Margin charts.

---

## 2. Folder: `02_Volume_and_Basket`

### 2.1 `[Total Orders]`
- **DAX Formula**:
  ```dax
  Total Orders = 
  DISTINCTCOUNT(FactOrders[order_id])
  ```
- **What it calculates**: Total count of unique completed commercial orders.
- **Why it matters**: Primary operational throughput indicator.
- **Where it is used**: Executive Cards, Monthly Volume trends, Regional distribution.

---

### 2.2 `[Total Customers]`
- **DAX Formula**:
  ```dax
  Total Customers = 
  DISTINCTCOUNT(FactOrders[customer_id])
  ```
- **What it calculates**: Count of unique registered customers who have placed at least one order in the selected context.
- **Why it matters**: Measures commercial reach and active purchasing customer penetration.
- **Where it is used**: Customer Analytics, Executive Scorecard, Regional penetration.

---

### 2.3 `[Average Order Value (AOV)]`
- **DAX Formula**:
  ```dax
  Average Order Value (AOV) = 
  DIVIDE([Total Net Revenue], [Total Orders], 0)
  ```
- **What it calculates**: Mean dollar spend realized per order transaction.
- **Why it matters**: Direct lever for revenue expansion without requiring higher customer acquisition spend.
- **Where it is used**: Customer Segment analysis, Checkout Channel evaluation, Executive Cards.

---

## 3. Folder: `03_Time_Intelligence_and_Growth`

### 3.1 `[Previous Month Revenue]`
- **DAX Formula**:
  ```dax
  Previous Month Revenue = 
  CALCULATE(
      [Total Net Revenue],
      PREVIOUSMONTH(DimDate[Date])
  )
  ```
- **What it calculates**: Total net revenue generated in the immediate preceding calendar month.
- **Why it matters**: Baseline required for Month-over-Month (MoM) growth variance tracking.
- **Where it is used**: Monthly Sales trend visual, Executive variance tables.

---

### 3.2 `[Revenue Growth % (MoM)]`
- **DAX Formula**:
  ```dax
  Revenue Growth % (MoM) = 
  VAR CurrentMonthRev = [Total Net Revenue]
  VAR PriorMonthRev = [Previous Month Revenue]
  RETURN
      DIVIDE(CurrentMonthRev - PriorMonthRev, PriorMonthRev, 0)
  ```
- **What it calculates**: Percentage acceleration or contraction in net sales compared to prior month.
- **Why it matters**: Real-time momentum indicator for business leaders.
- **Where it is used**: Executive Overview trend tooltips, Monthly growth KPI callouts.

---

### 3.3 `[Previous Year Revenue]`
- **DAX Formula**:
  ```dax
  Previous Year Revenue = 
  CALCULATE(
      [Total Net Revenue],
      SAMEPERIODLASTYEAR(DimDate[Date])
  )
  ```
- **What it calculates**: Total net sales generated during the exact matching dates in the previous calendar year.
- **Why it matters**: Eliminates seasonal distortion (e.g. comparing Q4 Holiday 2024 to Q4 Holiday 2023).
- **Where it is used**: Executive YoY scorecards, Annual board reporting.

---

### 3.4 `[Profit Growth % (YoY)]`
- **DAX Formula**:
  ```dax
  Profit Growth % (YoY) = 
  VAR CurrentProfit = [Gross Profit]
  VAR PriorYearProfit = CALCULATE([Gross Profit], SAMEPERIODLASTYEAR(DimDate[Date]))
  RETURN
      DIVIDE(CurrentProfit - PriorYearProfit, PriorYearProfit, 0)
  ```
- **What it calculates**: Year-over-year percentage expansion in gross dollar profit.
- **Why it matters**: Confirms whether bottom-line earnings are scaling alongside top-line revenue.
- **Where it is used**: Executive Financial Summary, Board Review deck.

---

## 4. Folder: `04_Customer_Intelligence`

### 4.1 `[Repeat Customer Rate %]`
- **DAX Formula**:
  ```dax
  Repeat Customer Rate % = 
  VAR CustomerOrderCounts = 
      ADDCOLUMNS(
          VALUES(FactOrders[customer_id]),
          "@OrderCount", CALCULATE(DISTINCTCOUNT(FactOrders[order_id]))
      )
  VAR TotalActiveCustomers = COUNTROWS(CustomerOrderCounts)
  VAR RepeatCustomerCount = COUNTROWS(FILTER(CustomerOrderCounts, [@OrderCount] > 1))
  RETURN
      DIVIDE(RepeatCustomerCount, TotalActiveCustomers, 0)
  ```
- **What it calculates**: Proportion of purchasing shoppers who placed 2 or more orders across their lifecycle.
- **Why it matters**: Definitive indicator of product-market fit, brand loyalty, and customer retention.
- **Where it is used**: Customer Analytics page, Retention trend charts.

---

### 4.2 `[Customer Lifetime Value (LTV)]`
- **DAX Formula**:
  ```dax
  Customer Lifetime Value (LTV) = 
  DIVIDE([Total Net Revenue], [Total Customers], 0)
  ```
- **What it calculates**: Average cumulative dollar expenditure per registered active customer.
- **Why it matters**: Guides allowable Customer Acquisition Cost (CAC) thresholds for performance marketing.
- **Where it is used**: Customer Segment economics, Marketing channel evaluation.

---

## 5. Folder: `05_Logistics_and_Returns`

### 5.1 `[Return Rate %]`
- **DAX Formula**:
  ```dax
  Return Rate % = 
  VAR TotalOrdersCount = [Total Orders]
  VAR ReturnedOrdersCount = 
      CALCULATE(
          DISTINCTCOUNT(FactOrders[order_id]),
          FactOrders[order_status] = "Returned"
      )
  RETURN
      DIVIDE(ReturnedOrdersCount, TotalOrdersCount, 0)
  ```
- **What it calculates**: Percentage of placed orders returned by customers for refund or replacement.
- **Why it matters**: Identifies reverse logistics friction, merchandise quality issues, and fulfillment failures.
- **Where it is used**: Header KPI Card, Product Category return tables, Regional operations view.

---

### 5.2 `[Cancellation Rate %]`
- **DAX Formula**:
  ```dax
  Cancellation Rate % = 
  VAR TotalOrdersCount = [Total Orders]
  VAR CancelledOrdersCount = 
      CALCULATE(
          DISTINCTCOUNT(FactOrders[order_id]),
          FactOrders[order_status] = "Cancelled"
      )
  RETURN
      DIVIDE(CancelledOrdersCount, TotalOrdersCount, 0)
  ```
- **What it calculates**: Percentage of customer orders aborted prior to delivery fulfillment.
- **Why it matters**: Highlights checkout abandonment, fulfillment bottlenecks, or out-of-stock friction.
- **Where it is used**: Operations & Logistics scorecard, Regional analysis.

---

### 5.3 `[Average Delivery Delay]`
- **DAX Formula**:
  ```dax
  Average Delivery Delay = 
  CALCULATE(
      AVERAGE(FactDelivery[delay_days]),
      FactDelivery[delivery_status] = "Delivered Late"
  )
  ```
- **What it calculates**: Mean number of days delayed past the promised SLA deadline for late shipments.
- **Why it matters**: Directly correlates with customer dissatisfaction and return spikes.
- **Where it is used**: Regional Operations Dashboard, Carrier SLA Performance Card.
