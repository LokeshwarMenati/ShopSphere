-- ============================================================================
-- File: 06_advanced_analysis.sql
-- Project: ShopSphere E-commerce Sales & Business Performance Analytics
-- Description: Advanced CTEs, window functions, Pareto concentration, rolling averages, and executive scorecard.
-- Database Compatibility: SQLite 3.25+, PostgreSQL 12+, MySQL 8.0+
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Query 29: Customer Cohort Cumulative Lifetime Value (LTV Progression)
-- Business Purpose: Measure cumulative dollar generation across quarters by customer acquisition cohorts.
-- ----------------------------------------------------------------------------
WITH customer_first_order AS (
    SELECT 
        customer_id,
        MIN(order_date) AS first_order_date,
        SUBSTR(MIN(order_date), 1, 7) AS cohort_month
    FROM orders
    GROUP BY customer_id
),
cohort_order_revenue AS (
    SELECT 
        f.cohort_month,
        CAST((JULIANDAY(o.order_date) - JULIANDAY(f.first_order_date)) / 30 AS INTEGER) AS tenure_month_index,
        COUNT(DISTINCT o.customer_id) AS active_cohort_members,
        SUM(o.quantity * o.unit_price * (1 - o.discount)) AS net_spend
    FROM orders o
    JOIN customer_first_order f ON o.customer_id = f.customer_id
    GROUP BY f.cohort_month, tenure_month_index
)
SELECT 
    cohort_month,
    tenure_month_index,
    active_cohort_members,
    ROUND(net_spend, 2) AS period_net_spend_usd,
    ROUND(SUM(net_spend) OVER (
        PARTITION BY cohort_month 
        ORDER BY tenure_month_index 
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ), 2) AS cumulative_cohort_ltv_usd
FROM cohort_order_revenue
WHERE cohort_month IN ('2023-01', '2023-06', '2024-01', '2024-06') AND tenure_month_index <= 12
ORDER BY cohort_month, tenure_month_index ASC;


-- ----------------------------------------------------------------------------
-- Query 30: Pareto 80/20 Customer Concentration Analysis
-- Business Purpose: Validate whether ~20% of top customer accounts generate ~80% of net company revenue.
-- ----------------------------------------------------------------------------
WITH customer_spends AS (
    SELECT 
        c.customer_id,
        ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)), 2) AS total_customer_spend
    FROM customers c
    JOIN orders o ON c.customer_id = o.customer_id
    GROUP BY c.customer_id
),
ranked_customers AS (
    SELECT 
        customer_id,
        total_customer_spend,
        ROW_NUMBER() OVER (ORDER BY total_customer_spend DESC) AS customer_rank,
        COUNT(*) OVER () AS total_active_customers,
        SUM(total_customer_spend) OVER (ORDER BY total_customer_spend DESC ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS cumulative_revenue,
        SUM(total_customer_spend) OVER () AS total_enterprise_revenue
    FROM customer_spends
)
SELECT 
    customer_rank,
    ROUND((customer_rank * 100.0) / total_active_customers, 2) AS pct_of_customer_base,
    total_customer_spend,
    ROUND(cumulative_revenue, 2) AS cumulative_revenue_usd,
    ROUND((cumulative_revenue * 100.0) / total_enterprise_revenue, 2) AS cumulative_revenue_share_pct
FROM ranked_customers
WHERE customer_rank IN (
    CAST(total_active_customers * 0.05 AS INTEGER),
    CAST(total_active_customers * 0.10 AS INTEGER),
    CAST(total_active_customers * 0.20 AS INTEGER),
    CAST(total_active_customers * 0.50 AS INTEGER),
    CAST(total_active_customers * 0.80 AS INTEGER),
    total_active_customers
)
ORDER BY customer_rank ASC;


-- ----------------------------------------------------------------------------
-- Query 31: 3-Month Rolling Average Revenue & Volatility Window
-- Business Purpose: Smooth out seasonal spikes to reveal underlying commercial trajectory.
-- ----------------------------------------------------------------------------
WITH monthly_base AS (
    SELECT 
        SUBSTR(order_date, 1, 7) AS year_month,
        ROUND(SUM(quantity * unit_price * (1 - discount)), 2) AS net_revenue
    FROM orders
    GROUP BY SUBSTR(order_date, 1, 7)
)
SELECT 
    year_month,
    net_revenue,
    ROUND(AVG(net_revenue) OVER (
        ORDER BY year_month ASC 
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ), 2) AS rolling_3mo_avg_revenue,
    ROUND(net_revenue - AVG(net_revenue) OVER (
        ORDER BY year_month ASC 
        ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
    ), 2) AS deviation_from_3mo_avg
FROM monthly_base
ORDER BY year_month ASC;


-- ----------------------------------------------------------------------------
-- Query 32: Executive Enterprise KPI Scorecard Master Summary
-- Business Purpose: Produce a unified management dashboard result set summarizing total health.
-- ----------------------------------------------------------------------------
WITH baseline_stats AS (
    SELECT 
        COUNT(DISTINCT o.order_id) AS total_orders,
        COUNT(DISTINCT o.customer_id) AS active_customers,
        SUM(o.quantity * o.unit_price * (1 - o.discount)) AS net_revenue,
        SUM(o.quantity * p.unit_cost) AS total_cogs,
        SUM(o.quantity * o.unit_price * (1 - o.discount)) - SUM(o.quantity * p.unit_cost) AS gross_profit,
        SUM(CASE WHEN o.order_status = 'Returned' THEN 1 ELSE 0 END) AS returned_orders,
        SUM(CASE WHEN o.order_status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled_orders
    FROM orders o
    JOIN products p ON o.product_id = p.product_id
),
delivery_stats AS (
    SELECT 
        SUM(CASE WHEN delivery_status = 'Delivered Late' THEN 1 ELSE 0 END) AS late_deliveries,
        AVG(CASE WHEN delivery_status = 'Delivered Late' THEN (JULIANDAY(actual_delivery_date) - JULIANDAY(promised_delivery_date)) ELSE NULL END) AS avg_late_delay
    FROM delivery
)
SELECT 
    b.total_orders,
    b.active_customers,
    ROUND(b.net_revenue, 2) AS total_net_revenue_usd,
    ROUND(b.gross_profit, 2) AS total_gross_profit_usd,
    ROUND((b.gross_profit / b.net_revenue) * 100, 2) AS gross_profit_margin_pct,
    ROUND(b.net_revenue / b.total_orders, 2) AS average_order_value_usd,
    ROUND((b.returned_orders * 100.0) / b.total_orders, 2) AS return_rate_pct,
    ROUND((b.cancelled_orders * 100.0) / b.total_orders, 2) AS cancellation_rate_pct,
    ROUND((d.late_deliveries * 100.0) / b.total_orders, 2) AS late_delivery_rate_pct,
    ROUND(d.avg_late_delay, 2) AS average_late_delay_days
FROM baseline_stats b
CROSS JOIN delivery_stats d;
