"""
ShopSphere Data Generation Script
Generates realistic, production-style e-commerce datasets with built-in business relationships
and realistic data quality anomalies for the ShopSphere portfolio project.
"""

import os
import random
import datetime
import numpy as np
import pandas as pd

# Set fixed seed for reproducibility
SEED = 42
random.seed(SEED)
np.random.seed(SEED)

RAW_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "data", "raw")
os.makedirs(RAW_DIR, exist_ok=True)

print("Starting ShopSphere synthetic data generation...")

# ==========================================
# 1. GENERATE PRODUCTS (500+ records)
# ==========================================
print("Generating products...")

categories = {
    "Electronics": {
        "subcategories": {
            "Smartphones": (300, 1100, 0.20, 0.35),
            "Laptops": (500, 2200, 0.15, 0.30),
            "Audio & Headphones": (30, 250, 0.35, 0.55),
            "Wearables & Smartwatches": (80, 400, 0.30, 0.45),
            "Accessories & Cables": (10, 60, 0.50, 0.70)
        },
        "brands": ["VoltTech", "ApexDigital", "AuraSound", "NovaCore", "PulseByte"]
    },
    "Apparel & Fashion": {
        "subcategories": {
            "Men's Clothing": (20, 120, 0.50, 0.68),
            "Women's Clothing": (25, 150, 0.52, 0.72),
            "Footwear": (40, 180, 0.45, 0.65),
            "Bags & Luggage": (35, 200, 0.48, 0.66),
            "Fashion Accessories": (15, 75, 0.55, 0.75)
        },
        "brands": ["LuxeThread", "UrbanAura", "VogueCraft", "MetroStride", "StitchWave"]
    },
    "Home & Kitchen": {
        "subcategories": {
            "Cookware": (30, 180, 0.40, 0.55),
            "Small Kitchen Appliances": (45, 250, 0.25, 0.42),
            "Home Decor": (15, 95, 0.50, 0.70),
            "Bedding & Bath": (25, 140, 0.45, 0.62),
            "Storage & Organization": (12, 65, 0.45, 0.60)
        },
        "brands": ["HomeCraft", "ChefElite", "CozyNest", "HavenLiving", "PureOrigin"]
    },
    "Beauty & Personal Care": {
        "subcategories": {
            "Skincare": (15, 85, 0.60, 0.80),
            "Haircare": (12, 60, 0.58, 0.78),
            "Fragrance": (35, 160, 0.65, 0.85),
            "Personal Hygiene": (8, 40, 0.45, 0.65),
            "Wellness & Grooming": (18, 90, 0.52, 0.72)
        },
        "brands": ["GlowEssence", "DermaPure", "AromaLux", "SilkVelvet", "VitalCare"]
    },
    "Sports & Fitness": {
        "subcategories": {
            "Exercise Equipment": (50, 450, 0.28, 0.45),
            "Activewear": (25, 110, 0.50, 0.68),
            "Outdoor & Camping": (40, 260, 0.35, 0.52),
            "Yoga & Recovery": (18, 85, 0.48, 0.68),
            "Sports Accessories": (10, 55, 0.50, 0.70)
        },
        "brands": ["TitanAthletics", "PulseFit", "PeakTrek", "FlexForm", "IronCore"]
    }
}

product_rows = []
prod_counter = 1

for cat, c_data in categories.items():
    subcats = c_data["subcategories"]
    brands = c_data["brands"]
    for subcat, (min_p, max_p, min_m, max_m) in subcats.items():
        # Generate ~21 products per subcategory -> 25 subcats * 21 = 525 products
        num_items = 21
        for i in range(num_items):
            pid = f"PROD-{prod_counter:04d}"
            brand = random.choice(brands)
            name = f"{brand} {subcat.split()[0]} {random.choice(['Pro', 'Max', 'Plus', 'Classic', 'Elite', 'Prime', 'Ultra', 'Air'])} {100 + i*10}"
            price = round(random.uniform(min_p, max_p), 2)
            margin = random.uniform(min_m, max_m)
            
            # Intentionally engineer 15 specific high-volume, low/negative margin loss-leader products in Electronics & Small Appliances
            if cat == "Electronics" and subcat in ["Smartphones", "Laptops"] and i in [0, 1]:
                # Loss leaders / promotional margin squeeze
                margin = random.uniform(-0.04, 0.05)
            
            cost = round(price * (1 - margin), 2)
            
            product_rows.append({
                "product_id": pid,
                "product_name": name,
                "category": cat,
                "subcategory": subcat,
                "brand": brand,
                "unit_cost": cost,
                "selling_price": price
            })
            prod_counter += 1

