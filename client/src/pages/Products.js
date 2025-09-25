// src/pages/Products.js
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert, Modal } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    search: ''
  });
  const { user } = useAuth();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/products');
      // Store all products for filtering
      
      // Extract unique categories from products
      const uniqueCategories = [...new Set(response.data.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories);
      
      // Apply filters
      let filteredProducts = response.data;
      
      if (filters.category) {
        filteredProducts = filteredProducts.filter(p => p.category === filters.category);
      }
      
      if (filters.search) {
        filteredProducts = filteredProducts.filter(p => 
          p.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          p.description.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      setProducts(filteredProducts);
    } catch (error) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [filters]);

useEffect(() => {
  fetchProducts();
}, [fetchProducts]);


  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const navigate = useNavigate();
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleOrder = (product) => {
    setSelectedProduct(product);
    setOrderQuantity(1);
    setShowOrderModal(true);
  };

  const handleStartChat = (farmerId) => {
    navigate('/chat', { state: { selectedUserId: farmerId } });
  };

  const submitOrder = async () => {
    try {
      const orderData = {
        items: [{
          product_id: selectedProduct.id,
          quantity: orderQuantity
        }],
        phone_number: phoneNumber
      };
      
      await api.post('/api/orders', orderData);
      setShowOrderModal(false);
      alert('Order placed successfully!');
    } catch (error) {
      alert('Error placing order: ' + (error.response?.data?.message || 'Unknown error'));
    }
  };

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>Browse Products</h2>
        </Col>
      </Row>

      {/* Filters */}
      <Row className="mb-4">
        <Col md={6}>
          <Form.Control
            type="text"
            name="search"
            placeholder="Search products..."
            value={filters.search}
            onChange={handleFilterChange}
          />
        </Col>
        <Col md={3}>
          <Form.Select name="category" value={filters.category} onChange={handleFilterChange}>
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={3}>
          <Button variant="outline-secondary" onClick={() => setFilters({ category: '', search: '' })}>
            Clear Filters
          </Button>
        </Col>
      </Row>

      {error && <Alert variant="danger">{error}</Alert>}

      {/* Products Grid */}
      <Row>
        {products.map(product => (
          <Col key={product.id} md={4} className="mb-4">
            <Card className="h-100">
              <Link to={`/products/${product.id}`} className="text-decoration-none">
                <Card.Img 
                  variant="top" 
                  src={product.image_url || `https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300&h=200&fit=crop&crop=center&q=80`} 
                  style={{ height: '200px', objectFit: 'cover' }}
                />
              </Link>
              <Card.Body className="d-flex flex-column">
                <Link to={`/products/${product.id}`} className="text-decoration-none text-dark">
                  <Card.Title>{product.name}</Card.Title>
                </Link>
                <Card.Text className="text-truncate">{product.description}</Card.Text>
                <div className="mt-auto">
                  <p className="h5 text-success">KSh {product.price}</p>
                  <p className="text-muted">Category: {product.category || 'Uncategorized'}</p>
                  <p className="text-muted">Farm: {product.farm_name}</p>
                  <p className="text-muted">Quantity: {product.quantity} available</p>
                  {user && user.user_type === 'buyer' && (
                    <div className="d-flex gap-2 flex-wrap">
                      <Button variant="success" onClick={() => handleOrder(product)} className="flex-fill">
                        Order Now
                      </Button>
                      <Button variant="outline-primary" onClick={() => handleStartChat(product.farmer_id)} className="flex-fill">
                        Chat with Farmer
                      </Button>
                    </div>
                  )}
                  <div className="mt-2">
                    <Link to={`/products/${product.id}`}>
                      <Button variant="outline-secondary" size="sm">View Details</Button>
                    </Link>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {products.length === 0 && !loading && (
        <Row>
          <Col className="text-center">
            <p>No products found. Try adjusting your filters.</p>
          </Col>
        </Row>
      )}

      {/* Order Modal */}
      <Modal show={showOrderModal} onHide={() => setShowOrderModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Place Order</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedProduct && (
            <>
              <h5>{selectedProduct.name}</h5>
              <p>Price: KSh {selectedProduct.price} per unit</p>
              <p>Available: {selectedProduct.quantity} units</p>
              
              <Form.Group className="mb-3">
                <Form.Label>Quantity</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  max={selectedProduct.quantity}
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(parseInt(e.target.value))}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Phone Number (for M-Pesa)</Form.Label>
                <Form.Control
                  type="tel"
                  placeholder="254XXXXXXXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                />
              </Form.Group>
              
              <div className="bg-light p-3 rounded">
                <strong>Total: KSh {selectedProduct.price * orderQuantity}</strong>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowOrderModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="success" 
            onClick={submitOrder}
            disabled={!phoneNumber || orderQuantity < 1}
          >
            Place Order
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default Products;