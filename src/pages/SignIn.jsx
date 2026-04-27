import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLoginMutation } from '../hooks/useAuthMutations';
import { getDeviceId } from '../utils/format';
import { Icon } from '../components/Icon';
import { ArtPanel } from '../components/ArtPanel';

function FieldError({ msg }) {
  if (!msg) return null;
  return <div className="input-helper error"><Icon.alert /> {msg}</div>;
}

export default function SignIn() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const login = useLoginMutation();

  const [form, setForm] = useState({ username: '', password: '' });
  const [touched, setTouched] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [apiError, setApiError] = useState(null);

  const errors = {
    username: !form.username ? 'Username is required' : null,
    password: !form.password ? 'Password is required' : (form.password.length < 4 ? 'Password is too short' : null),
  };

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const blur = (k) => setTouched((t) => ({ ...t, [k]: true }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setTouched({ username: true, password: true });
    setApiError(null);
    if (errors.username || errors.password) return;
    try {
      const data = await login.mutateAsync({
        username: form.username,
        password: form.password,
        deviceId: getDeviceId(),
      });
      signIn(data);
      navigate('/home');
    } catch (err) {
      setApiError(err.response?.data?.message || err.message || 'Login failed');
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-form-wrap">
        <div className="auth-brand">
          <div className="logo-mark"></div>
          <span>Wallet</span>
        </div>

        <div className="auth-form-inner">
          <div className="auth-eyebrow">Welcome back</div>
          <h1 className="auth-h1">Sign in to your <em>Wallet</em>.</h1>
          <p className="auth-sub">Access your accounts, track spending, and move money between your wallets.</p>

          <div className="api-banner">
            <span className="pill">POST</span>
            <span>/api/auth/login</span>
            <span style={{marginLeft: 'auto', opacity: .7}}>via React Query</span>
          </div>

          <form onSubmit={onSubmit} noValidate>
            <div className="field">
              <label htmlFor="username">Username</label>
              <div className="input-wrap">
                <span className="input-icon"><Icon.at /></span>
                <input
                  id="username"
                  className={'input with-icon' + (touched.username && errors.username ? ' has-error' : '')}
                  placeholder="faizul2"
                  value={form.username}
                  onChange={(e) => update('username', e.target.value)}
                  onBlur={() => blur('username')}
                  autoComplete="username"
                />
              </div>
              {touched.username && <FieldError msg={errors.username} />}
            </div>

            <div className="field">
              <label htmlFor="password" style={{display:'flex', justifyContent:'space-between'}}>
                <span>Password</span>
                <button type="button" className="linklike" style={{background:'none',border:'none',color:'var(--brand-700)',fontSize:12.5,cursor:'pointer', fontWeight:500}}>Forgot?</button>
              </label>
              <div className="input-wrap">
                <span className="input-icon"><Icon.lock /></span>
                <input
                  id="password"
                  type={showPwd ? 'text' : 'password'}
                  className={'input with-icon' + (touched.password && errors.password ? ' has-error' : '')}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  onBlur={() => blur('password')}
                  autoComplete="current-password"
                />
                <button type="button" className="input-action" onClick={() => setShowPwd((s) => !s)}>
                  {showPwd ? <Icon.eyeOff/> : <Icon.eye/>}
                </button>
              </div>
              {touched.password && <FieldError msg={errors.password} />}
            </div>

            {apiError && (
              <div style={{
                background:'var(--danger-100)', color:'var(--danger-700)',
                padding:'10px 14px', borderRadius:8, fontSize:13, marginBottom:14,
                display:'flex', alignItems:'center', gap:8
              }}>
                <Icon.alert /> {apiError}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-block" disabled={login.isPending}>
              {login.isPending ? <><span className="spinner"></span> Signing in…</> : <>Sign in <Icon.arrowRight /></>}
            </button>
          </form>

          <div className="auth-footer-link">
            New to Wallet?{' '}
            <Link to="/signup">Create an account</Link>
          </div>
        </div>

        <div className="auth-meta-row">
          <div><span className="dot"></span>All systems normal</div>
          <div>© Wallet 2026 · Secured by AES-256</div>
        </div>
      </div>

      <ArtPanel />
    </div>
  );
}