df_products = pd.DataFrame(product_rows)

# Inject realistic raw data quality issues in products:
# 1. Inconsistent casing for category
casing_indices = random.sample(range(len(df_products)), 12)
for idx in casing_indices[:4]:
    df_products.at[idx, "category"] = df_products.at[idx, "category"].lower()
for idx in casing_indices[4:8]:
    df_products.at[idx, "category"] = df_products.at[idx, "category"].upper()

# 2. Missing brand or subcategory in a few rows
missing_brand_indices = random.sample(range(len(df_products)), 6)
for idx in missing_brand_indices:
    df_products.at[idx, "brand"] = None

# 3. Duplicate product rows (intentional raw quality issue)
df_products_raw = pd.concat([df_products, df_products.iloc[random.sample(range(len(df_products)), 8)]], ignore_index=True)

df_products_raw.to_csv(os.path.join(RAW_DIR, "products.csv"), index=False)
print(f"Products created: {len(df_products_raw)} rows (saved to raw/products.csv)")

# Clean reference product table for consistent order generation
clean_products_ref = pd.DataFrame(product_rows)


# ==========================================
# 2. GENERATE CUSTOMERS (50,000+ records)
# ==========================================
print("Generating 50,000+ customers...")

first_names_m = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", 
                 "Daniel", "Matthew", "Anthony", "Mark", "Donald", "Steven", "Paul", "Andrew", "Joshua", "Kevin",
                 "Brian", "George", "Edward", "Ronald", "Timothy", "Jason", "Jeffrey", "Ryan", "Jacob", "Gary",
                 "Nicholas", "Eric", "Jonathan", "Stephen", "Larry", "Justin", "Scott", "Brandon", "Benjamin", "Samuel",
                 "Aarav", "Vivaan", "Aditya", "Vihaan", "Arjun", "Sai", "Reyansh", "Ayaan", "Krishna", "Ishaan"]

first_names_f = ["Mary", "Patricia", "Jennifer", "Linda", "Elizabeth", "Barbara", "Susan", "Jessica", "Sarah", "Karen",
                 "Lisa", "Nancy", "Betty", "Margaret", "Sandra", "Ashley", "Kimberly", "Emily", "Donna", "Michelle",
                 "Carol", "Amanda", "Dorothy", "Melissa", "Deborah", "Stephanie", "Rebecca", "Sharon", "Laura", "Cynthia",
                 "Kathleen", "Amy", "Angela", "Shirley", "Anna", "Brenda", "Pamela", "Emma", "Nicole", "Helen",
                 "Aanya", "Diya", "Saanvi", "Ananya", "Aadhya", "Pari", "Fatima", "Zara", "Pooja", "Meera"]

last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
              "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
              "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson",
              "Walker", "Young", "Allen", "King", "Wright", "Scott", "Torres", "Nguyen", "Hill", "Flores",
              "Sharma", "Patel", "Verma", "Singh", "Kumar", "Iyer", "Rao", "Reddy", "Nair", "Das"]

