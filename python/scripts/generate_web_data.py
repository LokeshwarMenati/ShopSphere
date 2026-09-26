"""
Generates web/data.json containing pre-computed multidimensional aggregations
from database/shopsphere.db for the ShopSphere interactive live web dashboard.
"""

import os
import json
import sqlite3
import pandas as pd

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DB_PATH = os.path.join(BASE_DIR, "database", "shopsphere.db")
WEB_DIR = os.path.join(BASE_DIR, "web")
os.makedirs(WEB_DIR, exist_ok=True)

conn = sqlite3.connect(DB_PATH)

print("Querying database to generate web data...")

# 1. Monthly Performance (Overall and by Category, Region, Segment)
df_monthly = pd.read_sql_query("""
    SELECT 
        SUBSTR(o.order_date, 1, 7) AS month,
        SUBSTR(o.order_date, 1, 4) AS year,
        c.region,
        p.category,
        c.customer_segment,
        COUNT(o.order_id) AS orders,
        ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)), 2) AS net_revenue,
        ROUND(SUM(o.quantity * p.unit_cost), 2) AS cogs,
        ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)) - SUM(o.quantity * p.unit_cost), 2) AS gross_profit,
        SUM(CASE WHEN o.order_status = 'Returned' THEN 1 ELSE 0 END) AS returns,
        SUM(CASE WHEN o.order_status = 'Cancelled' THEN 1 ELSE 0 END) AS cancellations
    FROM orders o
    JOIN products p ON o.product_id = p.product_id
    JOIN customers c ON o.customer_id = c.customer_id
    GROUP BY month, year, c.region, p.category, c.customer_segment
""", conn)

# 2. Overall baseline totals
baseline = {
    "total_orders": 102420,
    "active_customers": 27200,
    "net_revenue": 24435345.82,
    "gross_revenue": 26498021.38,
    "total_cogs": 16462054.98,
    "gross_profit": 7973290.84,
    "profit_margin_pct": 32.63,
    "aov": 238.58,
    "repeat_rate_pct": 55.60,
    "return_rate_pct": 8.39,
    "cancellation_rate_pct": 4.77,
    "late_delivery_rate_pct": 11.38,
    "avg_delay_days": 3.49
}

# 3. Category Breakdown
df_cat = pd.read_sql_query("""
    SELECT 
        p.category,
        COUNT(DISTINCT p.product_id) AS skus,
        COUNT(o.order_id) AS orders,
        SUM(o.quantity) AS units_sold,
        ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)), 2) AS net_revenue,
        ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)) - SUM(o.quantity * p.unit_cost), 2) AS gross_profit,
        ROUND(((SUM(o.quantity * o.unit_price * (1 - o.discount)) - SUM(o.quantity * p.unit_cost)) / SUM(o.quantity * o.unit_price * (1 - o.discount))) * 100, 2) AS margin_pct,
        ROUND(COUNT(r.return_id) * 100.0 / COUNT(o.order_id), 2) AS return_rate_pct
    FROM products p
    JOIN orders o ON p.product_id = o.product_id
    LEFT JOIN returns r ON o.order_id = r.order_id
    GROUP BY p.category
    ORDER BY net_revenue DESC
""", conn)

# 4. Regional Breakdown
df_reg = pd.read_sql_query("""
    SELECT 
        c.region,
        COUNT(DISTINCT c.customer_id) AS customers,
        COUNT(o.order_id) AS orders,
        ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)), 2) AS net_revenue,
        ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)) - SUM(o.quantity * p.unit_cost), 2) AS gross_profit,
        ROUND(((SUM(o.quantity * o.unit_price * (1 - o.discount)) - SUM(o.quantity * p.unit_cost)) / SUM(o.quantity * o.unit_price * (1 - o.discount))) * 100, 2) AS margin_pct,
        ROUND(SUM(CASE WHEN d.delivery_status = 'Delivered Late' THEN 1 ELSE 0 END) * 100.0 / COUNT(o.order_id), 2) AS late_rate_pct,
        ROUND(SUM(CASE WHEN o.order_status = 'Returned' THEN 1 ELSE 0 END) * 100.0 / COUNT(o.order_id), 2) AS return_rate_pct
    FROM customers c
    JOIN orders o ON c.customer_id = o.customer_id
    JOIN products p ON o.product_id = p.product_id
    JOIN delivery d ON o.order_id = d.order_id
    GROUP BY c.region
    ORDER BY net_revenue DESC
""", conn)

# 5. Customer Segments
df_seg = pd.read_sql_query("""
    SELECT 
        c.customer_segment,
        COUNT(DISTINCT c.customer_id) AS customers,
        COUNT(o.order_id) AS orders,
        ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)), 2) AS net_revenue,
        ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)) - SUM(o.quantity * p.unit_cost), 2) AS gross_profit,
        ROUND(AVG(o.quantity * o.unit_price * (1 - o.discount)), 2) AS aov,
        ROUND(((SUM(o.quantity * o.unit_price * (1 - o.discount)) - SUM(o.quantity * p.unit_cost)) / SUM(o.quantity * o.unit_price * (1 - o.discount))) * 100, 2) AS margin_pct
    FROM customers c
    JOIN orders o ON c.customer_id = o.customer_id
    JOIN products p ON o.product_id = p.product_id
    GROUP BY c.customer_segment
    ORDER BY net_revenue DESC
""", conn)

