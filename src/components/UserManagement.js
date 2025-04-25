import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Alert } from "react-bootstrap";
import { motion } from "framer-motion";
import axios from "axios";
import { Users } from "lucide-react";

const API_URL = "https://syllabus-backend.onrender.com/api/auth";

const UserManagement = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    roles: ["user"],
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission (POST for create)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      // Create user (POST)
      await axios.post(`${API_URL}/signup`, formData);
      setSuccess("User created successfully!");
      resetForm();
    } catch (err) {
      setError("Error creating user: " + (err.response?.data?.message || err.message));
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      roles: ["user"],
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4"
    >
      <h4 className="mb-4 d-flex align-items-center">
        <Users size={24} className="me-2" /> User Management
      </h4>

      {/* Error and Success Messages */}
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      {/* User Form */}
      <Form onSubmit={handleSubmit} className="mb-4">
        <Row>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Username</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
          </Col>
        </Row>
        <Button variant="primary" type="submit" className="me-2">
          Add User
        </Button>
      </Form>

      {/* Placeholder for User List */}
      <Alert variant="info">
        User list functionality is currently unavailable. Please contact the backend administrator to implement the GET /api/auth/users endpoint for listing users.
      </Alert>

      {/* Commented out code for future GET/PUT/DELETE functionality */}
      {/*
      const [users, setUsers] = useState([]);
      const [editId, setEditId] = useState(null);

      // Fetch all users (GET)
      const fetchUsers = async () => {
        try {
          const response = await axios.get(`${API_URL}/users`);
          setUsers(response.data);
        } catch (err) {
          setError("Error fetching users: " + (err.response?.data?.message || err.message));
        }
      };

      // Handle edit user
      const handleEdit = (user) => {
        setFormData({
          username: user.username,
          email: user.email,
          password: "",
          roles: user.roles || ["user"],
        });
        setEditId(user._id);
      };

      // Handle delete user (DELETE)
      const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this user?")) {
          try {
            await axios.delete(`${API_URL}/users/${id}`);
            setSuccess("User deleted successfully!");
            fetchUsers();
          } catch (err) {
            setError("Error deleting user: " + (err.response?.data?.message || err.message));
          }
        }
      };

      // Update user in handleSubmit
      if (editId) {
        await axios.put(`${API_URL}/users/${editId}`, formData);
        setSuccess("User updated successfully!");
      }

      // Add to form for edit mode
      {editId && (
        <Button variant="secondary" onClick={resetForm}>
          Cancel
        </Button>
      )}

      // Add to useEffect
      useEffect(() => {
        fetchUsers();
      }, []);

      // Users Table
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Username</th>
            <th>Email</th>
            <th>Roles</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.roles.join(", ")}</td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => handleEdit(user)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(user._id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No users found
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      */}
    </motion.div>
  );
};

export default UserManagement;