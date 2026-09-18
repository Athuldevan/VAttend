import React, { useState } from 'react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({ email, password, rememberMe });
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.card}>
        
        {/* Header / Branding */}
        <div style={styles.header}>
          <div style={styles.logoBadge}>A</div>
          <h2 style={styles.title}>Welcome back</h2>
          <p style={styles.subtitle}>Please sign in to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          
          {/* Email Field */}
          <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              style={styles.input}
              onFocus={(e) => (e.target.style.borderColor = '#4F46E5')}
              onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
            />
          </div>

          {/* Password Field */}
          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              onFocus={(e) => (e.target.style.borderColor = '#4F46E5')}
              onBlur={(e) => (e.target.style.borderColor = '#E5E7EB')}
            />
          </div>

          {/* Remember Me & Forgot Password */}
          <div style={styles.rowBetween}>
            <label style={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                style={styles.checkbox}
              />
              <span style={styles.checkboxText}>Remember me</span>
            </label>

            <a href="#forgot-password" style={styles.link}>
              Forgot password?
            </a>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={styles.button}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#4338CA')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#4F46E5')}
          >
            Sign in
          </button>
        </form>

        {/* Footer Status */}
        <div style={styles.footer}>
          <span>System Status: </span>
          <span style={styles.statusBadge}>
            <span style={styles.statusDot}></span> Operational
          </span>
        </div>

      </div>
    </div>
  );
};

// Styles mapped strictly to your design colors
const styles: { [key: string]: React.CSSProperties } = {
  pageContainer: {
    display: 'flex',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E0E7FF55', // Primary light with transparency
    padding: '1rem',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #E5E7EB', // Neutral borders
  },
  header: {
    textAlign: 'center',
    marginBottom: '24px',
  },
  logoBadge: {
    margin: '0 auto 16px auto',
    display: 'flex',
    height: '48px',
    width: '48px',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    backgroundColor: '#E0E7FF', // Primary light
    color: '#4F46E5', // Primary
    fontWeight: 'bold',
    fontSize: '20px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0 0 8px 0',
  },
  subtitle: {
    fontSize: '14px',
    color: '#4B5563',
    margin: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '14px',
    fontWeight: 500,
    color: '#374151',
  },
  input: {
    width: '100%',
    borderRadius: '8px',
    border: '1px solid #E5E7EB', // Neutral / borders
    padding: '10px 14px',
    fontSize: '14px',
    color: '#111827',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  rowBetween: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    cursor: 'pointer',
  },
  checkbox: {
    height: '16px',
    width: '16px',
    borderRadius: '4px',
    accentColor: '#4F46E5', // Primary
  },
  checkboxText: {
    color: '#4B5563',
  },
  link: {
    color: '#4F46E5', // Primary
    textDecoration: 'none',
    fontWeight: 500,
  },
  button: {
    width: '100%',
    borderRadius: '8px',
    backgroundColor: '#4F46E5', // Primary
    color: '#FFFFFF',
    padding: '12px',
    fontSize: '14px',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  },
  footer: {
    marginTop: '24px',
    borderTop: '1px solid #E5E7EB', // Neutral / borders
    paddingTop: '16px',
    textAlign: 'center',
    fontSize: '12px',
    color: '#6B7280',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontWeight: 500,
    color: '#16A34A', // Present green
    marginLeft: '4px',
  },
  statusDot: {
    height: '8px',
    width: '8px',
    borderRadius: '50%',
    backgroundColor: '#16A34A', // Present green
  },
};