regions_geo = {
    "West": [
        ("Los Angeles", "California"), ("San Francisco", "California"), ("San Diego", "California"),
        ("Seattle", "Washington"), ("Portland", "Oregon"), ("Phoenix", "Arizona"),
        ("Las Vegas", "Nevada"), ("Denver", "Colorado"), ("Salt Lake City", "Utah")
    ],
    "East": [
        ("New York City", "New York"), ("Buffalo", "New York"), ("Philadelphia", "Pennsylvania"),
        ("Pittsburgh", "Pennsylvania"), ("Boston", "Massachusetts"), ("Baltimore", "Maryland"),
        ("Newark", "New Jersey"), ("Hartford", "Connecticut"), ("Providence", "Rhode Island")
    ],
    "Central": [
        ("Chicago", "Illinois"), ("Houston", "Texas"), ("Dallas", "Texas"),
        ("Austin", "Texas"), ("San Antonio", "Texas"), ("Minneapolis", "Minnesota"),
        ("St. Louis", "Missouri"), ("Kansas City", "Missouri"), ("Indianapolis", "Indiana")
    ],
    "South": [
        ("Atlanta", "Georgia"), ("Miami", "Florida"), ("Orlando", "Florida"),
        ("Tampa", "Florida"), ("Charlotte", "North Carolina"), ("Raleigh", "North Carolina"),
        ("Nashville", "Tennessee"), ("Memphis", "Tennessee"), ("New Orleans", "Louisiana")
    ],
    "North": [
        ("Columbus", "Ohio"), ("Cleveland", "Ohio"), ("Detroit", "Michigan"),
        ("Grand Rapids", "Michigan"), ("Milwaukee", "Wisconsin"), ("Des Moines", "Iowa"),
        ("Omaha", "Nebraska"), ("Fargo", "North Dakota"), ("Sioux Falls", "South Dakota")
    ]
}

num_unique_cust = 50500
customer_rows = []

start_signup = datetime.date(2022, 1, 1)
end_signup = datetime.date(2025, 6, 30)
signup_days_span = (end_signup - start_signup).days

region_weights = [0.30, 0.26, 0.20, 0.14, 0.10] # West, East, Central, South, North
region_keys = ["West", "East", "Central", "South", "North"]

for i in range(1, num_unique_cust + 1):
    cid = f"CUST-{i:05d}"
    gender = random.choices(["Male", "Female", "Other"], weights=[0.48, 0.49, 0.03])[0]
    
    if gender == "Male":
        fname = random.choice(first_names_m)
    elif gender == "Female":
        fname = random.choice(first_names_f)
    else:
        fname = random.choice(first_names_m + first_names_f)
        
    lname = random.choice(last_names)
    name = f"{fname} {lname}"
    
    # Age centered around 34
    age = int(np.clip(np.random.normal(36, 12), 18, 75))
    
    region = random.choices(region_keys, weights=region_weights)[0]
    city, state = random.choice(regions_geo[region])
    
    signup_offset = random.randint(0, signup_days_span)
    signup_date = start_signup + datetime.timedelta(days=signup_offset)
    
    segment = random.choices(["Consumer", "Corporate", "Small Business"], weights=[0.68, 0.22, 0.10])[0]
    
    customer_rows.append({
        "customer_id": cid,
        "customer_name": name,
        "gender": gender,
        "age": age,
        "city": city,
        "state": state,
        "region": region,
        "signup_date": signup_date.isoformat(),
        "customer_segment": segment
    })

df_customers = pd.DataFrame(customer_rows)

# Inject realistic data quality anomalies into raw customers:
# 1. Duplicate customer records (~180 duplicates)
dup_cust_indices = random.sample(range(len(df_customers)), 180)
df_cust_dups = df_customers.iloc[dup_cust_indices].copy()

# 2. Inconsistent casing in segment and region
segment_casing_indices = random.sample(range(len(df_customers)), 250)
for idx in segment_casing_indices[:100]:
    df_customers.at[idx, "customer_segment"] = df_customers.at[idx, "customer_segment"].lower()
for idx in segment_casing_indices[100:180]:
    df_customers.at[idx, "customer_segment"] = df_customers.at[idx, "customer_segment"].upper()

# 3. Missing values in gender and city
missing_indices = random.sample(range(len(df_customers)), 120)
for idx in missing_indices[:60]:
    df_customers.at[idx, "gender"] = None
for idx in missing_indices[60:]:
    df_customers.at[idx, "city"] = None