# 6. Top 10 Best Sellers
df_top10 = pd.read_sql_query("""
    SELECT 
        p.product_id,
        p.product_name,
        p.category,
        p.brand,
        SUM(o.quantity) AS units,
        ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)), 2) AS revenue,
        ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)) - SUM(o.quantity * p.unit_cost), 2) AS profit,
        ROUND(((SUM(o.quantity * o.unit_price * (1 - o.discount)) - SUM(o.quantity * p.unit_cost)) / SUM(o.quantity * o.unit_price * (1 - o.discount))) * 100, 2) AS margin_pct
    FROM products p
    JOIN orders o ON p.product_id = o.product_id
    GROUP BY p.product_id, p.product_name, p.category, p.brand
    ORDER BY revenue DESC
    LIMIT 10
""", conn)

# 7. Bottom 10 Margin Compressed / Loss Leaders
df_bottom10 = pd.read_sql_query("""
    SELECT 
        p.product_id,
        p.product_name,
        p.category,
        p.brand,
        SUM(o.quantity) AS units,
        ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)), 2) AS revenue,
        ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)) - SUM(o.quantity * p.unit_cost), 2) AS profit,
        ROUND(((SUM(o.quantity * o.unit_price * (1 - o.discount)) - SUM(o.quantity * p.unit_cost)) / SUM(o.quantity * o.unit_price * (1 - o.discount))) * 100, 2) AS margin_pct
    FROM products p
    JOIN orders o ON p.product_id = o.product_id
    GROUP BY p.product_id, p.product_name, p.category, p.brand
    ORDER BY profit ASC
    LIMIT 10
""", conn)

# 8. Top 20 VIP Customers
df_vip = pd.read_sql_query("""
    SELECT 
        c.customer_id,
        c.customer_name,
        c.customer_segment,
        c.region,
        COUNT(o.order_id) AS orders,
        ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)), 2) AS spend,
        ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)) - SUM(o.quantity * p.unit_cost), 2) AS profit
    FROM customers c
    JOIN orders o ON c.customer_id = o.customer_id
    JOIN products p ON o.product_id = p.product_id
    GROUP BY c.customer_id, c.customer_name, c.customer_segment, c.region
    ORDER BY spend DESC
    LIMIT 20
""", conn)

# 9. Return Reasons by Category
df_reasons = pd.read_sql_query("""
    SELECT 
        p.category,
        r.return_reason,
        COUNT(r.return_id) AS return_count
    FROM returns r
    JOIN orders o ON r.order_id = o.order_id
    JOIN products p ON o.product_id = p.product_id
    GROUP BY p.category, r.return_reason
    ORDER BY return_count DESC
""", conn)

# 10. Delivery Status vs Return Correlation
df_delay_ret = pd.read_sql_query("""
    SELECT 
        d.delivery_status,
        COUNT(o.order_id) AS total_orders,
        COUNT(r.return_id) AS returned_orders,
        ROUND(COUNT(r.return_id) * 100.0 / COUNT(o.order_id), 2) AS return_rate_pct
    FROM delivery d
    JOIN orders o ON d.order_id = o.order_id
    LEFT JOIN returns r ON o.order_id = r.order_id
    WHERE d.delivery_status IN ('Delivered On-Time', 'Delivered Late')
    GROUP BY d.delivery_status
""", conn)

# 11. Payment Methods
df_payment = pd.read_sql_query("""
    SELECT 
        payment_method,
        COUNT(order_id) AS orders,
        ROUND(SUM(quantity * unit_price * (1 - discount)), 2) AS revenue,
        ROUND(AVG(quantity * unit_price * (1 - discount)), 2) AS aov,
        ROUND(SUM(CASE WHEN order_status = 'Cancelled' THEN 1 ELSE 0 END) * 100.0 / COUNT(order_id), 2) AS cancel_rate_pct
    FROM orders
    GROUP BY payment_method
    ORDER BY orders DESC
""", conn)

# 12. Shipping Tiers
df_shipping = pd.read_sql_query("""
    SELECT 
        o.shipping_type,
        COUNT(o.order_id) AS orders,
        ROUND(SUM(o.quantity * o.unit_price * (1 - o.discount)), 2) AS revenue,
        ROUND(SUM(CASE WHEN d.delivery_status = 'Delivered Late' THEN 1 ELSE 0 END) * 100.0 / COUNT(o.order_id), 2) AS late_rate_pct
    FROM orders o
    JOIN delivery d ON o.order_id = d.order_id
    GROUP BY o.shipping_type
    ORDER BY orders DESC
""", conn)

conn.close()

# Assemble full payload
web_data = {
    "baseline": baseline,
    "monthly_granular": df_monthly.to_dict(orient="records"),
    "categories": df_cat.to_dict(orient="records"),
    "regions": df_reg.to_dict(orient="records"),
    "segments": df_seg.to_dict(orient="records"),
    "top10_products": df_top10.to_dict(orient="records"),
    "bottom10_products": df_bottom10.to_dict(orient="records"),
    "vip_customers": df_vip.to_dict(orient="records"),
    "return_reasons": df_reasons.to_dict(orient="records"),
    "delay_vs_returns": df_delay_ret.to_dict(orient="records"),
    "payment_methods": df_payment.to_dict(orient="records"),
    "shipping_tiers": df_shipping.to_dict(orient="records")
}

output_path = os.path.join(WEB_DIR, "data.json")
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(web_data, f, indent=2)

print(f"Web dataset written successfully to: {output_path} ({os.path.getsize(output_path)} bytes)")
