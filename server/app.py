from flask import Flask, request, jsonify
from flask_cors import CORS
from models import db, User, Product, Order, OrderItem, ChatMessage, Review
from config import Config
from flask_migrate import Migrate

import jwt
import datetime
from functools import wraps

app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)
CORS(app)
migrate = Migrate(app, db)



# JWT authentication decorator
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token is missing!'}), 401
        
        try:
            data = jwt.decode(token.split()[1], app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.get(data['user_id'])
        except:
            return jsonify({'message': 'Token is invalid!'}), 401
            
        return f(current_user, *args, **kwargs)
        
    return decorated

# User Registration
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Username already exists'}), 400
        
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already exists'}), 400
        
    user = User(
        username=data['username'],
        email=data['email'],
        user_type=data['user_type']
    )
    
    if data['user_type'] == 'farmer':
        user.farm_name = data.get('farm_name')
        user.location = data.get('location')
    
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, app.config['SECRET_KEY'])
    
    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'user_type': user.user_type,
            'farm_name': user.farm_name,
            'location': user.location
        }
    }), 201

# User Login
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(username=data['username']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'message': 'Invalid credentials'}), 401
        
    token = jwt.encode({
        'user_id': user.id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=24)
    }, app.config['SECRET_KEY'])
    
    return jsonify({
        'token': token,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'user_type': user.user_type,
            'farm_name': user.farm_name,
            'location': user.location
        }
    }), 200

# Get all products with filtering
@app.route('/api/products', methods=['GET'])
def get_products():
    category = request.args.get('category')
    farmer_id = request.args.get('farmer_id')
    search = request.args.get('search')
    
    query = Product.query
    
    if category:
        query = query.filter_by(category=category)
    if farmer_id:
        query = query.filter_by(farmer_id=farmer_id)
    if search:
        query = query.filter(Product.name.ilike(f'%{search}%'))
        
    products = query.all()
    
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'description': p.description,
        'price': p.price,
        'category': p.category,
        'quantity': p.quantity,
        'image_url': p.image_url,
        'farmer_id': p.farmer_id,
        'farmer_name': p.farmer.username,
        'farm_name': p.farmer.farm_name
    } for p in products]), 200

# Create a new product
@app.route('/api/products', methods=['POST'])
@token_required
def create_product(current_user):
    if current_user.user_type != 'farmer':
        return jsonify({'message': 'Only farmers can create products'}), 403
        
    data = request.get_json()
    
    product = Product(
        name=data['name'],
        description=data.get('description', ''),
        price=data['price'],
        category=data.get('category', ''),
        quantity=data.get('quantity', 0),
        image_url=data.get('image_url', ''),
        farmer_id=current_user.id
    )
    
    db.session.add(product)
    db.session.commit()
    
    return jsonify({
        'id': product.id,
        'name': product.name,
        'description': product.description,
        'price': product.price,
        'category': product.category,
        'quantity': product.quantity,
        'image_url': product.image_url,
        'farmer_id': product.farmer_id
    }), 201

# Get a specific product
@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    product = Product.query.get_or_404(product_id)
    
    return jsonify({
        'id': product.id,
        'name': product.name,
        'description': product.description,
        'price': product.price,
        'category': product.category,
        'quantity': product.quantity,
        'image_url': product.image_url,
        'farmer_id': product.farmer_id,
        'farmer_name': product.farmer.username,
        'farm_name': product.farmer.farm_name
    }), 200

# Update a product
@app.route('/api/products/<int:product_id>', methods=['PUT'])
@token_required
def update_product(current_user, product_id):
    product = Product.query.get_or_404(product_id)
    
    if product.farmer_id != current_user.id:
        return jsonify({'message': 'You can only update your own products'}), 403
        
    data = request.get_json()
    
    if 'name' in data:
        product.name = data['name']
    if 'description' in data:
        product.description = data['description']
    if 'price' in data:
        product.price = data['price']
    if 'category' in data:
        product.category = data['category']
    if 'quantity' in data:
        product.quantity = data['quantity']
    if 'image_url' in data:
        product.image_url = data['image_url']
        
    db.session.commit()
    
    return jsonify({
        'id': product.id,
        'name': product.name,
        'description': product.description,
        'price': product.price,
        'category': product.category,
        'quantity': product.quantity,
        'image_url': product.image_url,
        'farmer_id': product.farmer_id
    }), 200