# 4. Age outliers (e.g. negative age, age > 120)
age_outlier_indices = random.sample(range(len(df_customers)), 25)
for i, idx in enumerate(age_outlier_indices):
    if i % 2 == 0:
        df_customers.at[idx, "age"] = random.choice([142, 150, 165])
    else:
        df_customers.at[idx, "age"] = random.choice([-2, -5, 0])

# 5. Non-standard date formats for a few rows ('DD/MM/YYYY')
date_format_indices = random.sample(range(len(df_customers)), 150)
for idx in date_format_indices:
    orig_date = df_customers.at[idx, "signup_date"]
    parts = orig_date.split("-")
    df_customers.at[idx, "signup_date"] = f"{parts[2]}/{parts[1]}/{parts[0]}"

df_customers_raw = pd.concat([df_customers, df_cust_dups], ignore_index=True)
df_customers_raw.to_csv(os.path.join(RAW_DIR, "customers.csv"), index=False)
print(f"Customers created: {len(df_customers_raw)} rows (saved to raw/customers.csv)")

# Keep clean customer list for order generation
clean_cust_ref = pd.DataFrame(customer_rows)


# ==========================================
# 3. GENERATE ORDERS & DELIVERY (100,000+ records)
# ==========================================
print("Generating 102,000 orders and deliveries with realistic purchase patterns...")

TOTAL_ORDERS = 102500
order_rows = []
delivery_rows = []

# Customer purchase frequency distribution:
# ~62% buy once, ~22% buy 2-3 times, ~11% buy 4-6 times, ~5% buy 7-15 times (power buyers)
cust_ids = clean_cust_ref["customer_id"].tolist()
cust_signup_dict = dict(zip(clean_cust_ref["customer_id"], clean_cust_ref["signup_date"]))
cust_segment_dict = dict(zip(clean_cust_ref["customer_id"], clean_cust_ref["customer_segment"]))

weights = np.random.pareto(a=1.5, size=len(cust_ids)) + 0.1
weights = weights / weights.sum()

selected_custs_for_orders = np.random.choice(cust_ids, size=TOTAL_ORDERS, p=weights)

order_start = datetime.date(2023, 1, 1)
order_end = datetime.date(2025, 12, 31)
order_span_days = (order_end - order_start).days

products_list = clean_products_ref.to_dict("records")
prod_weights = np.random.exponential(scale=1.0, size=len(products_list))
prod_weights = prod_weights / prod_weights.sum()

payment_methods = ["Credit Card", "Debit Card", "PayPal", "UPI / Net Banking", "Cash on Delivery (COD)"]
payment_weights = [0.42, 0.24, 0.18, 0.11, 0.05]

shipping_types = ["Standard", "Express", "Economy", "Same Day"]
shipping_weights = [0.55, 0.28, 0.12, 0.05]

status_choices = ["Delivered", "Cancelled", "Returned", "Shipped"]
status_weights = [0.82, 0.05, 0.10, 0.03]

# Seasonality monthly multipliers for 2023-2025 (Nov-Dec peaks, Aug-Sep bump)
month_multipliers = {
    1: 0.85, 2: 0.80, 3: 0.95, 4: 0.92, 5: 0.98, 6: 1.02,
    7: 1.05, 8: 1.15, 9: 1.10, 10: 1.08, 11: 1.48, 12: 1.62
}

# Pre-generate dates respecting seasonality
sampled_dates = []
current_d = order_start
while len(sampled_dates) < TOTAL_ORDERS:
    m = current_d.month
    mult = month_multipliers[m] * (1.0 + (current_d.year - 2023) * 0.14) # YoY growth
    daily_count = int(np.random.poisson(85 * mult))
    sampled_dates.extend([current_d] * daily_count)
    current_d += datetime.timedelta(days=1)
    if current_d > order_end:
        break

if len(sampled_dates) > TOTAL_ORDERS:
    sampled_dates = random.sample(sampled_dates, TOTAL_ORDERS)
elif len(sampled_dates) < TOTAL_ORDERS:
    sampled_dates.extend([random.choice(sampled_dates) for _ in range(TOTAL_ORDERS - len(sampled_dates))])

sampled_dates.sort()

