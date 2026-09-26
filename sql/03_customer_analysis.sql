-- ============================================================================
-- File: 03_customer_analysis.sql
-- Project: ShopSphere E-commerce Sales & Business Performance Analytics
-- Description: Customer segmentation, lifetime value, frequency, cohorts, and RFM scoring.
-- Database Compatibility: SQLite 3.25+, PostgreSQL 12+, MySQL 8.0+
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Query 11: Customer Segment Economics & Unit Contribution
-- Business Purpose: Compare revenue, profitability, AOV, and customer count by segment.
-- ----------------------------------------------------------------------------
SELECT 
    c.customer_segment,
    COUNT(DISTINCT c.customer_id) AS total_registered_customers,
    COUNT(DISTINCT o.customer_id) AS active_purchasers,
    COUNT(o.order_id) AS total_orders,
    ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)), 2) AS total_net_revenue,
    ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)) - SUM(o.quantity * p.unit_cost), 2) AS total_gross_profit,
    ROUND(AVG(o.quantity * o.unit_price * (1 - o.discount)), 2) AS average_order_value_usd,
    ROUND(((SUM(o.quantity * o.unit_price * (1 - o.discount)) - SUM(o.quantity * p.unit_cost)) / 
           SUM(o.quantity * o.unit_price * (1 - o.discount))) * 100, 2) AS profit_margin_pct
FROM customers c
LEFT JOIN orders o ON c.customer_id = o.customer_id
LEFT JOIN products p ON o.product_id = p.product_id
GROUP BY c.customer_segment
ORDER BY total_net_revenue DESC;


-- ----------------------------------------------------------------------------
-- Query 12: Top 20 High-Value Customers Ranked by Lifetime Value (LTV)
-- Business Purpose: Identify enterprise VIP clients for dedicated loyalty account management.
-- ----------------------------------------------------------------------------
WITH customer_revenue AS (
    SELECT 
        c.customer_id,
        c.customer_name,
        c.customer_segment,
        c.region,
        COUNT(o.order_id) AS total_orders_placed,
        ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)), 2) AS total_spend_usd,
        ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)) - SUM(o.quantity * p.unit_cost), 2) AS gross_profit_contributed,
        MIN(o.order_date) AS first_order_date,
        MAX(o.order_date) AS latest_order_date
    FROM customers c
    JOIN orders o ON c.customer_id = o.customer_id
    JOIN products p ON o.product_id = p.product_id
    GROUP BY c.customer_id, c.customer_name, c.customer_segment, c.region
)
SELECT 
    DENSE_RANK() OVER (ORDER BY total_spend_usd DESC) AS rank_position,
    customer_id,
    customer_name,
    customer_segment,
    region,
    total_orders_placed,
    total_spend_usd,
    gross_profit_contributed,
    first_order_date,
    latest_order_date
FROM customer_revenue
ORDER BY rank_position ASC
LIMIT 20;


-- ----------------------------------------------------------------------------
-- Query 13: Customer Purchase Frequency Distribution (Pareto Depth)
-- Business Purpose: Analyze the proportion of one-time shoppers vs repeat loyalists.
-- ----------------------------------------------------------------------------
WITH customer_orders AS (
    SELECT 
        customer_id,
        COUNT(order_id) AS order_count
    FROM orders
    GROUP BY customer_id
),
frequency_buckets AS (
    SELECT 
        customer_id,
        order_count,
        CASE 
            WHEN order_count = 1 THEN '1 Order (One-Time Buyer)'
            WHEN order_count BETWEEN 2 AND 3 THEN '2 - 3 Orders (Returning)'
            WHEN order_count BETWEEN 4 AND 6 THEN '4 - 6 Orders (Loyal)'
            ELSE '7+ Orders (Power VIP)'
        END AS frequency_segment
    FROM customer_orders
)
SELECT 
    frequency_segment,
    COUNT(customer_id) AS customer_count,
    ROUND(COUNT(customer_id) * 100.0 / (SELECT COUNT(DISTINCT customer_id) FROM orders), 2) AS pct_of_active_customers,
    SUM(order_count) AS total_orders_generated,
    ROUND(SUM(order_count) * 100.0 / (SELECT COUNT(*) FROM orders), 2) AS pct_of_total_orders
FROM frequency_buckets
GROUP BY frequency_segment
ORDER BY total_orders_generated DESC;


