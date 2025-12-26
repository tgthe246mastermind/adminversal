// src/components/Signup.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, UserPlus } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');

    if (!email || !password) {
      setError('Please enter an email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      // IMPORTANT: use your deployed Pages URL here for email confirmations
      // If you have email confirmations OFF, Supabase returns a session immediately and this still works.
      const emailRedirectTo = `${window.location.origin}/dashboard`;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo,
        },
      });

      if (error) {
        setError(error.message || 'Signup failed.');
        return;
      }

      // If confirmations are OFF, session will exist immediately
      if (data?.session) {
        navigate('/dashboard', { replace: true });
        return;
      }

      // If confirmations are ON, no session yet
      setNotice('Account created! Please check your email to confirm your account, then log in.');
      // You can optionally auto-send them to login after a moment:
      // setTimeout(() => navigate('/login'), 1200);
    } catch {
      setError('Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <style jsx>{`
        .auth-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
          font-family: 'Noto Sans', sans-serif;
        }

        .auth-container {
          background: white;
          padding: 3rem;
          border-radius: 20px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          width: 100%;
          max-width: 420px;
          box-sizing: border-box;
        }

        .auth-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .auth-logo {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          color: white;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .auth-title {
          font-size: 2rem;
          font-weight: 600;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .auth-subtitle {
          color: #64748b;
          margin-bottom: 2rem;
        }

        .auth-form {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
        }

        .form-group {
          position: relative;
          width: 100%;
        }

        .form-input {
          width: 100%;
          padding: 1rem 2.5rem 1rem 2.5rem;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: #f8fafc;
          box-sizing: border-box;
        }

        .form-input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          background: white;
        }

        .input-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .password-toggle {
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          cursor: pointer;
          color: #9ca3af;
          padding: 0.25rem;
          background: none;
          border: none;
        }

        .error-message {
          color: #991b1b;
          background: #fee2e2;
          border: 1px solid #fecaca;
          font-size: 0.9rem;
          text-align: center;
          padding: 0.75rem;
          border-radius: 12px;
        }

        .notice-message {
          color: #065f46;
          background: #d1fae5;
          border: 1px solid #a7f3d0;
          font-size: 0.9rem;
          text-align: center;
          padding: 0.75rem;
          border-radius: 12px;
        }

        .submit-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 1rem;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
        }

        .submit-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .auth-footer {
          text-align: center;
          margin-top: 1.5rem;
          color: #64748b;
        }

        .auth-link {
          color: #667eea;
          text-decoration: none;
          font-weight: 600;
        }

        .auth-link:hover {
          text-decoration: underline;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.35);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .auth-container {
            padding: 2rem 1.5rem;
            margin: 1rem;
          }
          .auth-title {
            font-size: 1.5rem;
          }
          .form-input {
            padding: 0.75rem 2rem 0.75rem 2rem;
            font-size: 0.9rem;
          }
        }
      `}</style>

      <div className="auth-container">
        <div className="auth-header">
          <div className="auth-logo">
            <UserPlus size={22} />
          </div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Start using AdminVersal in minutes</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <Mail className="input-icon" size={20} />
            <input
              type="email"
              className="form-input"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <Lock className="input-icon" size={20} />
            <input
              type={showPassword ? 'text' : 'password'}
              className="form-input"
              placeholder="Password (min 6 characters)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="form-group">
            <Lock className="input-icon" size={20} />
            <input
              type={showConfirm ? 'text' : 'password'}
              className="form-input"
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
            >
              {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}
          {notice && <div className="notice-message">{notice}</div>}

          <motion.button
            type="submit"
            className="submit-button"
            disabled={isLoading}
            whileHover={isLoading ? {} : { scale: 1.02 }}
            whileTap={isLoading ? {} : { scale: 0.98 }}
          >
            {isLoading ? (
              <>
                <div className="loading-spinner" />
                Creating account...
              </>
            ) : (
              <>
                <ArrowRight size={20} />
                Sign Up
              </>
            )}
          </motion.button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <a
            href="/login"
            className="auth-link"
            onClick={(e) => {
              e.preventDefault();
              navigate('/login');
            }}
          >
            Log in
          </a>
        </div>
      </div>
    </div>
  );
}

export default Signup;
