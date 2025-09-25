// src/pages/Home.js
import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const { user } = useAuth();

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-success text-white py-5">
        <Container>
          <Row className="align-items-center">
            <Col md={6}>
              <h1 className="display-4 fw-bold">Welcome to Agriconnect</h1>
              <p className="lead">
                Connecting farmers directly with buyers. Fresh agricultural products straight from the farm to your doorstep.
              </p>
              {!user ? (
                <div>
                  <Link to="/register">
                    <Button variant="light" size="lg" className="me-3">Get Started</Button>
                  </Link>
                  <Link to="/products">
                    <Button variant="outline-light" size="lg">Browse Products</Button>
                  </Link>
                </div>
              ) : (
                <Link to="/products">
                  <Button variant="light" size="lg">Browse Products</Button>
                </Link>
              )}
            </Col>
            <Col md={6}>
              <img 
                src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Farm fresh products" 
                className="img-fluid rounded"
              />
            </Col>
          </Row>
        </Container>
      </section>

      {/* Features Section */}
      <section className="py-5">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2>Why Choose Agriconnect?</h2>
              <p className="lead">We make agricultural trade simple and efficient</p>
            </Col>
          </Row>
          <Row>
            <Col md={4} className="mb-4">
              <Card className="h-100 text-center">
                <Card.Body>
                  <div className="fs-1 mb-3">👨‍🌾</div>
                  <Card.Title>For Farmers</Card.Title>
                  <Card.Text>
                    Reach more customers, get fair prices, and grow your business with our platform.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 text-center">
                <Card.Body>
                  <div className="fs-1 mb-3">🛒</div>
                  <Card.Title>For Buyers</Card.Title>
                  <Card.Text>
                    Get fresh products directly from farmers with competitive prices and quality guarantee.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4} className="mb-4">
              <Card className="h-100 text-center">
                <Card.Body>
                  <div className="fs-1 mb-3">💳</div>
                  <Card.Title>Secure Payments</Card.Title>
                  <Card.Text>
                    Safe and secure M-Pesa integration for seamless transactions.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* How It Works */}
      <section className="bg-light py-5">
        <Container>
          <Row className="text-center mb-5">
            <Col>
              <h2>How It Works</h2>
            </Col>
          </Row>
          <Row>
            <Col md={3} className="text-center mb-4">
              <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                <span className="fs-3">1</span>
              </div>
              <h5>Register</h5>
              <p>Create your account as a farmer or buyer</p>
            </Col>
            <Col md={3} className="text-center mb-4">
              <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                <span className="fs-3">2</span>
              </div>
              <h5>Connect</h5>
              <p>Browse products or list your offerings</p>
            </Col>
            <Col md={3} className="text-center mb-4">
              <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                <span className="fs-3">3</span>
              </div>
              <h5>Transact</h5>
              <p>Make secure payments via M-Pesa</p>
            </Col>
            <Col md={3} className="text-center mb-4">
              <div className="bg-success text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                <span className="fs-3">4</span>
              </div>
              <h5>Deliver</h5>
              <p>Get your fresh products delivered</p>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home;