-- ============================================================================
-- File: 05_operations_analysis.sql
-- Project: ShopSphere E-commerce Sales & Business Performance Analytics
-- Description: Logistics performance, delivery delays, regional fulfillment, and return root causes.
-- Database Compatibility: SQLite 3.25+, PostgreSQL 12+, MySQL 8.0+
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Query 23: Regional Sales, Profitability, and Margin Performance
-- Business Purpose: Measure geographical sales density and operating margins across sales territories.
-- ----------------------------------------------------------------------------
SELECT 
    c.region,
    COUNT(DISTINCT c.customer_id) AS total_customers,
    COUNT(o.order_id) AS total_orders,
    ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)), 2) AS net_revenue_usd,
    ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)) - SUM(o.quantity * p.unit_cost), 2) AS gross_profit_usd,
    ROUND(((SUM(o.quantity * o.unit_price * (1 - o.discount)) - SUM(o.quantity * p.unit_cost)) / 
           SUM(o.quantity * o.unit_price * (1 - o.discount))) * 100, 2) AS regional_profit_margin_pct,
    ROUND(AVG(o.quantity * o.unit_price * (1 - o.discount)), 2) AS average_order_value_usd
FROM customers c
JOIN orders o ON c.customer_id = o.customer_id
JOIN products p ON o.product_id = p.product_id
GROUP BY c.region
ORDER BY net_revenue_usd DESC;


-- ----------------------------------------------------------------------------
-- Query 24: Delivery SLA Fulfillment Performance Breakdown
-- Business Purpose: Measure on-time vs late carrier completion rates across the supply chain.
-- ----------------------------------------------------------------------------
SELECT 
    delivery_status,
    COUNT(order_id) AS fulfillment_count,
    ROUND(COUNT(order_id) * 100.0 / (SELECT COUNT(*) FROM delivery), 2) AS pct_of_total_shipments
FROM delivery
GROUP BY delivery_status
ORDER BY fulfillment_count DESC;


-- ----------------------------------------------------------------------------
-- Query 25: Average Delivery Delay (Days) by Shipping Type
-- Business Purpose: Isolate carrier latency and SLA breach severity by customer service tier.
-- ----------------------------------------------------------------------------
SELECT 
    o.shipping_type,
    COUNT(d.order_id) AS total_shipments,
    SUM(CASE WHEN d.delivery_status = 'Delivered Late' THEN 1 ELSE 0 END) AS late_deliveries_count,
    ROUND(SUM(CASE WHEN d.delivery_status = 'Delivered Late' THEN 1 ELSE 0 END) * 100.0 / COUNT(d.order_id), 2) AS late_delivery_rate_pct,
    ROUND(AVG(CASE 
        WHEN d.actual_delivery_date > d.promised_delivery_date 
        THEN JULIANDAY(d.actual_delivery_date) - JULIANDAY(d.promised_delivery_date) 
        ELSE 0 
    END), 2) AS average_delay_days_all_orders,
    ROUND(AVG(CASE 
        WHEN d.actual_delivery_date > d.promised_delivery_date 
        THEN JULIANDAY(d.actual_delivery_date) - JULIANDAY(d.promised_delivery_date) 
        ELSE NULL 
    END), 2) AS average_delay_days_late_orders_only
FROM orders o
JOIN delivery d ON o.order_id = d.order_id
GROUP BY o.shipping_type
ORDER BY late_delivery_rate_pct DESC;


-- ----------------------------------------------------------------------------
-- Query 26: Impact of Delivery Delays on Customer Product Return Rates
-- Business Purpose: Prove empirically that logistical tardiness directly escalates return merchandise rates.
-- ----------------------------------------------------------------------------
SELECT 
    d.delivery_status,
    COUNT(o.order_id) AS total_orders_fulfilled,
    COUNT(r.return_id) AS total_orders_returned,
    ROUND((COUNT(r.return_id) * 100.0) / COUNT(o.order_id), 2) AS return_rate_pct
FROM delivery d
JOIN orders o ON d.order_id = o.order_id
LEFT JOIN returns r ON o.order_id = r.order_id
WHERE d.delivery_status IN ('Delivered On-Time', 'Delivered Late')
GROUP BY d.delivery_status;


-- ----------------------------------------------------------------------------
-- Query 27: Order Cancellation Rate by Region & Payment Channel
-- Business Purpose: Detect payment friction and regional cancellation vulnerabilities.
-- ----------------------------------------------------------------------------
SELECT 
    c.region,
    o.payment_method,
    COUNT(o.order_id) AS total_orders_placed,
    SUM(CASE WHEN o.order_status = 'Cancelled' THEN 1 ELSE 0 END) AS cancelled_orders_count,
    ROUND(SUM(CASE WHEN o.order_status = 'Cancelled' THEN 1 ELSE 0 END) * 100.0 / COUNT(o.order_id), 2) AS cancellation_rate_pct,
    ROUND(SUM(CASE WHEN o.order_status = 'Cancelled' THEN (o.quantity * o.unit_price * (1 - o.discount)) ELSE 0 END), 2) AS revenue_lost_to_cancellations_usd
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
GROUP BY c.region, o.payment_method
HAVING total_orders_placed > 500
ORDER BY cancellation_rate_pct DESC;


-- ----------------------------------------------------------------------------
-- Query 28: Root Cause Return Reasons by Merchandise Category
-- Business Purpose: Identify specific operational and product quality return drivers.
-- ----------------------------------------------------------------------------
SELECT 
    p.category,
    r.return_reason,
    COUNT(r.return_id) AS return_event_count,
    ROUND(COUNT(r.return_id) * 100.0 / SUM(COUNT(r.return_id)) OVER (PARTITION BY p.category), 2) AS pct_within_category
FROM returns r
JOIN orders o ON r.order_id = o.order_id
JOIN products p ON o.product_id = p.product_id
GROUP BY p.category, r.return_reason
ORDER BY p.category, return_event_count DESC;
