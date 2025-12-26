import React, { useState } from 'react';

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

    const endpoint = isRegistering ? 'register' : 'login';
    const url = `http://localhost:5017/api/Auth/${endpoint}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      // --- SAFETY CHECK: Handle non-JSON responses ---
      let data;
      const contentType = response.headers.get("content-type");
      
      if (contentType && contentType.indexOf("application/json") !== -1) {
        // It is JSON, parse it safely
        data = await response.json();
      } else {
        // It is NOT JSON (maybe plain text error or 500 server crash)
        const text = await response.text();
        // Create a fake data object to handle the error below
        data = { Message: text || "An unknown error occurred" };
      }
      // -----------------------------------------------

      if (!response.ok) {
        // If server sent { Message: "..." } use that, otherwise use default
        throw new Error(data.Message || "Authentication failed");
      }

      if (isRegistering) {
        alert("Registration successful! Please log in.");
        setIsRegistering(false); 
      } else {
        onLogin(data); 
      }

    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message || "Server connection failed");
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