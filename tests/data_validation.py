"""
ShopSphere Automated Data Quality & Integrity Validation Test Suite
Performs 10 rigorous integrity checks on processed analytical datasets.
Reports formatted PASS / FAIL results with detailed error counts.
"""

import os
import sys
import pandas as pd
import numpy as np

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")

print("=" * 75)
print("SHOPSPHERE AUTOMATED DATA VALIDATION SUITE")
print("Target Directory: data/processed/")
print("=" * 75)

# Load processed datasets
try:
    df_customers = pd.read_csv(os.path.join(PROCESSED_DIR, "customers.csv"))
    df_products = pd.read_csv(os.path.join(PROCESSED_DIR, "products.csv"))
    df_orders = pd.read_csv(os.path.join(PROCESSED_DIR, "orders.csv"))
    df_delivery = pd.read_csv(os.path.join(PROCESSED_DIR, "delivery.csv"))
    df_returns = pd.read_csv(os.path.join(PROCESSED_DIR, "returns.csv"))
    print("[INIT] All processed datasets loaded successfully.\n")
except Exception as e:
    print(f"[FATAL] Failed to load processed datasets: {e}")
    sys.exit(1)

test_results = []

def run_test(test_id, description, condition, error_count, details=""):
    status = "PASS" if condition else "FAIL"
    test_results.append({
        "ID": test_id,
        "Description": description,
        "Status": status,
        "Errors": error_count,
        "Details": details
    })
    badge = "[PASS]" if status == "PASS" else "[FAIL]"
    print(f"{badge} {test_id}: {description} (Errors: {error_count}) {details}")


# 1. Duplicate Order IDs check
dup_orders = df_orders.duplicated(subset=["order_id"]).sum()
run_test("TC-VAL-01", "Primary Key Uniqueness - orders.order_id", dup_orders == 0, dup_orders)

# 2. Duplicate Customer IDs check
dup_cust = df_customers.duplicated(subset=["customer_id"]).sum()
run_test("TC-VAL-02", "Primary Key Uniqueness - customers.customer_id", dup_cust == 0, dup_cust)

# 3. Duplicate Product IDs check
dup_prod = df_products.duplicated(subset=["product_id"]).sum()
run_test("TC-VAL-03", "Primary Key Uniqueness - products.product_id", dup_prod == 0, dup_prod)

# 4. Missing Customer IDs in Orders
missing_cust_orders = df_orders["customer_id"].isna().sum()
run_test("TC-VAL-04", "Mandatory Foreign Key - orders.customer_id is not null", missing_cust_orders == 0, missing_cust_orders)

# 5. Missing Product IDs in Orders
missing_prod_orders = df_orders["product_id"].isna().sum()
run_test("TC-VAL-05", "Mandatory Foreign Key - orders.product_id is not null", missing_prod_orders == 0, missing_prod_orders)

# 6. Referential Integrity: Orders -> Customers & Products
valid_c_ids = set(df_customers["customer_id"])
valid_p_ids = set(df_products["product_id"])
invalid_cust_ref = (~df_orders["customer_id"].isin(valid_c_ids)).sum()
invalid_prod_ref = (~df_orders["product_id"].isin(valid_p_ids)).sum()
run_test("TC-VAL-06", "Referential Integrity - orders -> customers & products", 
         (invalid_cust_ref == 0) and (invalid_prod_ref == 0), 
         invalid_cust_ref + invalid_prod_ref)

# 7. Referential Integrity: Returns -> Orders
valid_o_ids = set(df_orders["order_id"])
invalid_return_orders = (~df_returns["order_id"].isin(valid_o_ids)).sum()
run_test("TC-VAL-07", "Referential Integrity - returns -> orders", invalid_return_orders == 0, invalid_return_orders)

# 8. Negative / Zero Quantities in Orders
invalid_qty = (df_orders["quantity"] <= 0).sum()
run_test("TC-VAL-08", "Domain Boundary - orders.quantity must be > 0", invalid_qty == 0, invalid_qty)

# 9. Invalid Prices & Costs
invalid_prices = ((df_orders["unit_price"] <= 0) | (df_products["unit_cost"] <= 0)).sum()
run_test("TC-VAL-09", "Domain Boundary - unit_price and unit_cost must be > 0.00", invalid_prices == 0, invalid_prices)

# 10. Invalid Discount Range (Must be between 0.00 and 1.00)
invalid_discounts = ((df_orders["discount"] < 0.0) | (df_orders["discount"] > 1.0)).sum()
run_test("TC-VAL-10", "Domain Boundary - orders.discount within [0.00, 1.00]", invalid_discounts == 0, invalid_discounts)

# 11. Invalid Order Statuses
valid_statuses = {"Delivered", "Cancelled", "Returned", "Shipped"}
invalid_stat = (~df_orders["order_status"].isin(valid_statuses)).sum()
run_test("TC-VAL-11", "Categorical Domain - orders.order_status in valid set", invalid_stat == 0, invalid_stat)

# 12. Return Quantities Exceeding Order Quantities
order_qty_map = dict(zip(df_orders["order_id"], df_orders["quantity"]))
df_returns["max_order_qty"] = df_returns["order_id"].map(order_qty_map)
excess_returns = (df_returns["return_quantity"] > df_returns["max_order_qty"]).sum()
run_test("TC-VAL-12", "Business Logic - return_quantity <= original order quantity", excess_returns == 0, excess_returns)

# 13. Temporal Validity: Promised Delivery >= Order Date
df_deliv_valid = df_delivery.dropna(subset=["promised_delivery_date", "order_date"]).copy()
invalid_promised_dates = (df_deliv_valid["promised_delivery_date"] < df_deliv_valid["order_date"]).sum()
run_test("TC-VAL-13", "Temporal Validity - promised_delivery_date >= order_date", invalid_promised_dates == 0, invalid_promised_dates)

# Summary
print("\n" + "=" * 75)
total_tests = len(test_results)
passed_tests = sum(1 for t in test_results if t["Status"] == "PASS")
failed_tests = total_tests - passed_tests

print(f"TEST EXECUTION SUMMARY: {passed_tests}/{total_tests} PASSED ({failed_tests} FAILED)")
if failed_tests == 0:
    print("STATUS: ALL AUTOMATED VALIDATION CHECKS PASSED [PRODUCTION READY]")
    print("=" * 75)
    sys.exit(0)
else:
    print("STATUS: VALIDATION FAILURES DETECTED")
    print("=" * 75)
    sys.exit(1)