print("Assembling order items and deliveries...")

for idx in range(TOTAL_ORDERS):
    order_id = f"ORD-{idx+1:06d}"
    cid = selected_custs_for_orders[idx]
    
    # Ensure order date >= customer signup date
    signup_str = cust_signup_dict[cid]
    s_date = datetime.date.fromisoformat(signup_str)
    raw_order_d = sampled_dates[idx]
    
    if raw_order_d < s_date:
        o_date = s_date + datetime.timedelta(days=random.randint(1, 45))
        if o_date > order_end:
            o_date = order_end
    else:
        o_date = raw_order_d
        
    prod = random.choices(products_list, weights=prod_weights)[0]
    pid = prod["product_id"]
    u_price = prod["selling_price"]
    
    # Quantity: corporate orders slightly larger
    seg = cust_segment_dict[cid]
    if seg == "Corporate":
        qty = random.choices([1, 2, 3, 4, 5, 8], weights=[0.30, 0.30, 0.20, 0.10, 0.06, 0.04])[0]
    elif seg == "Small Business":
        qty = random.choices([1, 2, 3, 4], weights=[0.50, 0.30, 0.15, 0.05])[0]
    else:
        qty = random.choices([1, 2, 3], weights=[0.75, 0.20, 0.05])[0]
        
    # Discount: higher discount slightly increases quantity
    # Discrete discounts: 0%, 5%, 10%, 15%, 20%, 25%, 30%
    discount = random.choices([0.0, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30],
                              weights=[0.35, 0.25, 0.18, 0.10, 0.06, 0.04, 0.02])[0]
    if discount >= 0.20 and random.random() < 0.35:
        qty += 1 # discount-induced volume
        
    pm = random.choices(payment_methods, weights=payment_weights)[0]
    st = random.choices(shipping_types, weights=shipping_weights)[0]
    
    # Promised delivery SLA based on shipping type
    if st == "Same Day":
        promised_days = random.choice([0, 1])
    elif st == "Express":
        promised_days = random.choice([1, 2])
    elif st == "Standard":
        promised_days = random.choice([3, 4, 5])
    else: # Economy
        promised_days = random.choice([5, 6, 7])
        
    promised_del_d = o_date + datetime.timedelta(days=promised_days)
    
    # Operational delay simulation:
    # ~84% on time, ~11% delayed, ~5% cancelled
    is_cancelled = (random.random() < 0.048)
    
    if is_cancelled:
        order_status = "Cancelled"
        delivery_status = "Cancelled"
        actual_del_d = None
    else:
        # Delay probability higher during holiday peak (Nov-Dec)
        delay_prob = 0.22 if o_date.month in [11, 12] else 0.10
        is_delayed = (random.random() < delay_prob)
        
        if is_delayed:
            delay_days = random.randint(1, 6)
            actual_del_d = promised_del_d + datetime.timedelta(days=delay_days)
            delivery_status = "Delivered Late"
        else:
            early_or_ontime = random.choice([0, -1, 0, 0])
            actual_del_d = promised_del_d + datetime.timedelta(days=early_or_ontime)
            if actual_del_d < o_date:
                actual_del_d = o_date
            delivery_status = "Delivered On-Time"
            
        # Return probability:
        # High base in Apparel (~16%), Electronics (~9%), Home (~7%), Beauty (~3%), Sports (~6%)
        # Multiplied by 2.8x if delivery was late!
        # Multiplied by 1.4x if high discount (>20%)!
        cat = prod["category"]
        base_ret = {"Apparel & Fashion": 0.14, "Electronics": 0.08, "Home & Kitchen": 0.06, 
                    "Sports & Fitness": 0.05, "Beauty & Personal Care": 0.028}.get(cat, 0.06)
        
        ret_prob = base_ret
        if delivery_status == "Delivered Late":
            ret_prob *= 2.8
        if discount >= 0.20:
            ret_prob *= 1.35
            
        if random.random() < ret_prob:
            order_status = "Returned"
        else:
            # recent orders in late 2025 can be shipped
            if o_date >= datetime.date(2025, 12, 28) and random.random() < 0.35:
                order_status = "Shipped"
                delivery_status = "In Transit"
                actual_del_d = None
            else:
                order_status = "Delivered"

    order_rows.append({
        "order_id": order_id,
        "customer_id": cid,
        "order_date": o_date.isoformat(),
        "product_id": pid,
        "quantity": qty,
        "unit_price": u_price,
        "discount": discount,
        "payment_method": pm,
        "order_status": order_status,
        "shipping_type": st
    })
    
    delivery_rows.append({
        "order_id": order_id,
        "order_date": o_date.isoformat(),
        "promised_delivery_date": promised_del_d.isoformat(),
        "actual_delivery_date": actual_del_d.isoformat() if actual_del_d else None,
        "delivery_status": delivery_status
    })