# Delete a product
@app.route('/api/products/<int:product_id>', methods=['DELETE'])
@token_required
def delete_product(current_user, product_id):
    product = Product.query.get_or_404(product_id)
    
    if product.farmer_id != current_user.id:
        return jsonify({'message': 'You can only delete your own products'}), 403
        
    db.session.delete(product)
    db.session.commit()
    
    return jsonify({'message': 'Product deleted successfully'}), 200

# Create an order
@app.route('/api/orders', methods=['POST'])
@token_required
def create_order(current_user):
    # Both buyers and farmers can place orders
    # (farmers might want to buy from other farmers)
    if current_user.user_type not in ['buyer', 'farmer']:
        return jsonify({'message': 'Invalid user type for placing orders'}), 403
        
    data = request.get_json()
    
    # Calculate total amount
    total_amount = 0
    order_items = []
    
    for item in data['items']:
        product = Product.query.get(item['product_id'])
        if not product:
            return jsonify({'message': f"Product {item['product_id']} not found"}), 404
            
        if product.quantity < item['quantity']:
            return jsonify({'message': f"Insufficient quantity for {product.name}"}), 400
            
        total_amount += product.price * item['quantity']
        
        # Reduce product quantity
        product.quantity -= item['quantity']
        
        order_items.append(OrderItem(
            product_id=item['product_id'],
            quantity=item['quantity'],
            price=product.price
        ))
    
    # Create order
    order = Order(
        buyer_id=current_user.id,
        total_amount=total_amount,
        phone_number=data['phone_number']
    )
    
    for item in order_items:
        order.items.append(item)
    
    db.session.add(order)
    db.session.commit()
    
    # For now, skip M-Pesa integration and mark order as pending
    order.status = 'pending'
    
    return jsonify({
        'order_id': order.id,
        'message': 'Order placed successfully',
        'status': order.status,
        'total_amount': total_amount
    }), 201

# Get orders
@app.route('/api/orders', methods=['GET'])
@token_required
def get_orders(current_user):
    if current_user.user_type == 'farmer':
        # Farmers see orders for their products
        orders = Order.query.join(OrderItem).join(Product).filter(Product.farmer_id == current_user.id).all()
    else:
        # Buyers see their own orders
        orders = Order.query.filter_by(buyer_id=current_user.id).all()
    
    return jsonify([{
        'id': o.id,
        'buyer_id': o.buyer_id,
        'buyer_name': o.buyer.username,
        'total_amount': o.total_amount,
        'status': o.status,
        'created_at': o.created_at.isoformat(),
        'mpesa_receipt': o.mpesa_receipt,
        'items': [{
            'id': item.id,
            'product_id': item.product_id,
            'product_name': item.product.name,
            'quantity': item.quantity,
            'price': item.price
        } for item in o.items]
    } for o in orders]), 200

# Get a specific order
@app.route('/api/orders/<int:order_id>', methods=['GET'])
@token_required
def get_order(current_user, order_id):
    order = Order.query.get_or_404(order_id)
    
    # Check if user has access to this order
    if current_user.user_type == 'buyer' and order.buyer_id != current_user.id:
        return jsonify({'message': 'Access denied'}), 403
        
    if current_user.user_type == 'farmer':
        # Check if any product in the order belongs to this farmer
        farmer_products = any(item.product.farmer_id == current_user.id for item in order.items)
        if not farmer_products:
            return jsonify({'message': 'Access denied'}), 403
    
    return jsonify({
        'id': order.id,
        'buyer_id': order.buyer_id,
        'buyer_name': order.buyer.username,
        'total_amount': order.total_amount,
        'status': order.status,
        'created_at': order.created_at.isoformat(),
        'mpesa_receipt': order.mpesa_receipt,
        'items': [{
            'id': item.id,
            'product_id': item.product_id,
            'product_name': item.product.name,
            'quantity': item.quantity,
            'price': item.price,
            'farmer_id': item.product.farmer_id,
            'farmer_name': item.product.farmer.username
        } for item in order.items]
    }), 200

