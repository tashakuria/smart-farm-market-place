import React from 'react';
import { Navbar, Nav, Container, NavDropdown } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../context/AuthContext';

const NavigationBar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="bg-light shadow-sm sticky-top">
      <Container>
        <div className="py-2">
          <LinkContainer to="/">
            <Navbar.Brand className="fw-bold text-success fs-4">SMART FARM MARKET PLACE</Navbar.Brand>
          </LinkContainer>
        </div>
      </Container>
      
      <Navbar bg="light" variant="light" expand="lg" className="py-2">
        <Container>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
            </Nav>
            
            <Nav>
              <LinkContainer to="/">
                <Nav.Link className="fw-semibold">Home</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/products">
                <Nav.Link className="fw-semibold">Products</Nav.Link>
              </LinkContainer>
              {user ? (
                <>
                  <LinkContainer to="/dashboard">
                    <Nav.Link className="fw-semibold">Dashboard</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/chat">
                    <Nav.Link className="fw-semibold">Chat</Nav.Link>
                  </LinkContainer>
                  <NavDropdown 
                    title={`Welcome, ${user.username}`} 
                    id="user-dropdown" 
                    className="fw-semibold"
                  >
                    <LinkContainer to="/dashboard">
                      <NavDropdown.Item>My Dashboard</NavDropdown.Item>
                    </LinkContainer>
                    <NavDropdown.Divider />
                    <NavDropdown.Item onClick={handleLogout}>Logout</NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : (
                <>
                  <LinkContainer to="/login">
                    <Nav.Link className="fw-semibold">Login</Nav.Link>
                  </LinkContainer>
                  <LinkContainer to="/register">
                    <Nav.Link className="fw-semibold">Register</Nav.Link>
                  </LinkContainer>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
};

export default NavigationBar;