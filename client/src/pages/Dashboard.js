// src/pages/Dashboard.js
import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Button, Tab, Tabs, Table, Form, Alert, Spinner, Modal } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    quantity: '',
    image_url: ''
  });
  const [editingProduct, setEditingProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      if (user?.user_type === 'farmer') {
        const response = await api.get('/api/products?farmer_id=' + user.id);
        setProducts(response.data);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setError('Failed to load products');
    }
  }, [user]);

  const fetchOrders = useCallback(async () => {
    try {
      const response = await api.get('/api/orders');
      setOrders(response.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchProducts();
      fetchOrders();
    }
  }, [user, fetchProducts, fetchOrders]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/products', newProduct);
      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: '',
        quantity: '',
        image_url: ''
      });
      fetchProducts();
      alert('Product added successfully!');
    } catch (error) {
      alert('Error adding product');
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setShowEditModal(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/api/products/${editingProduct.id}`, editingProduct);
      setShowEditModal(false);
      setEditingProduct(null);
      fetchProducts();
      alert('Product updated successfully!');
    } catch (error) {
      alert('Error updating product');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await api.delete(`/api/products/${productId}`);
        fetchProducts();
        alert('Product deleted successfully!');
      } catch (error) {
        alert('Error deleting product');
      }
    }
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2>Dashboard</h2>
          <p className="text-muted">Welcome back, {user?.username}!</p>
        </Col>
      </Row>

      {error && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger" dismissible onClose={() => setError('')}>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {loading ? (
        <Row>
          <Col className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </Col>
        </Row>
      ) : (
        <>
          <Tabs defaultActiveKey="overview" className="mb-3">
        <Tab eventKey="overview" title="Overview">
          <Row>
            <Col md={4}>
              <Card className="text-center">
                <Card.Body>
                  <Card.Title>{user?.user_type === 'farmer' ? products.length : orders.length}</Card.Title>
                  <Card.Text>
                    {user?.user_type === 'farmer' ? 'Products Listed' : 'Orders Made'}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Tab>

        {user?.user_type === 'farmer' && (
          <Tab eventKey="products" title="My Products">
            <Button variant="success" className="mb-3" data-bs-toggle="modal" data-bs-target="#addProductModal">
              Add New Product
            </Button>
            
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(product => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>KSh {product.price}</td>
                    <td>{product.quantity}</td>
                    <td>{product.category}</td>
                    <td>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        className="me-2"
                        onClick={() => handleEditProduct(product)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Tab>
        )}

        <Tab eventKey="orders" title="Orders">
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>KSh {order.total_amount}</td>
                  <td>{order.status}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>
                    <Button variant="outline-primary" size="sm">View Details</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Tab>
          </Tabs>

          {/* Add Product Modal */}
          <div className="modal fade" id="addProductModal" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Add New Product</h5>
                  <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <Form onSubmit={handleAddProduct}>
                  <div className="modal-body">
                    <Form.Group className="mb-3">
                      <Form.Label>Product Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={newProduct.name}
                        onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        value={newProduct.description}
                        onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                      />
                    </Form.Group>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Price (KSh)</Form.Label>
                          <Form.Control
                            type="number"
                            value={newProduct.price}
                            onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label>Quantity</Form.Label>
                          <Form.Control
                            type="number"
                            value={newProduct.quantity}
                            onChange={(e) => setNewProduct({...newProduct, quantity: e.target.value})}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-3">
                      <Form.Label>Category</Form.Label>
                      <Form.Select
                        value={newProduct.category}
                        onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                      >
                        <option value="">Select Category</option>
                        <option value="vegetables">Vegetables</option>
                        <option value="fruits">Fruits</option>
                        <option value="grains">Grains</option>
                        <option value="dairy">Dairy</option>
                      </Form.Select>
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Image URL</Form.Label>
                      <Form.Control
                        type="url"
                        value={newProduct.image_url}
                        onChange={(e) => setNewProduct({...newProduct, image_url: e.target.value})}
                        placeholder="https://example.com/image.jpg"
                      />
                    </Form.Group>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <Button type="submit" variant="success">Add Product</Button>
                  </div>
                </Form>
              </div>
            </div>
          </div>

          {/* Edit Product Modal */}
          <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Edit Product</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleUpdateProduct}>
              <Modal.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Product Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={editingProduct?.name || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    as="textarea"
                    value={editingProduct?.description || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                  />
                </Form.Group>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Price (KSh)</Form.Label>
                      <Form.Control
                        type="number"
                        value={editingProduct?.price || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Quantity</Form.Label>
                      <Form.Control
                        type="number"
                        value={editingProduct?.quantity || ''}
                        onChange={(e) => setEditingProduct({...editingProduct, quantity: e.target.value})}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select
                    value={editingProduct?.category || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, category: e.target.value})}
                  >
                    <option value="">Select Category</option>
                    <option value="vegetables">Vegetables</option>
                    <option value="fruits">Fruits</option>
                    <option value="grains">Grains</option>
                    <option value="dairy">Dairy</option>
                  </Form.Select>
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label>Image URL</Form.Label>
                  <Form.Control
                    type="url"
                    value={editingProduct?.image_url || ''}
                    onChange={(e) => setEditingProduct({...editingProduct, image_url: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                </Form.Group>
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
                <Button type="submit" variant="success">Update Product</Button>
              </Modal.Footer>
            </Form>
          </Modal>
        </>
      )}
    </Container>
  );
};

export default Dashboard;