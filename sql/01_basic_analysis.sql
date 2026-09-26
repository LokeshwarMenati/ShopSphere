-- ============================================================================
-- File: 01_basic_analysis.sql
-- Project: ShopSphere E-commerce Sales & Business Performance Analytics
-- Description: Core baseline volume, financial, payment, and logistics metrics.
-- Database Compatibility: SQLite 3.25+, PostgreSQL 12+, MySQL 8.0+
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Query 1: Total Order Volume and Lifecycle Status Breakdown
-- Business Purpose: Assess operational fulfillment health across all lifecycle states.
-- ----------------------------------------------------------------------------
SELECT 
    order_status,
    COUNT(order_id) AS total_orders,
    ROUND(COUNT(order_id) * 100.0 / (SELECT COUNT(*) FROM orders), 2) AS pct_of_total_orders
FROM orders
GROUP BY order_status
ORDER BY total_orders DESC;


-- ----------------------------------------------------------------------------
-- Query 2: Enterprise Financial Baseline
-- Business Purpose: Measure gross revenue, discount allowances, net revenue,
-- product acquisition costs (COGS), and realized gross profit.
-- ----------------------------------------------------------------------------
SELECT 
    COUNT(DISTINCT order_id) AS total_orders,
    COUNT(DISTINCT customer_id) AS active_customers,
    ROUND(SUM(quantity * unit_price), 2) AS gross_revenue,
    ROUND(SUM(quantity * unit_price * discount), 2) AS total_discount_amount,
    ROUND(SUM(quantity * unit_price * (1 - discount)), 2) AS net_revenue,
    ROUND(SUM(quantity * p.unit_cost), 2) AS total_cogs,
    ROUND(SUM(quantity * unit_price * (1 - discount)) - SUM(quantity * p.unit_cost), 2) AS gross_profit,
    ROUND(((SUM(quantity * unit_price * (1 - discount)) - SUM(quantity * p.unit_cost)) / 
           SUM(quantity * unit_price * (1 - discount))) * 100, 2) AS gross_profit_margin_pct
FROM orders o
JOIN products p ON o.product_id = p.product_id;


-- ----------------------------------------------------------------------------
-- Query 3: Average Order Value (AOV) and Basket Sizing
-- Business Purpose: Benchmark basket depth and average spending per order.
-- ----------------------------------------------------------------------------
SELECT 
    ROUND(AVG(quantity * unit_price * (1 - discount)), 2) AS average_order_value_usd,
    ROUND(AVG(quantity * 1.0), 2) AS average_units_per_order,
    ROUND(AVG(discount) * 100, 2) AS average_discount_rate_pct,
    ROUND(AVG(unit_price), 2) AS average_unit_price_usd
FROM orders;


-- ----------------------------------------------------------------------------
-- Query 4: Payment Channel Distribution & Revenue Contribution
-- Business Purpose: Identify dominant checkout instruments and payment preferences.
-- ----------------------------------------------------------------------------
SELECT 
    payment_method,
    COUNT(order_id) AS total_transactions,
    ROUND(COUNT(order_id) * 100.0 / (SELECT COUNT(*) FROM orders), 2) AS transaction_share_pct,
    ROUND(SUM(quantity * unit_price * (1 - discount)), 2) AS net_revenue_usd,
    ROUND(AVG(quantity * unit_price * (1 - discount)), 2) AS aov_usd
FROM orders
GROUP BY payment_method
ORDER BY net_revenue_usd DESC;


-- ----------------------------------------------------------------------------
-- Query 5: Shipping Tier Breakdown and Average Order Value
-- Business Purpose: Evaluate customer adoption of expedited vs. standard delivery tiers.
-- ----------------------------------------------------------------------------
SELECT 
    shipping_type,
    COUNT(order_id) AS total_orders,
    ROUND(COUNT(order_id) * 100.0 / (SELECT COUNT(*) FROM orders), 2) AS order_share_pct,
    ROUND(SUM(quantity * unit_price * (1 - discount)), 2) AS total_revenue_usd,
    ROUND(AVG(quantity * unit_price * (1 - discount)), 2) AS aov_usd
FROM orders
GROUP BY shipping_type
ORDER BY total_orders DESC;
