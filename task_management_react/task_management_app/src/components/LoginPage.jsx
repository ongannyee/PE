import React, { useState } from 'react';
// 1. Import the API functions
import { loginUser, registerUser } from '../API/UserAPI';

const LoginPage = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // 2. Logic is now much simpler!
      if (isRegistering) {
        // REGISTER
        await registerUser(formData);
        alert("Registration successful! Please log in.");
        setIsRegistering(false); // Switch to login view
      } else {
        // LOGIN
        // We pass only the fields the API expects
        const data = await loginUser({ 
            email: formData.email, 
            password: formData.password 
        });
        
        // Success! Pass the user data up to App.jsx
        onLogin(data);
      }

    } catch (err) {
      console.error("Authentication Error:", err);
      // The API wrapper throws standard JS errors now, so we just read the message
      setError(err.message || "Authentication failed. Please check your connection.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-800">
          {isRegistering ? "Create Account" : "Welcome Back"}
        </h2>

        {error && <div className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegistering && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                name="username"
                type="text"
                className="w-full border p-2 rounded"
                onChange={handleChange}
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              name="email"
              type="email"
              className="w-full border p-2 rounded"
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              name="password"
              type="password"
              className="w-full border p-2 rounded"
              onChange={handleChange}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {isRegistering ? "Sign Up" : "Log In"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          {isRegistering ? "Already have an account?" : "No account yet?"}{" "}
          <button
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-blue-600 font-semibold hover:underline"
          >
            {isRegistering ? "Log In" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;