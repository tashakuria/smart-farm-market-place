import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Container, Row, Col, Card, Form, Button, ListGroup, Spinner, Alert } from 'react-bootstrap';

const Chat = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const { user } = useAuth();
  const location = useLocation();

  const fetchChatUsers = useCallback(async () => {
    try {
      setLoading(true);
      // Get all users for chat (farmers for buyers, buyers for farmers)
      const allUsersResponse = await api.get('/api/users');
      const filteredUsers = allUsersResponse.data.filter(u => 
        u.id !== user.id && 
        ((user.user_type === 'buyer' && u.user_type === 'farmer') || 
         (user.user_type === 'farmer' && u.user_type === 'buyer'))
      );
      setUsers(filteredUsers);
      setError('');
    } catch (error) {
      console.error('Error fetching chat users:', error);
      // Fallback to existing endpoint
      try {
        const response = await api.get('/api/chat/users');
        setUsers(response.data);
      } catch (fallbackError) {
        setError('Failed to load chat users');
      }
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchChatUsers();
  }, [fetchChatUsers]);

  useEffect(() => {
    // Auto-select user if coming from product page
    if (location.state?.selectedUserId && users.length > 0) {
      const userToSelect = users.find(u => u.id === location.state.selectedUserId);
      if (userToSelect) {
        setSelectedUser(userToSelect);
      }
    }
  }, [users, location.state]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.id);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async (userId, pageNum = 1) => {
    try {
      setLoading(true);
      const response = await api.get(`/api/chat/${userId}?page=${pageNum}`);
      const newMessages = response.data.messages.reverse();
      
      if (pageNum === 1) {
        setMessages(newMessages);
      } else {
        setMessages(prev => [...newMessages, ...prev]);
      }
      
      setPage(pageNum);
      setHasMore(response.data.pages > pageNum);
      setError('');
      
      // Mark messages as read
      if (newMessages.some(m => !m.read && m.sender_id === userId)) {
        await api.post('/api/chat/mark-read', { sender_id: userId });
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMessages = () => {
    if (hasMore && selectedUser) {
      fetchMessages(selectedUser.id, page + 1);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;
    
    try {
      const response = await api.post(`/api/chat/${selectedUser.id}`, {
        message: newMessage
      });
      
      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
      setError('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="h2 text-dark">Messages</h1>
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

      <Card className="shadow-sm">
        <Card.Body className="p-0">
          <Row className="g-0" style={{ minHeight: '600px' }}>
            {/* Users List - Left Sidebar */}
            <Col md={4} className="border-end bg-light">
              <div className="p-3 border-bottom bg-white">
                <h5 className="mb-0 text-dark">Contacts</h5>
              </div>
              
              <div style={{ height: '548px', overflowY: 'auto' }}>
                {loading && users.length === 0 ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                  </div>
                ) : users.length === 0 ? (
                  <div className="text-center py-5 text-muted">
                    <i className="bi bi-people" style={{ fontSize: '2rem' }}></i>
                    <p className="mt-2 mb-0">No contacts yet</p>
                    <small>Start by browsing products or making orders</small>
                  </div>
                ) : (
                  <ListGroup variant="flush">
                    {users.map(user => (
                      <ListGroup.Item
                        key={user.id}
                        action
                        active={selectedUser?.id === user.id}
                        onClick={() => setSelectedUser(user)}
                        className="border-0 rounded-0 py-3"
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="d-flex align-items-center">
                          <div 
                            className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                            style={{ width: '40px', height: '40px' }}
                          >
                            <span className="fw-semibold">
                              {user.username.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-grow-1">
                            <div className="d-flex justify-content-between align-items-center">
                              <h6 className="mb-0">{user.username}</h6>
                              {/* You can add unread message badge here if needed */}
                            </div>
                            <small className="text-muted">
                              {user.user_type === 'farmer' 
                                ? user.farm_name || 'Farmer'
                                : 'Buyer'
                              }
                            </small>
                          </div>
                        </div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </div>
            </Col>

            {/* Chat Area - Right Side */}
            <Col md={8}>
              {selectedUser ? (
                <div className="d-flex flex-column h-100">
                  {/* Chat Header */}
                  <div className="p-3 border-bottom">
                    <div className="d-flex align-items-center">
                      <div 
                        className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3"
                        style={{ width: '40px', height: '40px' }}
                      >
                        <span className="fw-semibold">
                          {selectedUser.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h6 className="mb-0">{selectedUser.username}</h6>
                        <small className="text-muted">
                          {selectedUser.user_type === 'farmer' 
                            ? selectedUser.farm_name || 'Farmer'
                            : 'Buyer'
                          }
                        </small>
                      </div>
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div 
                    className="flex-grow-1 p-3"
                    style={{ 
                      height: '400px', 
                      overflowY: 'auto', 
                      backgroundColor: '#e5ddd5',
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M20 20c0 11.046-8.954 20-20 20v-40c11.046 0 20 8.954 20 20z"/%3E%3C/g%3E%3C/svg%3E")',
                      position: 'relative'
                    }}
                  >
                    {loading && messages.length === 0 ? (
                      <div className="text-center py-4">
                        <Spinner animation="border" variant="primary" />
                      </div>
                    ) : (
                      <>
                        {hasMore && (
                          <div className="text-center mb-3">
                            <Button 
                              variant="outline-primary" 
                              size="sm"
                              onClick={loadMoreMessages}
                              disabled={loading}
                            >
                              {loading ? 'Loading...' : 'Load older messages'}
                            </Button>
                          </div>
                        )}
                        
                        <div className="d-flex flex-column gap-3">
                          {messages.length === 0 ? (
                            <div className="text-center text-muted py-5">
                              <i className="bi bi-chat-text" style={{ fontSize: '2rem' }}></i>
                              <p className="mt-2">No messages yet. Start the conversation!</p>
                            </div>
                          ) : (
                            messages.map(message => (
                              <div
                                key={message.id}
                                className={`d-flex ${
                                  message.sender_id === user.id 
                                    ? 'justify-content-end' 
                                    : 'justify-content-start'
                                }`}
                              >
                                <div
                                  className={`rounded-3 px-3 py-2 shadow-sm position-relative ${
                                    message.sender_id === user.id
                                      ? 'bg-primary text-white'
                                      : 'bg-white text-dark border'
                                  }`}
                                  style={{ 
                                    maxWidth: '75%',
                                    wordBreak: 'break-word',
                                    borderRadius: message.sender_id === user.id ? '18px 18px 4px 18px' : '18px 18px 18px 4px'
                                  }}
                                >
                                  <div className="message-content" style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>
                                    {message.message}
                                  </div>
                                  <div 
                                    className={`small mt-1 text-end ${
                                      message.sender_id === user.id
                                        ? 'text-white-50'
                                        : 'text-muted'
                                    }`}
                                    style={{ fontSize: '0.75rem' }}
                                  >
                                    {new Date(message.timestamp).toLocaleTimeString([], { 
                                      hour: '2-digit', 
                                      minute: '2-digit' 
                                    })}
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-3 border-top bg-white">
                    <div className="d-flex gap-2 align-items-end">
                      <Form.Control
                        as="textarea"
                        rows={1}
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={loading}
                        style={{ 
                          resize: 'none',
                          borderRadius: '20px',
                          border: '1px solid #ddd',
                          padding: '10px 15px',
                          maxHeight: '100px',
                          minHeight: '40px'
                        }}
                      />
                      <Button
                        variant="primary"
                        onClick={sendMessage}
                        disabled={!newMessage.trim() || loading}
                        style={{
                          borderRadius: '50%',
                          width: '45px',
                          height: '45px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '0'
                        }}
                      >
                        <i className="bi bi-send-fill"></i>
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="d-flex align-items-center justify-content-center h-100">
                  <div className="text-center text-muted">
                    <div className="mb-3">
                      <i className="bi bi-chat-dots" style={{ fontSize: '3rem' }}></i>
                    </div>
                    <h5>Select a contact to start chatting</h5>
                    <p>Choose someone from the list to begin your conversation</p>
                  </div>
                </div>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Chat;