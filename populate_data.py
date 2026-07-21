import boto3
import uuid
from decimal import Decimal
from datetime import datetime

# ==============================
# CONFIG
# ==============================

REGION = "ap-southeast-1"

PRODUCT_TABLE = "danush_products_table"      # <-- change if needed
INVENTORY_TABLE = "danush_inventory"   # <-- change if needed

dynamodb = boto3.resource("dynamodb", region_name=REGION)

products_table = dynamodb.Table(PRODUCT_TABLE)
inventory_table = dynamodb.Table(INVENTORY_TABLE)

timestamp = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")

# ==============================
# PRODUCTS
# ==============================

products = [

# ---------------- MOBILES ----------------

("Mobiles","Samsung Galaxy S25 Ultra","Flagship Samsung smartphone",175000,"https://images.unsplash.com/photo-1610945265064-0e34e5519bbf"),
("Mobiles","iPhone 16 Pro Max","Latest Apple flagship",189000,"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9"),
("Mobiles","Google Pixel 10","AI powered Android phone",98000,"https://images.unsplash.com/photo-1598327105666-5b89351aff97"),
("Mobiles","Nothing Phone 3","Transparent premium smartphone",62000,"https://images.unsplash.com/photo-1580910051074-3eb694886505"),
("Mobiles","OnePlus 14","Fast flagship killer",72000,"https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5"),

# ---------------- LAPTOPS ----------------

("Laptops","MacBook Pro M5","Apple professional laptop",235000,"https://images.unsplash.com/photo-1496181133206-80ce9b88a853"),
("Laptops","Dell XPS 15","Premium Windows laptop",168000,"https://images.unsplash.com/photo-1498050108023-c5249f4df085"),
("Laptops","ASUS ROG Zephyrus G16","Gaming laptop",182000,"https://images.unsplash.com/photo-1517336714739-489689fd1ca8"),
("Laptops","Lenovo Legion Pro","High performance gaming laptop",165000,"https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2"),
("Laptops","HP Spectre x360","Convertible ultrabook",149000,"https://images.unsplash.com/photo-1515879218367-8466d910aaa4"),

# ---------------- PC ----------------

("PC & accessories","AMD Radeon RX 6600","Graphics Card",28000,"https://images.unsplash.com/photo-1591488320449-011701bb6704"),
("PC & accessories","RTX 5080","NVIDIA Graphics Card",119000,"https://images.unsplash.com/photo-1587202372775-e229f172b9d7"),
("PC & accessories","Ryzen 9 9950X","Desktop Processor",69000,"https://images.unsplash.com/photo-1587202372634-32705e3bf49c"),
("PC & accessories","Corsair 32GB DDR5","RAM Kit",13500,"https://images.unsplash.com/photo-1540829917886-91ab031b1764"),
("PC & accessories","Samsung 990 Pro 2TB","NVMe SSD",22000,"https://images.unsplash.com/photo-1593642532973-d31b6557fa68"),

# ---------------- GAMING ----------------

("Gaming","PlayStation 5 Pro","Latest Sony console",40000,"https://images.unsplash.com/photo-1606813907291-d86efa9b94db"),
("Gaming","Xbox Series X","Microsoft gaming console",52000,"https://images.unsplash.com/photo-1621259182978-fbf93132d53d"),
("Gaming","Nintendo Switch OLED","Portable gaming console",31000,"https://images.unsplash.com/photo-1578303512597-81e6cc155b3e"),
("Gaming","DualSense Controller","PS5 Wireless Controller",6500,"https://images.unsplash.com/photo-1612287230202-1ff1d85d1bdf"),
("Gaming","Logitech G Pro X","Gaming Headset",12500,"https://images.unsplash.com/photo-1546435770-a3e426bf472b"),

# ---------------- AUDIO ----------------

("Audio","Sony WH-1000XM6","Noise cancelling headphones",34000,"https://images.unsplash.com/photo-1505740420928-5e560c06d30e"),
("Audio","AirPods Pro 3","Apple wireless earbuds",28000,"https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46"),
("Audio","JBL Flip 7","Portable Bluetooth speaker",12500,"https://images.unsplash.com/photo-1589003077984-894e133dabab"),
("Audio","Marshall Emberton","Portable speaker",18000,"https://images.unsplash.com/photo-1546435770-a3e426bf472b"),

# ---------------- WEARABLES ----------------

("Wearables","Apple Watch Ultra 3","Premium smartwatch",92000,"https://images.unsplash.com/photo-1434494878577-86c23bcb06b9"),
("Wearables","Galaxy Watch 8","Samsung smartwatch",48000,"https://images.unsplash.com/photo-1523275335684-37898b6baf30"),
("Wearables","Fitbit Charge 7","Fitness tracker",16000,"https://images.unsplash.com/photo-1579586337278-3befd40fd17a"),

# ---------------- CAMERA ----------------

("Cameras","Canon EOS R8","Mirrorless Camera",145000,"https://images.unsplash.com/photo-1516035069371-29a1b244cc32"),
("Cameras","Sony A7 IV","Professional camera",238000,"https://images.unsplash.com/photo-1502920917128-1aa500764ce7"),

# ---------------- BEAUTY ----------------

("Beauty products","Himalaya Face Wash","Daily face wash",200,"https://images.unsplash.com/photo-1625772452859-1c03d5bf1137"),
("Beauty products","Nivea Men Face Wash","Oil control",350,"https://images.unsplash.com/photo-1556228578-8c89e6adf883"),
("Beauty products","Cetaphil Cleanser","Skin cleanser",750,"https://images.unsplash.com/photo-1620916566398-39f1143ab7be"),

# ---------------- HOME ----------------

("Home Appliances","Dyson V15 Vacuum","Cordless vacuum cleaner",62000,"https://images.unsplash.com/photo-1581578731548-c64695cc6952"),
("Home Appliances","LG Smart AC","1.5 Ton Inverter AC",58000,"https://images.unsplash.com/photo-1581092335397-9583eb92d232"),
("Home Appliances","Philips Air Fryer","Healthy cooking",9500,"https://images.unsplash.com/photo-1585515656763-75e6a94f28f2"),
]

# ==============================
# INSERT
# ==============================

print("Seeding database...\n")

count = 0

for category, name, desc, price, image in products:

    pid = "PROD-" + uuid.uuid4().hex

    stock = 50
    reserved = 0
    available = stock - reserved

    products_table.put_item(
        Item={
            "product_id": pid,
            "category": category,
            "created_at": timestamp,
            "description": desc,
            "image_url": image,
            "is_active": True,
            "name": name,
            "price": Decimal(str(price)),
            "updated_at": timestamp,
        }
    )

    inventory_table.put_item(
        Item={
            "product_id": pid,
            "stock": stock,
            "reserved": reserved,
            "available": available,
            "updated_at": timestamp,
        }
    )

    count += 1
    print(f"Inserted {name}")

print("\n=================================")
print(f"Products Inserted : {count}")
print(f"Inventory Inserted: {count}")
print("Done.")
print("=================================")