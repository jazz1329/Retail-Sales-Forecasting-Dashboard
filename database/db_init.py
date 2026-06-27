import sys
import os
import random
import numpy as np
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

# Add backend root to path so 'app' is importable
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "backend"))

from app.database import Base, engine, SessionLocal
from app.auth import get_password_hash
from app.models import User, Category, Product, Store, Customer, Order, OrderItem
from app.forecaster import RetailForecaster

def create_tables():
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully.")

def seed_database(db: Session):
    print("Seeding database with full production schema requirements...")
    
    # 1. Seed Users (Admin, Manager, Viewer)
    users = [
        User(
            email="admin@retail.com",
            password_hash=get_password_hash("adminpassword"),
            full_name="Alice Johnson (Admin)",
            role="Admin"
        ),
        User(
            email="manager@retail.com",
            password_hash=get_password_hash("managerpassword"),
            full_name="Bob Smith (Manager)",
            role="Manager"
        ),
        User(
            email="viewer@retail.com",
            password_hash=get_password_hash("viewerpassword"),
            full_name="Charlie Brown (Viewer)",
            role="Viewer"
        )
    ]
    for u in users:
        if not db.query(User).filter(User.email == u.email).first():
            db.add(u)
    db.commit()
    print("Users seeded.")

    # 2. Seed 10 Categories
    categories_data = [
        ("Electronics", "Smartphones, TVs, Laptops, Accessories"),
        ("Furniture", "Office Chairs, Desks, Sofas, Patio Sets"),
        ("Office Supplies", "Paper, Pens, Organizers, Binders"),
        ("Apparel", "Hoodies, Jeans, Sneakers, T-Shirts"),
        ("Groceries", "Organic Coffee, Tea, Snacks, Beverages"),
        ("Fitness & Sports", "Treadmills, Dumbbells, Yoga Mats, Activewear"),
        ("Books & Media", "Fiction, Textbooks, Biographies, Notebooks"),
        ("Toys & Games", "Board Games, Action Figures, Dolls, Puzzles"),
        ("Beauty & Personal Care", "Skincare, Makeup, Perfume, Hair Care"),
        ("Home & Kitchen", "Blenders, Cookware, Coffee Makers, Dinnerware")
    ]
    
    categories = []
    for name, desc in categories_data:
        cat = db.query(Category).filter(Category.name == name).first()
        if not cat:
            cat = Category(name=name, description=desc)
            db.add(cat)
            db.commit()
            db.refresh(cat)
        categories.append(cat)
    print(f"Categories seeded: {len(categories)}")

    # 3. Seed 100 Products (10 per category)
    products_data = [
        # Electronics (1-10)
        ("Flagship Smartphone", "Electronics", 799.99, 450.00, "ELEC-SMP-01", 120, 15, "Premium OLED screen smartphone"),
        ("4K Smart TV 55-inch", "Electronics", 499.99, 280.00, "ELEC-TV4K-02", 45, 10, "Ultra HD smart LED TV"),
        ("Noise Cancelling Headphones", "Electronics", 199.99, 90.00, "ELEC-NCH-03", 85, 15, "Wireless over-ear headphones"),
        ("Dual-Band Wi-Fi Router", "Electronics", 89.99, 40.00, "ELEC-WFR-04", 150, 20, "High-speed gigabit router"),
        ("Pro Gaming Mouse", "Electronics", 69.99, 30.00, "ELEC-GMS-05", 130, 25, "Wired ergonomic mouse"),
        ("Mechanical Keyboard", "Electronics", 129.99, 60.05, "ELEC-MKB-06", 110, 15, "RGB backlit keyboard"),
        ("FHD Webcam 1080p", "Electronics", 59.99, 25.00, "ELEC-WBC-07", 140, 20, "USB camera with microphone"),
        ("External Hard Drive 2TB", "Electronics", 89.99, 45.00, "ELEC-EHD-08", 160, 25, "Portable USB 3.0 storage"),
        ("Bluetooth Smart Speaker", "Electronics", 49.99, 20.00, "ELEC-BSS-09", 180, 30, "Voice controlled speaker"),
        ("Wireless Charging Pad", "Electronics", 29.99, 12.00, "ELEC-WCP-10", 220, 40, "Fast Qi-compatible charger"),

        # Furniture (11-20)
        ("Ergonomic Office Chair", "Furniture", 249.99, 110.00, "FURN-EOC-01", 60, 12, "Mesh back adjustable chair"),
        ("L-Shaped Wooden Desk", "Furniture", 349.99, 160.00, "FURN-LWD-02", 25, 8, "Spacious oak finish corner desk"),
        ("Fabric Sectional Sofa", "Furniture", 899.99, 450.00, "FURN-FSS-03", 15, 5, "Grey 3-seater living room couch"),
        ("Patio Outdoor Dining Set", "Furniture", 599.99, 300.00, "FURN-PDS-04", 18, 5, "Weatherproof table and chairs"),
        ("Wooden Bookshelf 5-Tier", "Furniture", 119.99, 50.00, "FURN-WBS-05", 40, 10, "Sturdy pine display shelving"),
        ("Metal Bar Stool", "Furniture", 49.99, 20.00, "FURN-MBS-06", 80, 15, "Industrial counter stool"),
        ("Glass Coffee Table", "Furniture", 159.99, 70.00, "FURN-GCT-07", 30, 8, "Modern living room table"),
        ("Bedside Nightstand Drawer", "Furniture", 79.99, 32.00, "FURN-BNS-08", 75, 12, "Oak veneer bedroom storage"),
        ("Bean Bag Lounger", "Furniture", 89.99, 35.00, "FURN-BBL-09", 90, 15, "Comfortable memory foam fill"),
        ("Floor Standing Mirror", "Furniture", 139.99, 60.00, "FURN-FSM-10", 22, 6, "Full-length aluminum frame"),

        # Office Supplies (21-30)
        ("Recycled Printer Paper Case", "Office Supplies", 45.00, 20.00, "OFF-RPP-01", 200, 30, "10 reams A4 copy paper"),
        ("Gel Ink Pens 20-Pack", "Office Supplies", 14.99, 5.00, "OFF-GIP-02", 350, 40, "Smooth writing black gel pens"),
        ("Desktop Organizer Tray", "Office Supplies", 24.99, 10.00, "OFF-DOT-03", 95, 15, "3-tier steel mesh organizer"),
        ("Heavy Duty Stapler", "Office Supplies", 19.99, 8.00, "OFF-HDS-04", 110, 10, "Staples up to 50 sheets"),
        ("Dry Erase Whiteboard", "Office Supplies", 39.99, 15.00, "OFF-DEW-05", 85, 12, "Magnetic dry erase board"),
        ("Desktop Calculator", "Office Supplies", 12.99, 4.00, "OFF-DTC-06", 160, 20, "12-digit solar powered display"),
        ("Highlighter Marker 6-Pack", "Office Supplies", 5.99, 2.00, "OFF-HLM-07", 400, 50, "Chisel tip fluorescent colors"),
        ("Sticky Notes Cube", "Office Supplies", 8.99, 3.00, "OFF-SNC-08", 450, 60, "Yellow self-stick pads"),
        ("Steel Scissors 2-Pack", "Office Supplies", 9.99, 3.50, "OFF-STS-09", 180, 25, "Stainless steel multi-purpose"),
        ("Paper Shredder cross-cut", "Office Supplies", 69.99, 30.00, "OFF-PSC-10", 55, 8, "Credit card and paper shredder"),

        # Apparel (31-40)
        ("Premium Cotton Hoodie", "Apparel", 59.99, 22.00, "APP-PCH-01", 140, 20, "Unisex fleece-lined hoodie"),
        ("Relaxed Fit Denim Jeans", "Apparel", 49.99, 18.00, "APP-RFJ-02", 115, 20, "Classic indigo denim jeans"),
        ("Lightweight Athletic Sneakers", "Apparel", 79.99, 32.00, "APP-LAS-03", 90, 15, "Breathable running shoes"),
        ("Pack of 5 Cotton T-Shirts", "Apparel", 29.99, 10.00, "APP-CTS-04", 250, 35, "Crew neck multi-color tees"),
        ("Waterproof Winter Parka", "Apparel", 149.99, 65.00, "APP-WWP-05", 40, 10, "Insulated cold weather coat"),
        ("Leather Dress Belt", "Apparel", 34.99, 12.00, "APP-LDB-06", 150, 25, "Reversible black and brown leather"),
        ("Wool Knit Beanie Hat", "Apparel", 19.99, 7.00, "APP-WKB-07", 190, 30, "Warm ribbed thermal hat"),
        ("Running Athletic Shorts", "Apparel", 24.99, 9.00, "APP-RAS-08", 175, 25, "Quick-dry workout shorts"),
        ("Smart Casual Blazer", "Apparel", 89.99, 38.00, "APP-SCB-09", 50, 10, "Structured lightweight blazer"),
        ("Cotton Crew Socks 6-Pack", "Apparel", 15.99, 5.00, "APP-CCS-10", 300, 45, "Cushioned sports support socks"),

        # Groceries (41-50)
        ("Dark Roast Organic Coffee", "Groceries", 15.99, 6.50, "GRO-DRC-01", 180, 25, "1lb whole bean arabica"),
        ("Matcha Green Tea Powder", "Groceries", 18.99, 8.00, "GRO-MGT-02", 130, 20, "Ceremonial grade organic matcha"),
        ("Assorted Protein Bars 12-Pack", "Groceries", 22.99, 10.50, "GRO-APB-03", 160, 25, "High protein energy snack bars"),
        ("Cold Brew Concentrate 32oz", "Groceries", 9.99, 4.00, "GRO-CBC-04", 110, 15, "Unsweetened double strength brew"),
        ("Organic Raw Almonds 1lb", "Groceries", 12.99, 5.50, "GRO-ORA-05", 140, 20, "Non-GMO unsalted raw nuts"),
        ("Virgin Coconut Oil 16oz", "Groceries", 14.99, 6.00, "GRO-VCO-06", 120, 15, "Cold-pressed organic oil"),
        ("Gluten-Free Granola", "Groceries", 6.99, 2.50, "GRO-GFG-07", 150, 25, "Honey oat and seed clusters"),
        ("Himalayan Pink Salt Grinder", "Groceries", 5.99, 2.00, "GRO-HPS-08", 220, 30, "Pure mineral table salt crystals"),
        ("Assorted Herbal Tea Sampler", "Groceries", 11.99, 4.50, "GRO-ATS-09", 165, 20, "Box of 40 caffeine-free bags"),
        ("Organic Quinoa 2lb Bag", "Groceries", 8.99, 3.20, "GRO-OQ-10", 135, 18, "Whole grain high-fiber superfood"),

        # Fitness & Sports (51-60)
        ("Adjustable Dumbbells Set", "Fitness & Sports", 299.99, 140.00, "FIT-ADB-01", 35, 8, "Weight dial adjustable plates"),
        ("Eco Yoga Mat 6mm", "Fitness & Sports", 39.99, 16.00, "FIT-EYM-02", 110, 20, "Non-slip alignment lines TPE"),
        ("Resistance Band Kit 5pc", "Fitness & Sports", 24.99, 9.50, "FIT-RBK-03", 240, 35, "Latex bands with foam handles"),
        ("High-Speed Jump Rope", "Fitness & Sports", 14.99, 5.00, "FIT-HJR-04", 300, 40, "Ball bearing steel cable rope"),
        ("Foam Massage Roller", "Fitness & Sports", 22.99, 8.50, "FIT-FMR-05", 150, 25, "High density grid muscle release"),
        ("Stainless Gym Flask 32oz", "Fitness & Sports", 27.99, 11.00, "FIT-SGF-06", 180, 30, "Vacuum double wall insulated"),
        ("Sports Gym Duffle Bag", "Fitness & Sports", 45.00, 18.00, "FIT-SGD-07", 85, 15, "Wet pocket shoe compartment"),
        ("Active Sport Smartwatch", "Fitness & Sports", 179.99, 80.00, "FIT-ASS-08", 65, 12, "Heart rate and GPS tracker"),
        ("Kettlebell Cast Iron 25lb", "Fitness & Sports", 49.99, 22.00, "FIT-KCI-09", 70, 15, "Ergonomic wide grip handle"),
        ("Pull-Up Doorway Bar", "Fitness & Sports", 34.99, 13.50, "FIT-PDB-10", 90, 18, "Heavy-duty screw-free frame"),

        # Books & Media (61-70)
        ("Hardcover Sci-Fi Novel", "Books & Media", 26.99, 10.00, "BKM-HSN-01", 120, 20, "Award-winning galactic odyssey"),
        ("Financial Freedom Guide", "Books & Media", 19.99, 7.50, "BKM-FFG-02", 140, 25, "Personal money management rules"),
        ("Classic Literature Boxset", "Books & Media", 59.99, 24.00, "BKM-CLB-03", 45, 10, "5 leatherette pocket editions"),
        ("Premium Sketchbook A4", "Books & Media", 14.99, 5.50, "BKM-PSA-04", 175, 30, "160gsm heavy cartridge sheets"),
        ("Intro to Python Programming", "Books & Media", 44.99, 18.00, "BKM-IPP-05", 95, 15, "Hands-on data analytics coursebook"),
        ("Self-Improvement Guide", "Books & Media", 16.99, 6.00, "BKM-SIG-06", 150, 25, "Building habits atomic rules"),
        ("Gourmet Cooking Guide", "Books & Media", 29.99, 12.00, "BKM-GCG-07", 80, 15, "100 recipes from world chefs"),
        ("Kids Picture Book Board", "Books & Media", 9.99, 3.50, "BKM-KPB-08", 220, 35, "Colorful thick toddler pages"),
        ("History World Atlas Map", "Books & Media", 49.99, 20.00, "BKM-HWA-09", 55, 10, "Detailed political and physical maps"),
        ("Daily Bullet Journal Agenda", "Books & Media", 18.99, 7.00, "BKM-DBJ-10", 160, 25, "Dotted grid organizer planner"),

        # Toys & Games (71-80)
        ("Classic Wooden Chessboard", "Toys & Games", 39.99, 15.00, "TOY-WCB-01", 90, 15, "Handcrafted folding board and pieces"),
        ("Cooperative Strategy Boardgame", "Toys & Games", 49.99, 21.00, "TOY-CSB-02", 70, 12, "Sci-fi space colony scenario"),
        ("Action Robot Figurine", "Toys & Games", 24.99, 9.00, "TOY-ARF-03", 150, 25, "12-inch mechanical battle robot"),
        ("Plush Bear 15-inch", "Toys & Games", 19.99, 7.50, "TOY-PBE-04", 130, 20, "Soft eco-friendly filled cotton"),
        ("Kids Building Bricks Tub", "Toys & Games", 34.99, 14.00, "TOY-KBB-05", 110, 15, "800 pieces colorful shapes set"),
        ("Family Card Game Deck", "Toys & Games", 14.99, 5.00, "TOY-FCG-06", 320, 40, "Fast-paced matching party game"),
        ("RC Stunt Car Rechargeable", "Toys & Games", 29.99, 12.50, "TOY-RCC-07", 115, 20, "360 rotation dual-sided drive"),
        ("Watercolor Art Painting Kit", "Toys & Games", 18.99, 7.00, "TOY-WAP-08", 140, 25, "36 paint pans and brush pad"),
        ("3D Globe Puzzle 500pc", "Toys & Games", 22.99, 9.00, "TOY-DGP-09", 100, 15, "Plastic locking curved pieces spherical"),
        ("Magic Tricks Learning Box", "Toys & Games", 27.99, 11.00, "TOY-MTL-10", 85, 15, "Props and guidebook for 50 illusions"),

        # Beauty & Personal Care (81-90)
        ("Hyaluronic Acid Serum", "Beauty & Personal Care", 24.99, 9.00, "BTY-HAS-01", 160, 30, "Intense moisture face skincare"),
        ("Organic Argan Hair Oil", "Beauty & Personal Care", 18.99, 7.50, "BTY-AHO-02", 145, 25, "Restore dry and damaged locks"),
        ("Hydrating Face Cream 50ml", "Beauty & Personal Care", 29.99, 11.50, "BTY-HFC-03", 130, 20, "Shea butter barrier support"),
        ("Mineral Sunscreen SPF50", "Beauty & Personal Care", 22.99, 9.00, "BTY-MSS-04", 190, 30, "Non-greasy zinc oxide defense"),
        ("Electric Sonic Toothbrush", "Beauty & Personal Care", 59.99, 25.00, "BTY-EST-05", 85, 12, "Rechargeable 5 cleaning modes"),
        ("Matte Lip Gloss Set 3pc", "Beauty & Personal Care", 19.99, 7.00, "BTY-MLG-06", 180, 25, "Long-lasting nude rose shades"),
        ("Natural Clay Face Mask", "Beauty & Personal Care", 14.99, 5.00, "BTY-NCM-07", 210, 35, "Pore detox bentonite scrub"),
        ("Men Grooming Beard Oil", "Beauty & Personal Care", 16.99, 6.50, "BTY-MGB-08", 125, 20, "Sandalwood extract moisturizer"),
        ("Sandalwood Bath Bombs 6pc", "Beauty & Personal Care", 21.99, 8.50, "BTY-SBB-09", 150, 25, "Essential oil fizzies set"),
        ("Exfoliating Body Scrub", "Beauty & Personal Care", 15.99, 6.00, "BTY-EBS-10", 170, 30, "Brown sugar and coconut polish"),

        # Home & Kitchen (91-100)
        ("Electric Blender 1000W", "Home & Kitchen", 89.99, 38.00, "KIT-ELB-01", 65, 10, "Ice crushing high speed smoothie"),
        ("Cast Iron Skillet 12-inch", "Home & Kitchen", 39.99, 16.50, "KIT-CIS-02", 110, 15, "Pre-seasoned heavy duty pan"),
        ("Drip Coffee Maker 12-Cup", "Home & Kitchen", 49.99, 21.00, "KIT-DCM-03", 80, 12, "Programmable digital brewing station"),
        ("Digital Food Weight Scale", "Home & Kitchen", 14.99, 5.00, "KIT-DFS-04", 250, 40, "Precision kitchen scale g/oz"),
        ("Stainless Steel Kettle 1.7L", "Home & Kitchen", 34.99, 14.50, "KIT-SSK-05", 140, 25, "Auto shutoff cordless kettle"),
        ("Ceramic Nonstick Cookware Set", "Home & Kitchen", 129.99, 55.00, "KIT-CNC-06", 40, 10, "8-piece fry pan and saucepots"),
        ("Salt & Pepper Wood Mills", "Home & Kitchen", 24.99, 9.00, "KIT-SPM-07", 130, 20, "Ceramic grinder adjustable coarse"),
        ("Insulated Lunch Box Tote", "Home & Kitchen", 19.99, 7.50, "KIT-ILB-08", 190, 30, "Leakproof thermal food carrier"),
        ("Air Tight Food Storage 8pc", "Home & Kitchen", 27.99, 11.50, "KIT-AFS-09", 160, 25, "BPA free plastic cereal canisters"),
        ("Silicone Cooking Utensils 12pc", "Home & Kitchen", 29.99, 12.00, "KIT-SCU-10", 120, 20, "Wooden handle nonstick spatulas")
    ]

    products = []
    category_map = {c.name: c.id for c in categories}
    for name, cat_name, price, cost, sku, stock, reorder, desc in products_data:
        prod = db.query(Product).filter(Product.sku == sku).first()
        if not prod:
            prod = Product(
                name=name,
                category_id=category_map[cat_name],
                price=price,
                cost=cost,
                sku=sku,
                current_stock=stock,
                reorder_point=reorder,
                description=desc
            )
            db.add(prod)
            db.commit()
            db.refresh(prod)
        products.append(prod)
    print(f"Products seeded: {len(products)}")

    # 4. Seed 10 Stores
    stores_data = [
        ("East Metro Hub", "Boston", "East"),
        ("West Coast Flagship", "San Francisco", "West"),
        ("Midwest Distribution Store", "Chicago", "Central"),
        ("Southern Retail Center", "Houston", "South"),
        ("Pacific Northwest Hub", "Seattle", "West"),
        ("Mid-Atlantic Depot", "Philadelphia", "East"),
        ("Southeast Distribution", "Atlanta", "South"),
        ("Rocky Mountain Store", "Denver", "West"),
        ("Great Lakes Outlet", "Detroit", "Central"),
        ("Southwest Retail", "Phoenix", "West")
    ]
    
    stores = []
    for name, city, region in stores_data:
        store = db.query(Store).filter(Store.name == name).first()
        if not store:
            store = Store(name=name, city=city, region=region)
            db.add(store)
            db.commit()
            db.refresh(store)
        stores.append(store)
    print(f"Stores seeded: {len(stores)}")

    # 5. Seed 200 Customers
    first_names = ["Liam", "Olivia", "Noah", "Emma", "Oliver", "Ava", "Elijah", "Sophia", "James", "Isabella", 
                   "Benjamin", "Mia", "Lucas", "Charlotte", "Alexander", "Amelia", "Mason", "Harper", "Ethan", "Evelyn", 
                   "Daniel", "Abigail", "Matthew", "Emily", "Jackson", "Elizabeth", "Sebastian", "Sofia", "Henry", "Avery",
                   "William", "Aria", "Wyatt", "Chloe", "David", "Ella", "Carter", "Grace", "Jameson", "Lily"]
    last_names = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez",
                  "Hernandez", "Lopez", "Gonzalez", "Wilson", "Anderson", "Thomas", "Taylor", "Moore", "Jackson", "Martin",
                  "Lee", "Perez", "Thompson", "White", "Harris", "Sanchez", "Clark", "Ramirez", "Lewis", "Robinson"]
    
    segments = ["Consumer", "Corporate", "Home Office"]
    cities_regions = [
        ("Boston", "East"), ("New York", "East"), ("Philadelphia", "East"),
        ("San Francisco", "West"), ("Los Angeles", "West"), ("Seattle", "West"),
        ("Chicago", "Central"), ("Detroit", "Central"), ("Minneapolis", "Central"),
        ("Houston", "South"), ("Dallas", "South"), ("Miami", "South")
    ]

    random.seed(42) # Deterministic seeding

    customer_names = []
    seen_names = set()
    while len(customer_names) < 200:
        f = random.choice(first_names)
        l = random.choice(last_names)
        name = f"{f} {l}"
        if name not in seen_names:
            seen_names.add(name)
            customer_names.append((name, random.choice(segments)))

    customers = []
    for name, segment in customer_names:
        email = f"{name.lower().replace(' ', '.')}@example.com"
        cust = db.query(Customer).filter(Customer.email == email).first()
        if not cust:
            city, region = random.choice(cities_regions)
            cust = Customer(
                name=name,
                email=email,
                city=city,
                region=region,
                segment=segment
            )
            db.add(cust)
            db.commit()
            db.refresh(cust)
        customers.append(cust)
    print(f"Customers seeded: {len(customers)}")

    # 6. Seed Orders and OrderItems (2.5 years of seasonal historical data)
    # We want to guarantee at least 1000 orders and at least 3000 order items.
    existing_orders = db.query(Order).count()
    if existing_orders >= 1000:
        print(f"Orders already exists ({existing_orders} orders). Skipping order seeding.")
    else:
        print("Generating historical orders (This might take a moment to compute)...")
        # Truncate existing orders to ensure exact dataset requirements
        db.query(OrderItem).delete()
        db.query(Order).delete()
        db.commit()

        start_date = datetime(2024, 1, 1)
        end_date = datetime(2026, 6, 25)
        
        current_dt = start_date
        all_order_objects = []
        
        while current_dt <= end_date:
            day_of_week = current_dt.weekday()
            month = current_dt.month
            year = current_dt.year
            
            # Base probability of orders per day across stores (averaging ~1.8 orders per day)
            base_orders = 1.8
            
            # Seasonality modifiers
            if month in [11, 12]:
                seasonality_mod = 1.6
            elif month in [6, 7]:
                seasonality_mod = 1.2
            elif month == 1:
                seasonality_mod = 0.7
            else:
                seasonality_mod = 1.0
                
            # Weekday modifier (Saturdays & Sundays higher)
            if day_of_week in [5, 6]:
                weekday_mod = 1.4
            else:
                weekday_mod = 0.95
                
            year_mod = 1.0 + (year - 2024) * 0.12
            
            target_rate = base_orders * seasonality_mod * weekday_mod * year_mod
            num_orders = np.random.RandomState(current_dt.timetuple().tm_yday + year).poisson(target_rate)
            
            for _ in range(num_orders):
                cust = random.choice(customers)
                store = random.choice(stores)
                hour = random.randint(9, 21)
                minute = random.randint(0, 59)
                order_time = current_dt.replace(hour=hour, minute=minute)
                
                order = Order(
                    customer_id=cust.id,
                    store_id=store.id,
                    order_date=order_time,
                    status="Completed",
                    total_amount=0.0
                )
                
                # Pick 2 to 4 items per order to guarantee >= 3000 items easily
                num_items = random.choices([2, 3, 4], weights=[0.4, 0.4, 0.2])[0]
                selected_prods = random.sample(products, num_items)
                
                order_total = 0.0
                order_items = []
                for prod in selected_prods:
                    if prod.category.name in ["Groceries", "Office Supplies"]:
                        qty = random.choices([1, 2, 3, 5], weights=[0.4, 0.3, 0.2, 0.1])[0]
                    else:
                        qty = random.choices([1, 2], weights=[0.85, 0.15])[0]
                    
                    # Specific seasonal demand for products
                    if prod.sku == "FURN-PDS-04" and month in [4, 5, 6, 7, 8]:
                        qty *= 2
                    if prod.sku == "ELEC-TV4K-02" and month in [11, 12]:
                        qty *= 2
                        
                    price = prod.price
                    item_total = qty * price
                    order_total += item_total
                    
                    order_items.append(
                        OrderItem(
                            product_id=prod.id,
                            quantity=qty,
                            unit_price=price
                        )
                    )
                
                order.total_amount = order_total
                order.order_items = order_items
                all_order_objects.append(order)
            
            current_dt += timedelta(days=1)
            
        print(f"Inserting {len(all_order_objects)} orders and their items into database...")
        # Save in chunks
        chunk_size = 300
        for i in range(0, len(all_order_objects), chunk_size):
            db.add_all(all_order_objects[i:i+chunk_size])
            db.commit()
            
        # Count items
        total_items_count = db.query(OrderItem).count()
        print(f"Historical orders seeded: {len(all_order_objects)} orders, {total_items_count} items.")

    # 7. Run initial ML forecasting pipeline to populate forecasts & evaluations!
    print("Running initial Machine Learning forecasting pipeline...")
    forecaster = RetailForecaster(db)
    result = forecaster.run_pipeline(horizon_days=90)
    if result["success"]:
        print(f"ML Pipeline executed successfully. Forecasted items count: {result['forecasts_count']}. Evaluation metrics: {result['metrics']}")
    else:
        print(f"ML Pipeline failed during seeding: {result.get('error')}")

if __name__ == "__main__":
    create_tables()
    db_session = SessionLocal()
    try:
        seed_database(db_session)
        print("Database initialization and seeding completed successfully!")
    finally:
        db_session.close()
