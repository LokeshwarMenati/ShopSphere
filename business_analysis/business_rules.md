# ShopSphere Enterprise Business Rules Document

## 1. Conceptual Framework & Distinctions
In enterprise business analysis and systems engineering, it is critical to maintain clean conceptual boundaries between **Business Requirements**, **Business Rules**, and **Functional Requirements**:

```
+--------------------------------------------------------------------------------------------------+
| BUSINESS REQUIREMENT (What the business needs to achieve)                                        |
| Example: "Management must be able to monitor true product profitability to prevent loss leaders." |
+--------------------------------------------------------------------------------------------------+
                                                │ Enforces
                                                ▼
+--------------------------------------------------------------------------------------------------+
| BUSINESS RULE (The immutable policy, calculation, or domain constraint)                          |
| Example: "Gross Profit = Net Revenue - Total Product Cost (COGS). Loss leader if margin < 10%."   |
+--------------------------------------------------------------------------------------------------+
                                                │ Implemented by
                                                ▼
+--------------------------------------------------------------------------------------------------+
| FUNCTIONAL REQUIREMENT (The system behavior, UI action, or software capability)                  |
| Example: "The dashboard shall compute Gross Profit via DAX and highlight SKUs < 10% in coral."   |
+--------------------------------------------------------------------------------------------------+
```

---

## 2. Business Rules Register (BRULE-001 through BRULE-012)

### BRULE-001: Gross Revenue Calculation
- **Rule Definition**: Gross Revenue represents the pre-discount face value of merchandise ordered by a customer.
- **Formula / Logic**:  
  $$\text{Gross Revenue} = \text{Order Quantity} \times \text{Unit Selling Price}$$
- **Enforcement Level**: Mandatory system-wide calculation across all financial line items.

---

### BRULE-002: Net Commercial Revenue Calculation
- **Rule Definition**: Net Commercial Revenue represents realized top-line sales turnover after deducting contractually authorized promotional discounts.
- **Formula / Logic**:  
  $$\text{Net Revenue} = \text{Order Quantity} \times \text{Unit Selling Price} \times (1 - \text{Discount Rate})$$
- **Enforcement Level**: Primary top-line metric; discount rate is bounded within $[0.00, 0.30]$.

---

### BRULE-003: Cost of Goods Sold (COGS) / Product Cost
- **Rule Definition**: Total Product Cost is the direct wholesale inventory acquisition or manufacturing cost required to fulfill the physical units sold.
- **Formula / Logic**:  
  $$\text{Total Cost (COGS)} = \text{Order Quantity} \times \text{Unit Baseline Cost}$$
- **Enforcement Level**: Unit baseline cost must be strictly positive ($> \$0.00$) and mapped directly from the verified product catalog.

---

### BRULE-004: Gross Dollar Profit
- **Rule Definition**: Gross Dollar Profit represents retained earnings generated from commercial merchandise sales prior to operating overhead.
- **Formula / Logic**:  
  $$\text{Gross Profit} = \text{Net Revenue} - \text{Total Cost (COGS)}$$
- **Enforcement Level**: Evaluated at the transaction line-item level and summed additively across dimensional rollups.

---

### BRULE-005: Gross Profit Margin Percentage
- **Rule Definition**: Profit Margin % expresses gross dollar profit as an exact proportion of realized net revenue.
- **Formula / Logic**:  
  $$\text{Profit Margin \%} = \left( \frac{\text{Gross Profit}}{\text{Net Revenue}} \right) \times 100$$
- **Enforcement Level**: If $\text{Net Revenue} \le 0$, margin % defaults gracefully to $0.00\%$ via `IFERROR` or `DIVIDE`.

---

### BRULE-006: Average Order Value (AOV)
- **Rule Definition**: AOV benchmarks mean customer expenditure per completed transaction.
- **Formula / Logic**:  
  $$\text{AOV} = \frac{\text{Total Net Revenue}}{\text{Count of Unique Completed Orders}}$$
- **Enforcement Level**: Denominator includes all finalized orders regardless of basket quantity.

---

### BRULE-007: Product Return Merchandise Rate %
- **Rule Definition**: The return rate benchmarks the proportion of placed orders that result in a customer return authorization (RMA).
- **Formula / Logic**:  
  $$\text{Return Rate \%} = \left( \frac{\text{Count of Orders with Status = 'Returned'}}{\text{Total Orders Placed}} \right) \times 100$$
- **Enforcement Level**: Measured at the order level; partial unit returns count toward returned order volume.

---

### BRULE-008: Pre-Fulfillment Order Cancellation Rate %
- **Rule Definition**: Cancellation rate measures customer- or system-aborted orders prior to carrier delivery completion.
- **Formula / Logic**:  
  $$\text{Cancellation Rate \%} = \left( \frac{\text{Count of Orders with Status = 'Cancelled'}}{\text{Total Orders Placed}} \right) \times 100$$
- **Enforcement Level**: Cancelled orders have zero realized net revenue and are excluded from gross margin summaries.

---

### BRULE-009: Delivery Delay & Milestone SLA Classification
- **Rule Definition**: A shipment is classified as "Delivered Late" if the carrier's recorded doorstep delivery date occurs after the promised SLA deadline agreed upon at checkout.
- **Formula / Logic**:  
  $$\text{Delay Days} = \max(0, \text{Actual Delivery Date} - \text{Promised Delivery Date})$$
  $$\text{Status} = \begin{cases} \text{'Delivered On-Time'}, & \text{Actual Date} \le \text{Promised Date} \\ \text{'Delivered Late'}, & \text{Actual Date} > \text{Promised Date} \\ \text{'In Transit'}, & \text{Actual Date is NULL} \end{cases}$$
- **Enforcement Level**: Enforced across all fulfillment tracking records.

---

### BRULE-010: Repeat Customer Qualification
- **Rule Definition**: A customer profile is classified as a "Repeat Customer" if and only if they have placed two (2) or more distinct orders across their historical lifecycle.
- **Formula / Logic**:  
  $$\text{Customer Type} = \begin{cases} \text{'Repeat Customer'}, & \text{Order Count} \ge 2 \\ \text{'One-Time Customer'}, & \text{Order Count} = 1 \end{cases}$$
- **Enforcement Level**: Bounded to active purchasing accounts; non-purchasing accounts excluded.

---

### BRULE-011: Loss-Leader SKU Classification
- **Rule Definition**: An active catalog SKU is classified as a "Loss Leader" if it commands substantial commercial sales volume ($> \$30,000$ net revenue) but yields a gross profit margin below $10.0\%$.
- **Formula / Logic**:  
  $$\text{Loss Leader Flag} = \text{IF}(\text{Net Revenue} > 30000 \text{ AND } \text{Margin \%} < 10.0\%, \text{TRUE}, \text{FALSE})$$
- **Enforcement Level**: Triggers automated auditing in merchandising and pricing reviews.

---

### BRULE-012: Return Quantity Validation Boundary
- **Rule Definition**: The physical quantity of items authorized for return on any given RMA record cannot exceed the original quantity ordered on that line item.
- **Formula / Logic**:  
  $$1 \le \text{Return Quantity} \le \text{Order Quantity}$$
- **Enforcement Level**: Strict data validation check (`TC-VAL-12`). Violations rejected during ETL.