-- ----------------------------------------------------------------------------
-- Query 14: Repeat Customer Rate Calculation
-- Business Purpose: Track core brand retention health.
-- ----------------------------------------------------------------------------
WITH customer_order_tally AS (
    SELECT 
        customer_id,
        COUNT(order_id) AS total_orders
    FROM orders
    GROUP BY customer_id
)
SELECT 
    COUNT(customer_id) AS total_active_customers,
    SUM(CASE WHEN total_orders > 1 THEN 1 ELSE 0 END) AS repeat_customers_count,
    SUM(CASE WHEN total_orders = 1 THEN 1 ELSE 0 END) AS one_time_customers_count,
    ROUND((SUM(CASE WHEN total_orders > 1 THEN 1 ELSE 0 END) * 100.0) / COUNT(customer_id), 2) AS repeat_customer_rate_pct
FROM customer_order_tally;


-- ----------------------------------------------------------------------------
-- Query 15: Customer Cohort Analysis (Acquisition Year Cohort Retention)
-- Business Purpose: Measure repeat order velocity by customer registration cohort.
-- ----------------------------------------------------------------------------
WITH customer_cohorts AS (
    SELECT 
        c.customer_id,
        SUBSTR(c.signup_date, 1, 4) AS cohort_year,
        SUBSTR(o.order_date, 1, 4) AS order_year,
        o.order_id,
        (o.quantity * o.unit_price * (1 - o.discount)) AS net_sales
    FROM customers c
    JOIN orders o ON c.customer_id = o.customer_id
)
SELECT 
    cohort_year,
    COUNT(DISTINCT customer_id) AS cohort_active_customers,
    SUM(CASE WHEN order_year = '2023' THEN 1 ELSE 0 END) AS orders_2023,
    SUM(CASE WHEN order_year = '2024' THEN 1 ELSE 0 END) AS orders_2024,
    SUM(CASE WHEN order_year = '2025' THEN 1 ELSE 0 END) AS orders_2025,
    ROUND(SUM(net_sales), 2) AS cohort_lifetime_revenue_usd
FROM customer_cohorts
GROUP BY cohort_year
ORDER BY cohort_year ASC;


-- ----------------------------------------------------------------------------
-- Query 16: RFM (Recency, Frequency, Monetary) Customer Segmentation Baseline
-- Business Purpose: Score customers 1 to 4 using NTILE window functions across RFM metrics.
-- Recency baseline set to end of dataset ('2025-12-31').
-- ----------------------------------------------------------------------------
WITH rfm_base AS (
    SELECT 
        c.customer_id,
        c.customer_name,
        c.customer_segment,
        CAST(JULIANDAY('2025-12-31') - JULIANDAY(MAX(o.order_date)) AS INTEGER) AS recency_days,
        COUNT(o.order_id) AS frequency_orders,
        ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)), 2) AS monetary_value
    FROM customers c
    JOIN orders o ON c.customer_id = o.customer_id
    GROUP BY c.customer_id, c.customer_name, c.customer_segment
),
rfm_scores AS (
    SELECT 
        customer_id,
        customer_name,
        customer_segment,
        recency_days,
        frequency_orders,
        monetary_value,
        NTILE(4) OVER (ORDER BY recency_days DESC) AS r_score,   -- 4 is most recent
        NTILE(4) OVER (ORDER BY frequency_orders ASC) AS f_score, -- 4 is highest frequency
        NTILE(4) OVER (ORDER BY monetary_value ASC) AS m_score   -- 4 is highest spend
    FROM rfm_base
)
SELECT 
    customer_id,
    customer_name,
    customer_segment,
    recency_days,
    frequency_orders,
    monetary_value,
    (r_score || f_score || m_score) AS rfm_cell,
    CASE 
        WHEN r_score = 4 AND f_score = 4 AND m_score = 4 THEN 'Champions / VIP'
        WHEN r_score >= 3 AND f_score >= 3 THEN 'Loyal Customers'
        WHEN r_score >= 3 AND f_score < 3 THEN 'Potential Loyalists'
        WHEN r_score <= 2 AND f_score >= 3 THEN 'At Risk / High Value'
        WHEN r_score = 1 AND f_score = 1 THEN 'Hibernating / Lost'
        ELSE 'Regular Customers'
    END AS rfm_segment
FROM rfm_scores
ORDER BY monetary_value DESC
LIMIT 50;