# Update order status
@app.route('/api/orders/<int:order_id>', methods=['PUT'])
@token_required
def update_order(current_user, order_id):
    order = Order.query.get_or_404(order_id)
    
    # Only farmers can update order status for their products
    if current_user.user_type != 'farmer':
        return jsonify({'message': 'Only farmers can update order status'}), 403
        
    # Check if any product in the order belongs to this farmer
    farmer_products = any(item.product.farmer_id == current_user.id for item in order.items)
    if not farmer_products:
        return jsonify({'message': 'You can only update orders for your products'}), 403
    
    data = request.get_json()
    
    if 'status' in data:
        order.status = data['status']
        
    db.session.commit()
    
    return jsonify({
        'id': order.id,
        'status': order.status
    }), 200

# MPesa callback endpoint
@app.route('/api/mpesa-callback', methods=['POST'])
def mpesa_callback():
    data = request.get_json()
    
    # Extract order ID from account reference
    try:
        callback_metadata = data['Body']['stkCallback']['CallbackMetadata']['Item']
        account_reference = next(item['Value'] for item in callback_metadata if item.get('Name') == 'AccountReference')
        order_id = int(account_reference.replace('ORDER', ''))
        
        # Find the order
        order = Order.query.get(order_id)
        if not order:
            return jsonify({'message': 'Order not found'}), 404
            
        # Update order status and MPesa receipt
        order.status = 'confirmed'
        mpesa_receipt = next(item['Value'] for item in callback_metadata if item.get('Name') == 'MpesaReceiptNumber')
        order.mpesa_receipt = mpesa_receipt
        
        db.session.commit()
        
        return jsonify({'message': 'Callback processed successfully'}), 200
    except Exception as e:
        app.logger.error(f"Error processing MPesa callback: {e}")
        return jsonify({'message': 'Error processing callback'}), 400

# Get chat messages between users
@app.route('/api/chat/<int:other_user_id>', methods=['GET'])
@token_required
def get_chat_messages(current_user, other_user_id):
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    
    messages = ChatMessage.query.filter(
        ((ChatMessage.sender_id == current_user.id) & (ChatMessage.receiver_id == other_user_id)) |
        ((ChatMessage.sender_id == other_user_id) & (ChatMessage.receiver_id == current_user.id))
    ).order_by(ChatMessage.timestamp.desc()).paginate(page=page, per_page=per_page, error_out=False)
    
    return jsonify({
        'messages': [{
            'id': m.id,
            'sender_id': m.sender_id,
            'receiver_id': m.receiver_id,
            'message': m.message,
            'timestamp': m.timestamp.isoformat(),
            'read': m.read
        } for m in messages.items],
        'total': messages.total,
        'pages': messages.pages,
        'current_page': page
    }), 200

# Send a chat message
@app.route('/api/chat/<int:receiver_id>', methods=['POST'])
@token_required
def send_chat_message(current_user, receiver_id):
    data = request.get_json()
    
    # Check if receiver exists
    receiver = User.query.get(receiver_id)
    if not receiver:
        return jsonify({'message': 'Receiver not found'}), 404
        
    chat_message = ChatMessage(
        sender_id=current_user.id,
        receiver_id=receiver_id,
        message=data['message']
    )
    
    db.session.add(chat_message)
    db.session.commit()
    
    return jsonify({
        'id': chat_message.id,
        'sender_id': chat_message.sender_id,
        'receiver_id': chat_message.receiver_id,
        'message': chat_message.message,
        'timestamp': chat_message.timestamp.isoformat(),
        'read': chat_message.read
    }), 201

# Mark messages as read
@app.route('/api/chat/mark-read', methods=['POST'])
@token_required
def mark_messages_as_read(current_user):
    data = request.get_json()
    sender_id = data.get('sender_id')
    
    # Mark all unread messages from this sender as read
    unread_messages = ChatMessage.query.filter_by(
        sender_id=sender_id,
        receiver_id=current_user.id,
        read=False
    ).all()
    
    for message in unread_messages:
        message.read = True
        
    db.session.commit()
    
    return jsonify({'message': 'Messages marked as read'}), 200

