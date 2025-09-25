import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Card, Spinner, Alert, Form, Badge } from 'react-bootstrap';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await axios.get('/api/orders');
      setOrders(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(`/api/orders/${orderId}`, { status: newStatus });
      fetchOrders(); // Refresh the orders list
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Failed to update order status');
    }
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case 'confirmed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'shipped':
        return 'info';
      case 'delivered':
        return 'primary';
      case 'cancelled':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <Container className="py-4">
        <Row className="justify-content-center">
          <Col md={6} className="text-center">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading orders...</span>
            </Spinner>
            <p className="mt-2">Loading orders...</p>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="h2 text-dark">
            {currentUser.user_type === 'farmer' ? 'Orders Received' : 'My Orders'}
          </h1>
        </Col>
      </Row>

      {error && (
        <Row className="mb-3">
          <Col>
            <Alert variant="danger">{error}</Alert>
          </Col>
        </Row>
      )}

      {orders.length === 0 ? (
        <Row>
          <Col>
            <Alert variant="info" className="text-center">
              No orders found.
            </Alert>
          </Col>
        </Row>
      ) : (
        <Row>
          <Col>
            <div className="d-grid gap-4">
              {orders.map(order => (
                <Card key={order.id} className="shadow-sm">
                  <Card.Body>
                    <Row className="align-items-start mb-3">
                      <Col md={8}>
                        <div className="d-flex align-items-center mb-2">
                          <h5 className="card-title mb-0 me-3">Order #{order.id}</h5>
                          <Badge bg={getStatusVariant(order.status)} className="fs-6">
                            {order.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-muted mb-1">
                          Placed on {new Date(order.created_at).toLocaleDateString()}
                        </p>
                        {currentUser.user_type === 'buyer' && (
                          <p className="text-muted mb-0">
                            Farmer: {order.items[0]?.farmer_name}
                          </p>
                        )}
                        {currentUser.user_type === 'farmer' && (
                          <p className="text-muted mb-0">
                            Buyer: {order.buyer_name}
                          </p>
                        )}
                      </Col>
                      <Col md={4} className="text-md-end">
                        <h4 className="text-success mb-0">KSh {order.total_amount}</h4>
                      </Col>
                    </Row>

                    <hr />

                    <Row className="mb-3">
                      <Col>
                        <h6 className="mb-3">Order Items:</h6>
                        {order.items.map(item => (
                          <Row key={item.id} className="align-items-center mb-2">
                            <Col md={8}>
                              <div>
                                <strong>{item.product_name}</strong>
                                <small className="text-muted d-block">
                                  Quantity: {item.quantity}
                                </small>
                              </div>
                            </Col>
                            <Col md={4} className="text-end">
                              <span className="text-success fw-semibold">
                                KSh {item.price * item.quantity}
                              </span>
                            </Col>
                          </Row>
                        ))}
                      </Col>
                    </Row>

                    {currentUser.user_type === 'farmer' && (
                      <Row className="align-items-center">
                        <Col md={6}>
                          <div className="d-flex align-items-center">
                            <span className="fw-medium me-3">Update Status:</span>
                            <Form.Select
                              value={order.status}
                              onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                              style={{ width: 'auto' }}
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </Form.Select>
                          </div>
                        </Col>
                      </Row>
                    )}

                    {order.mpesa_receipt && (
                      <Row className="mt-2">
                        <Col>
                          <small className="text-muted">
                            MPesa Receipt: {order.mpesa_receipt}
                          </small>
                        </Col>
                      </Row>
                    )}
                  </Card.Body>
                </Card>
              ))}
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Orders;