df_orders = pd.DataFrame(order_rows)
df_delivery = pd.DataFrame(delivery_rows)

print(f"Orders generated: {len(df_orders)} rows")
print(f"Delivery records generated: {len(df_delivery)} rows")

# ==========================================
# 4. GENERATE RETURNS (10,000+ records)
# ==========================================
print("Generating returns corresponding to returned orders...")

# Filter orders marked as Returned
returned_orders = df_orders[df_orders["order_status"] == "Returned"].copy()
print(f"Returned orders pool count: {len(returned_orders)}")

# If returned orders count is slightly below 10,000, add partial returns from delivered orders to reach >10,500
if len(returned_orders) < 10500:
    extra_needed = 10600 - len(returned_orders)
    delivered_sample = df_orders[df_orders["order_status"] == "Delivered"].sample(extra_needed, random_state=SEED)
    returned_orders_pool = pd.concat([returned_orders, delivered_sample])
else:
    returned_orders_pool = returned_orders

return_rows = []
ret_counter = 1

delivery_status_lookup = dict(zip(df_delivery["order_id"], df_delivery["delivery_status"]))
order_prod_lookup = dict(zip(clean_products_ref["product_id"], clean_products_ref["category"]))

for _, row in returned_orders_pool.iterrows():
    ret_id = f"RET-{ret_counter:06d}"
    oid = row["order_id"]
    odate = datetime.date.fromisoformat(row["order_date"])
    d_stat = delivery_status_lookup.get(oid, "Delivered On-Time")
    prod_cat = order_prod_lookup.get(row["product_id"], "Electronics")
    
    # Return reasons realistic logic
    if d_stat == "Delivered Late" and random.random() < 0.65:
        reason = "Late Delivery"
    elif prod_cat == "Apparel & Fashion" and random.random() < 0.55:
        reason = random.choice(["Size / Fit Issue", "Not as Described", "Changed Mind"])
    elif prod_cat == "Electronics" and random.random() < 0.40:
        reason = random.choice(["Defective / Damaged", "Missing Parts / Accessories", "Changed Mind"])
    else:
        reason = random.choice([
            "Changed Mind", "Defective / Damaged", "Wrong Item Delivered",
            "Not as Described", "Found Better Price", "Size / Fit Issue"
        ])
        
    return_days = random.randint(3, 21)
    ret_date = odate + datetime.timedelta(days=return_days)
    
    # Return quantity: usually equal to order quantity, occasionally partial return if qty > 1
    ord_qty = row["quantity"]
    ret_qty = ord_qty if ord_qty == 1 else random.choice([1, ord_qty])
    
    return_rows.append({
        "return_id": ret_id,
        "order_id": oid,
        "return_date": ret_date.isoformat(),
        "return_reason": reason,
        "return_quantity": ret_qty
    })
    ret_counter += 1

df_returns = pd.DataFrame(return_rows)
print(f"Returns generated: {len(df_returns)} records")


# ==========================================
# 5. INJECT REALISTIC DATA QUALITY ISSUES INTO RAW DATA
# ==========================================
print("Injecting realistic data quality issues into raw orders, delivery, and returns...")

# Orders anomalies:
# 1. Duplicate order rows (~220 duplicates)
dup_orders = df_orders.sample(220, random_state=SEED).copy()