# Get all users (for chat initialization)
@app.route('/api/users', methods=['GET'])
@token_required
def get_users(current_user):
    users = User.query.all()
    return jsonify([{
        'id': user.id,
        'username': user.username,
        'user_type': user.user_type,
        'farm_name': user.farm_name if user.user_type == 'farmer' else None
    } for user in users]), 200

# Get user list for chat
@app.route('/api/chat/users', methods=['GET'])
@token_required
def get_chat_users(current_user):
    # For farmers, get buyers they've communicated with or who bought their products
    if current_user.user_type == 'farmer':
        # Get buyers who have ordered the farmer's products
        buyers = User.query.join(Order).join(OrderItem).join(Product).filter(
            Product.farmer_id == current_user.id,
            User.user_type == 'buyer'
        ).distinct().all()
        
        # Get buyers who have sent messages to the farmer
        message_senders = User.query.join(ChatMessage, User.id == ChatMessage.sender_id).filter(
            ChatMessage.receiver_id == current_user.id,
            User.user_type == 'buyer'
        ).distinct().all()
        
        # Combine and remove duplicates
        users = list({user.id: user for user in buyers + message_senders}.values())
    else:
        # For buyers, get farmers they've communicated with or whose products they've bought
        # Get farmers whose products the buyer has ordered
        farmers = User.query.join(Product).join(OrderItem).join(Order).filter(
            Order.buyer_id == current_user.id,
            User.user_type == 'farmer'
        ).distinct().all()
        
        # Get farmers who have sent messages to the buyer
        message_senders = User.query.join(ChatMessage, User.id == ChatMessage.sender_id).filter(
            ChatMessage.receiver_id == current_user.id,
            User.user_type == 'farmer'
        ).distinct().all()
        
        # Combine and remove duplicates
        users = list({user.id: user for user in farmers + message_senders}.values())
    
    return jsonify([{
        'id': user.id,
        'username': user.username,
        'user_type': user.user_type,
        'farm_name': user.farm_name if user.user_type == 'farmer' else None
    } for user in users]), 200

# Review endpoints - Full CRUD
@app.route('/api/reviews', methods=['GET'])
def get_reviews():
    product_id = request.args.get('product_id')
    if product_id:
        reviews = Review.query.filter_by(product_id=product_id).all()
    else:
        reviews = Review.query.all()
    
    return jsonify([{
        'id': r.id,
        'user_id': r.user_id,
        'product_id': r.product_id,
        'rating': r.rating,
        'comment': r.comment,
        'created_at': r.created_at.isoformat(),
        'username': r.user.username
    } for r in reviews]), 200

@app.route('/api/reviews', methods=['POST'])
@token_required
def create_review(current_user):
    data = request.get_json()
    
    # Check if user already reviewed this product
    existing_review = Review.query.filter_by(
        user_id=current_user.id,
        product_id=data['product_id']
    ).first()
    
    if existing_review:
        return jsonify({'message': 'You have already reviewed this product'}), 400
    
    review = Review(
        user_id=current_user.id,
        product_id=data['product_id'],
        rating=data['rating'],
        comment=data.get('comment', '')
    )
    
    db.session.add(review)
    db.session.commit()
    
    return jsonify({
        'id': review.id,
        'rating': review.rating,
        'comment': review.comment,
        'created_at': review.created_at.isoformat()
    }), 201

@app.route('/api/reviews/<int:review_id>', methods=['PUT'])
@token_required
def update_review(current_user, review_id):
    review = Review.query.get_or_404(review_id)
    
    if review.user_id != current_user.id:
        return jsonify({'message': 'You can only update your own reviews'}), 403
    
    data = request.get_json()
    
    if 'rating' in data:
        review.rating = data['rating']
    if 'comment' in data:
        review.comment = data['comment']
    
    db.session.commit()
    
    return jsonify({
        'id': review.id,
        'rating': review.rating,
        'comment': review.comment
    }), 200

@app.route('/api/reviews/<int:review_id>', methods=['DELETE'])
@token_required
def delete_review(current_user, review_id):
    review = Review.query.get_or_404(review_id)
    
    if review.user_id != current_user.id:
        return jsonify({'message': 'You can only delete your own reviews'}), 403
    
    db.session.delete(review)
    db.session.commit()
    
    return jsonify({'message': 'Review deleted successfully'}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)