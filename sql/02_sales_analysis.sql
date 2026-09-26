-- ============================================================================
-- File: 02_sales_analysis.sql
-- Project: ShopSphere E-commerce Sales & Business Performance Analytics
-- Description: Sales trend, seasonality, MoM and YoY growth analysis using window functions.
-- Database Compatibility: SQLite 3.25+, PostgreSQL 12+, MySQL 8.0+
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Query 6: Monthly Revenue, Profit, and Order Volume Trajectory
-- Business Purpose: Track macro business velocity across the 36-month timeline.
-- ----------------------------------------------------------------------------
SELECT 
    SUBSTR(o.order_date, 1, 7) AS year_month,
    COUNT(o.order_id) AS total_orders,
    ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)), 2) AS net_revenue_usd,
    ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)) - SUM(o.quantity * p.unit_cost), 2) AS gross_profit_usd,
    ROUND(((SUM(o.quantity * o.unit_price * (1 - o.discount)) - SUM(o.quantity * p.unit_cost)) / 
           SUM(o.quantity * o.unit_price * (1 - o.discount))) * 100, 2) AS profit_margin_pct
FROM orders o
JOIN products p ON o.product_id = p.product_id
GROUP BY SUBSTR(o.order_date, 1, 7)
ORDER BY year_month ASC;


-- ----------------------------------------------------------------------------
-- Query 7: Month-over-Month (MoM) Revenue Growth Rate Using Window Functions
-- Business Purpose: Quantify month-on-month sales acceleration/deceleration.
-- ----------------------------------------------------------------------------
WITH monthly_sales AS (
    SELECT 
        SUBSTR(order_date, 1, 7) AS year_month,
        ROUND(SUM(quantity * unit_price * (1 - discount)), 2) AS current_net_revenue
    FROM orders
    GROUP BY SUBSTR(order_date, 1, 7)
)
SELECT 
    year_month,
    current_net_revenue,
    LAG(current_net_revenue, 1) OVER (ORDER BY year_month ASC) AS prior_month_revenue,
    ROUND(current_net_revenue - LAG(current_net_revenue, 1) OVER (ORDER BY year_month ASC), 2) AS mom_revenue_change_usd,
    ROUND(((current_net_revenue - LAG(current_net_revenue, 1) OVER (ORDER BY year_month ASC)) / 
           LAG(current_net_revenue, 1) OVER (ORDER BY year_month ASC)) * 100, 2) AS mom_growth_rate_pct
FROM monthly_sales;


-- ----------------------------------------------------------------------------
-- Query 8: Month-over-Month (MoM) Gross Profit Growth Rate
-- Business Purpose: Detect margin expansion or compression across monthly cycles.
-- ----------------------------------------------------------------------------
WITH monthly_profit AS (
    SELECT 
        SUBSTR(o.order_date, 1, 7) AS year_month,
        ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)) - SUM(o.quantity * p.unit_cost), 2) AS current_gross_profit
    FROM orders o
    JOIN products p ON o.product_id = p.product_id
    GROUP BY SUBSTR(o.order_date, 1, 7)
)
SELECT 
    year_month,
    current_gross_profit,
    LAG(current_gross_profit, 1) OVER (ORDER BY year_month ASC) AS prior_month_profit,
    ROUND(current_gross_profit - LAG(current_gross_profit, 1) OVER (ORDER BY year_month ASC), 2) AS mom_profit_change_usd,
    ROUND(((current_gross_profit - LAG(current_gross_profit, 1) OVER (ORDER BY year_month ASC)) / 
           LAG(current_gross_profit, 1) OVER (ORDER BY year_month ASC)) * 100, 2) AS mom_profit_growth_pct
FROM monthly_profit;


-- ----------------------------------------------------------------------------
-- Query 9: Year-over-Year (YoY) Annual Performance Summary
-- Business Purpose: Provide corporate leadership with high-level annualized growth figures.
-- ----------------------------------------------------------------------------
WITH annual_summary AS (
    SELECT 
        SUBSTR(o.order_date, 1, 4) AS sales_year,
        COUNT(DISTINCT o.order_id) AS total_orders,
        COUNT(DISTINCT o.customer_id) AS purchasing_customers,
        ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)), 2) AS net_revenue_usd,
        ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)) - SUM(o.quantity * p.unit_cost), 2) AS gross_profit_usd
    FROM orders o
    JOIN products p ON o.product_id = p.product_id
    GROUP BY SUBSTR(o.order_date, 1, 4)
)
SELECT 
    sales_year,
    total_orders,
    purchasing_customers,
    net_revenue_usd,
    gross_profit_usd,
    LAG(net_revenue_usd, 1) OVER (ORDER BY sales_year ASC) AS prior_year_revenue,
    ROUND(((net_revenue_usd - LAG(net_revenue_usd, 1) OVER (ORDER BY sales_year ASC)) / 
           LAG(net_revenue_usd, 1) OVER (ORDER BY sales_year ASC)) * 100, 2) AS yoy_revenue_growth_pct,
    ROUND((gross_profit_usd / net_revenue_usd) * 100, 2) AS profit_margin_pct
FROM annual_summary;


-- ----------------------------------------------------------------------------
-- Query 10: Day of Week Order Performance Dynamics
-- Business Purpose: Identify peak shopping days to optimize marketing campaigns and ad spend.
-- Note: strftime('%w', order_date) returns 0 for Sunday to 6 for Saturday.
-- ----------------------------------------------------------------------------
SELECT 
    CASE CAST(STRFTIME('%w', order_date) AS INTEGER)
        WHEN 0 THEN 'Sunday'
        WHEN 1 THEN 'Monday'
        WHEN 2 THEN 'Tuesday'
        WHEN 3 THEN 'Wednesday'
        WHEN 4 THEN 'Thursday'
        WHEN 5 THEN 'Friday'
        WHEN 6 THEN 'Saturday'
    END AS day_of_week,
    COUNT(order_id) AS order_count,
    ROUND(COUNT(order_id) * 100.0 / (SELECT COUNT(*) FROM orders), 2) AS order_share_pct,
    ROUND(SUM(quantity * unit_price * (1 - discount)), 2) AS total_revenue_usd,
    ROUND(AVG(quantity * unit_price * (1 - discount)), 2) AS aov_usd
FROM orders
GROUP BY STRFTIME('%w', order_date)
ORDER BY order_count DESC;
