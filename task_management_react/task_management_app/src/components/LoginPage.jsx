import React, { useState } from 'react';
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
      if (isRegistering) {
        await registerUser(formData);
        alert("Registration successful! Please log in.");
        setIsRegistering(false); 
      } else {
        // 1. Call API
        const response = await loginUser({ 
            email: formData.email, 
            password: formData.password 
        });

        // 2. Intelligent Data Unwrapping
        const responseData = response.data ? response.data : response;
        const token = responseData.Token || responseData.token;
        const user = responseData.User || responseData.user;

        if (!token || !user) {
            throw new Error("Login succeeded, but data is missing. Check console.");
        }

        // 3. SAVE TO LOCAL STORAGE (Crucial for persistence)
        localStorage.setItem("authToken", token);
        localStorage.setItem("user", JSON.stringify(user));

        // 4. Update App State
        onLogin(user);
      }

    } catch (err) {
      console.error("Authentication Error:", err);
      setError(err.message || "Authentication failed.");
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
              <input name="username" type="text" className="w-full border p-2 rounded" onChange={handleChange} required />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input name="email" type="email" className="w-full border p-2 rounded" onChange={handleChange} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input name="password" type="password" className="w-full border p-2 rounded" onChange={handleChange} required />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
            {isRegistering ? "Sign Up" : "Log In"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          {isRegistering ? "Already have an account?" : "No account yet?"}{" "}
          <button onClick={() => setIsRegistering(!isRegistering)} className="text-blue-600 font-semibold hover:underline">
            {isRegistering ? "Log In" : "Register"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;