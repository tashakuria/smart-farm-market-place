from faker import Faker
from random import randint, choice, uniform
from app import app           # ensure app.py exposes 'app'
from models import db, User, Product, Order, OrderItem, ChatMessage

fake = Faker()

def run_seed():
    with app.app_context():
        db.drop_all()
        db.create_all()

        # ----- Users -----
        farmers = []
        buyers = []
        for _ in range(5):
            farmer = User(
                username=fake.user_name(),
                email=fake.unique.email(),
                user_type="farmer",
                farm_name=fake.company(),
                location=fake.city()
            )
            farmer.set_password("password")
            farmers.append(farmer)

        for _ in range(5):
            buyer = User(
                username=fake.user_name(),
                email=fake.unique.email(),
                user_type="buyer"
            )
            buyer.set_password("password")
            buyers.append(buyer)

        db.session.add_all(farmers + buyers)
        db.session.commit()

        # ----- Products -----
        products = []
        
        # Realistic agricultural products with proper images
        product_data = [
            {"name": "Fresh Tomatoes", "category": "vegetables", "price": 45, "image": "https://images.unsplash.com/photo-1546470427-e5d491d7e4b8?w=400&h=300&fit=crop"},
            {"name": "Organic Carrots", "category": "vegetables", "price": 35, "image": "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=300&fit=crop"},
            {"name": "Sweet Bananas", "category": "fruits", "price": 25, "image": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop"},
            {"name": "Fresh Avocados", "category": "fruits", "price": 80, "image": "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=300&fit=crop"},
            {"name": "Green Spinach", "category": "vegetables", "price": 30, "image": "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop"},
            {"name": "Red Apples", "category": "fruits", "price": 60, "image": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=300&fit=crop"},
            {"name": "White Maize", "category": "grains", "price": 40, "image": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=300&fit=crop"},
            {"name": "Fresh Milk", "category": "dairy", "price": 55, "image": "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=300&fit=crop"},
            {"name": "Green Cabbage", "category": "vegetables", "price": 20, "image": "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?w=400&h=300&fit=crop"},
            {"name": "Sweet Oranges", "category": "fruits", "price": 50, "image": "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=300&fit=crop"},
            {"name": "Brown Beans", "category": "grains", "price": 65, "image": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop"},
            {"name": "Fresh Cheese", "category": "dairy", "price": 120, "image": "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=300&fit=crop"},
            {"name": "Green Peppers", "category": "vegetables", "price": 70, "image": "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=300&fit=crop"},
            {"name": "Sweet Mangoes", "category": "fruits", "price": 90, "image": "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=300&fit=crop"},
            {"name": "White Rice", "category": "grains", "price": 85, "image": "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop"}
        ]
        
        for i, data in enumerate(product_data):
            farmer = farmers[i % len(farmers)]  # Distribute products among farmers
            product = Product(
                name=data["name"],
                description=f"Fresh, high-quality {data['name'].lower()} directly from our farm. Grown with care using sustainable farming practices.",
                price=data["price"],
                category=data["category"],
                quantity=randint(50, 200),
                image_url=data["image"],
                farmer_id=farmer.id
            )
            products.append(product)

        db.session.add_all(products)
        db.session.commit()

        # ----- Orders & OrderItems -----
        orders = []
        for _ in range(10):
            buyer = choice(buyers)
            order = Order(
                buyer_id=buyer.id,
                total_amount=0.0,
                status=choice(["pending", "confirmed", "shipped", "delivered"]),
                mpesa_receipt=fake.bothify(text="MP####??"),
                phone_number=fake.msisdn()
            )
            db.session.add(order)
            db.session.commit()

            # Add 1–3 items per order
            total = 0
            for _ in range(randint(1, 3)):
                product = choice(products)
                qty = randint(1, 5)
                item_price = product.price
                total += qty * item_price
                db.session.add(OrderItem(
                    order_id=order.id,
                    product_id=product.id,
                    quantity=qty,
                    price=item_price
                ))
            order.total_amount = total
            orders.append(order)

        db.session.commit()

        # ----- Chat Messages -----
        for _ in range(20):
            sender = choice(farmers + buyers)
            receiver = choice([u for u in farmers + buyers if u.id != sender.id])
            db.session.add(ChatMessage(
                sender_id=sender.id,
                receiver_id=receiver.id,
                message=fake.sentence(),
                read=choice([True, False])
            ))

        db.session.commit()
        print("Database seeded with Faker successfully!")

if __name__ == "__main__":
    run_seed()