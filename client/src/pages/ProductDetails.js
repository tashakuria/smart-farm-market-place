import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProductReviews from '../components/ProductReviews';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProduct = useCallback(async () => {
    try {
      const response = await api.get(`/api/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleOrder = () => {
    // Navigate back to products with order modal
    navigate('/products', { state: { orderProduct: product } });
  };

  const handleStartChat = () => {
    navigate('/chat', { state: { selectedUserId: product.farmer_id } });
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;
  if (!product) return <div className="text-center py-5">Product not found</div>;

  return (
    <Container className="py-4">
      <Row>
        <Col md={6}>
          <Card>
            <Card.Img 
              variant="top" 
              src={product.image_url || 'https://via.placeholder.com/400x300?text=Product+Image'} 
              style={{ height: '400px', objectFit: 'cover' }}
            />
          </Card>
        </Col>
        <Col md={6}>
          <h1>{product.name}</h1>
          <Badge bg="secondary" className="mb-3">{product.category}</Badge>
          <h3 className="text-success">KSh {product.price}</h3>
          <p className="text-muted">Available: {product.quantity} units</p>
          <p className="lead">{product.description}</p>
          
          <div className="mb-3">
            <strong>Farm:</strong> {product.farm_name}<br/>
            <strong>Farmer:</strong> {product.farmer_name}
          </div>

          {user && user.user_type === 'buyer' && (
            <div className="d-flex gap-2">
              <Button variant="success" onClick={handleOrder} className="flex-fill">
                Order Now
              </Button>
              <Button variant="outline-primary" onClick={handleStartChat} className="flex-fill">
                Chat with Farmer
              </Button>
            </div>
          )}
        </Col>
      </Row>

      <Row className="mt-5">
        <Col>
          <ProductReviews productId={product.id} />
        </Col>
      </Row>
    </Container>
  );
};

export default ProductDetail;