# 2. Missing customer_id or product_id (~80 rows)
missing_cust_indices = df_orders.sample(45, random_state=SEED).index
for idx in missing_cust_indices:
    df_orders.at[idx, "customer_id"] = None

missing_prod_indices = df_orders.sample(35, random_state=SEED+1).index
for idx in missing_prod_indices:
    df_orders.at[idx, "product_id"] = None

# 3. Negative quantities or extreme outliers (~20 rows)
outlier_indices = df_orders.sample(20, random_state=SEED+2).index
for i, idx in enumerate(outlier_indices):
    if i % 2 == 0:
        df_orders.at[idx, "quantity"] = -1 * random.randint(1, 3)
    else:
        df_orders.at[idx, "quantity"] = random.randint(120, 250)

# 4. Inconsistent payment method casing / formatting
pm_indices = df_orders.sample(180, random_state=SEED+3).index
for idx in pm_indices[:90]:
    df_orders.at[idx, "payment_method"] = str(df_orders.at[idx, "payment_method"]).lower()
for idx in pm_indices[90:]:
    df_orders.at[idx, "payment_method"] = str(df_orders.at[idx, "payment_method"]).upper()

# 5. Non-standard date formats ('DD-MM-YYYY' or 'YYYY/MM/DD')
date_idx = df_orders.sample(150, random_state=SEED+4).index
for idx in date_idx[:75]:
    dt = df_orders.at[idx, "order_date"]
    p = dt.split("-")
    df_orders.at[idx, "order_date"] = f"{p[2]}-{p[1]}-{p[0]}"
for idx in date_idx[75:]:
    dt = df_orders.at[idx, "order_date"]
    df_orders.at[idx, "order_date"] = dt.replace("-", "/")

df_orders_raw = pd.concat([df_orders, dup_orders], ignore_index=True)
df_orders_raw.to_csv(os.path.join(RAW_DIR, "orders.csv"), index=False)
print(f"Orders saved to raw/orders.csv ({len(df_orders_raw)} rows)")

# Delivery anomalies:
# 1. Duplicate delivery rows (~210 rows)
dup_delivery = df_delivery.sample(210, random_state=SEED).copy()

# 2. Missing delivery status (~40 rows)
missing_del_stat = df_delivery.sample(40, random_state=SEED+5).index
for idx in missing_del_stat:
    df_delivery.at[idx, "delivery_status"] = None

# 3. Inconsistent date formats
del_date_idx = df_delivery.sample(120, random_state=SEED+6).index
for idx in del_date_idx:
    dt = df_delivery.at[idx, "order_date"]
    p = dt.split("-")
    df_delivery.at[idx, "order_date"] = f"{p[2]}/{p[1]}/{p[0]}"

df_delivery_raw = pd.concat([df_delivery, dup_delivery], ignore_index=True)
df_delivery_raw.to_csv(os.path.join(RAW_DIR, "delivery.csv"), index=False)
print(f"Delivery saved to raw/delivery.csv ({len(df_delivery_raw)} rows)")

# Returns anomalies:
# 1. Duplicate return records (~50 rows)
dup_returns = df_returns.sample(50, random_state=SEED).copy()

# 2. Missing return reasons (~60 rows)
missing_reasons = df_returns.sample(60, random_state=SEED+7).index
for idx in missing_reasons:
    df_returns.at[idx, "return_reason"] = None

# 3. Inconsistent casing in return reason
reason_casing = df_returns.sample(100, random_state=SEED+8).index
for idx in reason_casing[:50]:
    df_returns.at[idx, "return_reason"] = str(df_returns.at[idx, "return_reason"]).lower()
for idx in reason_casing[50:]:
    df_returns.at[idx, "return_reason"] = str(df_returns.at[idx, "return_reason"]).upper()

df_returns_raw = pd.concat([df_returns, dup_returns], ignore_index=True)
df_returns_raw.to_csv(os.path.join(RAW_DIR, "returns.csv"), index=False)
print(f"Returns saved to raw/returns.csv ({len(df_returns_raw)} rows)")

print("\nAll raw datasets generated successfully in data/raw/!")
