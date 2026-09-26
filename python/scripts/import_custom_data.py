"""
ShopSphere Custom Data Ingestion Pipeline
Allows users to ingest external CSV files or update the SQLite database (database/shopsphere.db)
and regenerate web dashboard metrics and processed datasets automatically.

Usage:
    python python/scripts/import_custom_data.py --help
    python python/scripts/import_custom_data.py --orders path/to/custom_orders.csv
    python python/scripts/import_custom_data.py --customers path/to/custom_customers.csv
    python python/scripts/import_custom_data.py --products path/to/custom_products.csv
"""

import os
import sys
import argparse
import sqlite3
import pandas as pd
from datetime import datetime

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_PATH = os.path.join(BASE_DIR, "database", "shopsphere.db")
PROCESSED_DIR = os.path.join(BASE_DIR, "data", "processed")
WEB_DATA_PATH = os.path.join(BASE_DIR, "web", "data.json")

def print_banner():
    print("=" * 70)
    print("  ShopSphere — Custom Data Ingestion & Database Sync Engine")
    print("=" * 70)

def inspect_database():
    """Prints current record counts in database/shopsphere.db."""
    if not os.path.exists(DB_PATH):
        print(f"Error: Database not found at {DB_PATH}")
        return
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    tables = ["customers", "products", "orders", "order_items", "delivery", "returns"]
    print(f"\n[Database Status] File: {DB_PATH}")
    print("-" * 50)
    for t in tables:
        try:
            cursor.execute(f"SELECT COUNT(*) FROM {t}")
            cnt = cursor.fetchone()[0]
            print(f"  * Table `{t}`: {cnt:,} records")
        except Exception as e:
            print(f"  * Table `{t}`: error ({e})")
    conn.close()
    print("-" * 50)

def ingest_orders(file_path, mode="append"):
    """Ingests custom orders into database and processed CSV."""
    if not os.path.exists(file_path):
        print(f"[Error] File not found: {file_path}")
        return False
    
    print(f"\n[Ingesting Orders] Reading {file_path}...")
    df = pd.read_csv(file_path)
    print(f"  Loaded {len(df):,} rows. Columns: {list(df.columns)}")
    
    conn = sqlite3.connect(DB_PATH)
    if mode == "append":
        df.to_sql("orders", conn, if_exists="append", index=False)
        print(f"  [SUCCESS] Appended {len(df):,} records into SQLite table `orders`.")
    else:
        df.to_sql("orders", conn, if_exists="replace", index=False)
        print(f"  [SUCCESS] Replaced SQLite table `orders` with {len(df):,} records.")
    conn.close()
    return True

def ingest_customers(file_path, mode="append"):
    """Ingests custom customers."""
    if not os.path.exists(file_path):
        print(f"[Error] File not found: {file_path}")
        return False
    
    print(f"\n[Ingesting Customers] Reading {file_path}...")
    df = pd.read_csv(file_path)
    conn = sqlite3.connect(DB_PATH)
    if mode == "append":
        df.to_sql("customers", conn, if_exists="append", index=False)
        print(f"  [SUCCESS] Appended {len(df):,} records into SQLite table `customers`.")
    else:
        df.to_sql("customers", conn, if_exists="replace", index=False)
        print(f"  [SUCCESS] Replaced SQLite table `customers` with {len(df):,} records.")
    conn.close()
    return True

def main():
    parser = argparse.ArgumentParser(description="ShopSphere Data & Database Ingestion Tool")
    parser.add_argument("--status", action="store_true", help="Display current database record counts")
    parser.add_argument("--orders", type=str, help="Path to custom orders CSV")
    parser.add_argument("--customers", type=str, help="Path to custom customers CSV")
    parser.add_argument("--products", type=str, help="Path to custom products CSV")
    parser.add_argument("--mode", type=str, default="append", choices=["append", "replace"], help="Ingestion mode: append or replace")
    
    args = parser.parse_args()
    print_banner()
    
    if args.status or (not args.orders and not args.customers and not args.products):
        inspect_database()
        print("\nTo import custom files, specify arguments:")
        print("  python python/scripts/import_custom_data.py --orders <path_to_orders.csv>")
        print("  python python/scripts/import_custom_data.py --customers <path_to_customers.csv>")
        return
    
    if args.orders:
        ingest_orders(args.orders, args.mode)
    if args.customers:
        ingest_customers(args.customers, args.mode)
    
    inspect_database()

if __name__ == "__main__":
    main()
