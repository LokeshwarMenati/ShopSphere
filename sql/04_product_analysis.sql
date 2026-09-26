-- ============================================================================
-- File: 04_product_analysis.sql
-- Project: ShopSphere E-commerce Sales & Business Performance Analytics
-- Description: Merchandising performance, SKU profitability rankings, loss leaders, and return rates.
-- Database Compatibility: SQLite 3.25+, PostgreSQL 12+, MySQL 8.0+
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Query 17: Merchandising Performance by Category & Subcategory
-- Business Purpose: Identify product departments generating sustainable profit vs volume drivers.
-- ----------------------------------------------------------------------------
SELECT 
    p.category,
    p.subcategory,
    COUNT(DISTINCT p.product_id) AS total_skus,
    SUM(o.quantity) AS total_units_sold,
    ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)), 2) AS net_revenue_usd,
    ROUND(SUM(o.quantity * p.unit_cost), 2) AS total_cogs_usd,
    ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)) - SUM(o.quantity * p.unit_cost), 2) AS gross_profit_usd,
    ROUND(((SUM(o.quantity * o.unit_price * (1 - o.discount)) - SUM(o.quantity * p.unit_cost)) / 
           SUM(o.quantity * o.unit_price * (1 - o.discount))) * 100, 2) AS profit_margin_pct
FROM products p
JOIN orders o ON p.product_id = o.product_id
GROUP BY p.category, p.subcategory
ORDER BY net_revenue_usd DESC;


-- ----------------------------------------------------------------------------
-- Query 18: Top 10 Best-Selling Products Ranked by Net Revenue
-- Business Purpose: Isolate core commercial revenue drivers using DENSE_RANK().
-- ----------------------------------------------------------------------------
WITH product_revenue AS (
    SELECT 
        p.product_id,
        p.product_name,
        p.category,
        p.brand,
        SUM(o.quantity) AS units_sold,
        ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)), 2) AS net_revenue_usd,
        ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)) - SUM(o.quantity * p.unit_cost), 2) AS gross_profit_usd,
        ROUND(((SUM(o.quantity * o.unit_price * (1 - o.discount)) - SUM(o.quantity * p.unit_cost)) / 
               SUM(o.quantity * o.unit_price * (1 - o.discount))) * 100, 2) AS profit_margin_pct
    FROM products p
    JOIN orders o ON p.product_id = o.product_id
    GROUP BY p.product_id, p.product_name, p.category, p.brand
)
SELECT 
    DENSE_RANK() OVER (ORDER BY net_revenue_usd DESC) AS rank_by_revenue,
    product_id,
    product_name,
    category,
    brand,
    units_sold,
    net_revenue_usd,
    gross_profit_usd,
    profit_margin_pct
FROM product_revenue
ORDER BY rank_by_revenue ASC
LIMIT 10;


-- ----------------------------------------------------------------------------
-- Query 19: Top 10 Most Profitable Products Ranked by Gross Profit Contribution
-- Business Purpose: Identify the absolute profit champions of the catalog.
-- ----------------------------------------------------------------------------
WITH product_profit AS (
    SELECT 
        p.product_id,
        p.product_name,
        p.category,
        p.brand,
        SUM(o.quantity) AS units_sold,
        ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)), 2) AS net_revenue_usd,
        ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)) - SUM(o.quantity * p.unit_cost), 2) AS gross_profit_usd,
        ROUND(((SUM(o.quantity * o.unit_price * (1 - o.discount)) - SUM(o.quantity * p.unit_cost)) / 
               SUM(o.quantity * o.unit_price * (1 - o.discount))) * 100, 2) AS profit_margin_pct
    FROM products p
    JOIN orders o ON p.product_id = o.product_id
    GROUP BY p.product_id, p.product_name, p.category, p.brand
)
SELECT 
    DENSE_RANK() OVER (ORDER BY gross_profit_usd DESC) AS rank_by_profit,
    product_id,
    product_name,
    category,
    brand,
    units_sold,
    net_revenue_usd,
    gross_profit_usd,
    profit_margin_pct
FROM product_profit
ORDER BY rank_by_profit ASC
LIMIT 10;


-- ----------------------------------------------------------------------------
-- Query 20: Bottom 10 Underperforming / Least Profitable Products
-- Business Purpose: Highlight SKUs destroying enterprise margin or operating at negative gross profit.
-- ----------------------------------------------------------------------------
WITH product_performance AS (
    SELECT 
        p.product_id,
        p.product_name,
        p.category,
        p.brand,
        SUM(o.quantity) AS units_sold,
        ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)), 2) AS net_revenue_usd,
        ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)) - SUM(o.quantity * p.unit_cost), 2) AS gross_profit_usd,
        ROUND(((SUM(o.quantity * o.unit_price * (1 - o.discount)) - SUM(o.quantity * p.unit_cost)) / 
               SUM(o.quantity * o.unit_price * (1 - o.discount))) * 100, 2) AS profit_margin_pct
    FROM products p
    JOIN orders o ON p.product_id = o.product_id
    GROUP BY p.product_id, p.product_name, p.category, p.brand
)
SELECT 
    DENSE_RANK() OVER (ORDER BY gross_profit_usd ASC) AS bottom_rank,
    product_id,
    product_name,
    category,
    brand,
    units_sold,
    net_revenue_usd,
    gross_profit_usd,
    profit_margin_pct
FROM product_performance
ORDER BY gross_profit_usd ASC
LIMIT 10;


-- ----------------------------------------------------------------------------
-- Query 21: Loss-Leader Analysis — High-Revenue with Sub-10% or Negative Margin
-- Business Purpose: Identify high sales volume SKUs that fail to convert revenue into earnings.
-- ----------------------------------------------------------------------------
WITH sku_economics AS (
    SELECT 
        p.product_id,
        p.product_name,
        p.category,
        p.subcategory,
        SUM(o.quantity) AS units_sold,
        ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)), 2) AS net_revenue_usd,
        ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)) - SUM(o.quantity * p.unit_cost), 2) AS gross_profit_usd,
        ROUND(((SUM(o.quantity * o.unit_price * (1 - o.discount)) - SUM(o.quantity * p.unit_cost)) / 
               SUM(o.quantity * o.unit_price * (1 - o.discount))) * 100, 2) AS profit_margin_pct
    FROM products p
    JOIN orders o ON p.product_id = o.product_id
    GROUP BY p.product_id, p.product_name, p.category, p.subcategory
)
SELECT 
    product_id,
    product_name,
    category,
    subcategory,
    units_sold,
    net_revenue_usd,
    gross_profit_usd,
    profit_margin_pct
FROM sku_economics
WHERE net_revenue_usd > 30000.00 AND profit_margin_pct < 10.00
ORDER BY net_revenue_usd DESC;


-- ----------------------------------------------------------------------------
-- Query 22: Product Return Rate Analysis by Category and SKU
-- Business Purpose: Pinpoint merchandise categories and SKUs with anomalous return rates.
-- ----------------------------------------------------------------------------
SELECT 
    p.category,
    COUNT(DISTINCT o.order_id) AS total_orders,
    COUNT(DISTINCT r.return_id) AS total_returned_orders,
    ROUND((COUNT(DISTINCT r.return_id) * 100.0) / COUNT(DISTINCT o.order_id), 2) AS return_rate_pct,
    SUM(r.return_quantity) AS total_units_returned
FROM products p
JOIN orders o ON p.product_id = o.product_id
LEFT JOIN returns r ON o.order_id = r.order_id
GROUP BY p.category
ORDER BY return_rate_pct DESC;
