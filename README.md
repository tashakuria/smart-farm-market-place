# Smart Farm Marketplace (AgriConnect+)

**An evolution of the Agriconnect concept**
A modern marketplace connecting farmers and buyers, with real-time communication and mobile-friendly access.

## Features

### Core

* **Farmer Accounts**:

  * List produce
  * Set prices
  * Manage inventory
* **Buyer Accounts**:

  * Browse/filter products
  * Place orders
  * Online payments
* **Real-Time Chat**: Farmers and buyers can communicate instantly via WebSockets
* **Mobile-Friendly**: Progressive Web App (PWA) optimized for rural internet access

### Stretch Ideas

* **MPesa Integration**: For seamless mobile payments
* **Crop-Disease Tips**: ML microservice provides farmers with actionable insights

## Tech Stack

* **Frontend**: React + Bootstrap
* **Backend**: Flask API
* **Database**: PostgreSQL or MongoDB
* **Real-Time**: WebSockets (e.g., Socket.IO or Flask-SocketIO)
* **Optional**: ML microservices for crop health predictions

## Installation

### Prerequisites

* FlaskApi & npm/yarn
* Python 3.8+
* PostgreSQL 

### Setup Frontend

```bash
cd client
npm install
npm run dev
```

### Setup Backend

```bash
cd server
python -m venv venv
source venv/bin/activate   
venv\Scripts\activate      
pip install -r requirements.txt
flask run
```

### Environment Variables

Create a `.env` file in the `server` directory:

```env
FLASK_APP=app.py
FLASK_ENV=development
DATABASE_URL=postgresql://username:password@localhost/dbname
SECRET_KEY=your_secret_key
```

## Usage

* Farmers can create an account, add produce, and manage inventory
* Buyers can browse, filter, order, and pay online
* Users can chat in real-time to finalize deals

## API Endpoints

**Farmers**

* `POST /api/farmers/register` - Register a farmer
* `POST /api/farmers/login` - Login
* `GET /api/farmers/produce` - List produce
* `POST /api/farmers/produce` - Add new produce

**Buyers**

* `POST /api/buyers/register` - Register a buyer
* `POST /api/buyers/login` - Login
* `GET /api/products` - Browse products
* `POST /api/orders` - Place order

**Chat**

* `ws://server-address/chat` - WebSocket endpoint for real-time messaging

*(Adjust endpoints based on your implementation)*

## Project Structure

```
AgriConnect+/
│
├── client/             # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/             # Flask backend
│   ├── app.py
│   ├── models.py
│   ├── routes/
│   ├── requirements.txt
│   └── .env
│
└── README.md
```

## Stretch Goals

* MPesa API integration for mobile payments
* Crop-disease prediction ML microservice
* Push notifications for new produce or messages

## Contributing

1. Fork the repository
2. Create a new branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Commit your work: `git commit -m "Add your feature"`
5. Push to the branch: `git push origin feature/your-feature`
6. Create a pull request

## Authors
  Amos Kipkorir
  Tasha Kuria

