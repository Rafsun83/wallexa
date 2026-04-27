import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useRegisterMutation, useLoginMutation } from '../hooks/useAuthMutations';
import { getDeviceId } from '../utils/format';
import { Icon } from '../components/Icon';
import { ArtPanel } from '../components/ArtPanel';

function FieldError({ msg }) {
  if (!msg) return null;
  return <div className="input-helper error"><Icon.alert /> {msg}</div>;
}

export default function SignUp() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const register = useRegisterMutation();
  const login = useLoginMutation();

  const [form, setForm] = useState({
    name: '', email: '', username: '', location: '', password: '',
  });
  const [touched, setTouched] = useState({});
  const [showPwd, setShowPwd] = useState(false);
  const [apiError, setApiError] = useState(null);

  const errors = {
    name: !form.name ? 'Name is required' : null,
    email: !form.email ? 'Email is required' : (!/^\S+@\S+\.\S+$/.test(form.email) ? 'Enter a valid email' : null),
    username: !form.username ? 'Username is required' : (form.username.length < 3 ? 'Min 3 characters' : null),
    location: !form.location ? 'Location is required' : null,
    password: !form.password ? 'Password is required' : (form.password.length < 4 ? 'Min 4 characters' : null),
  };

  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const blur = (k) => setTouched((t) => ({ ...t, [k]: true }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setTouched(Object.fromEntries(Object.keys(form).map((k) => [k, true])));
    setApiError(null);
    if (Object.values(errors).some(Boolean)) return;
    try {
      await register.mutateAsync(form);
      const data = await login.mutateAsync({
        username: form.username,
        password: form.password,
        deviceId: getDeviceId(),
      });
      signIn(data);
      navigate('/home');
    } catch (err) {
      setApiError(err.response?.data?.message || err.message || 'Registration failed');
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
          <div className="auth-eyebrow">Get started</div>
          <h1 className="auth-h1">Open your <em>Wallet</em> in 60 seconds.</h1>
          <p className="auth-sub">Free forever for personal accounts. No credit card. No paperwork.</p>

          <div className="api-banner">
            <span className="pill">POST</span>
            <span>/api/auth/register</span>
            <span style={{marginLeft: 'auto', opacity: .7}}>via React Query</span>
          </div>

          <form onSubmit={onSubmit} noValidate>
            <div className="field">
              <label htmlFor="name">Full name</label>
              <div className="input-wrap">
                <span className="input-icon"><Icon.user /></span>
                <input id="name" className={'input with-icon' + (touched.name && errors.name ? ' has-error' : '')}
                  placeholder="Faizul Islam" value={form.name}
                  onChange={(e) => update('name', e.target.value)} onBlur={() => blur('name')} />
              </div>
              {touched.name && <FieldError msg={errors.name} />}
            </div>

            <div className="field">
              <label htmlFor="email">Email</label>
              <div className="input-wrap">
                <span className="input-icon"><Icon.mail /></span>
                <input id="email" type="email" className={'input with-icon' + (touched.email && errors.email ? ' has-error' : '')}
                  placeholder="you@example.com" value={form.email}
                  onChange={(e) => update('email', e.target.value)} onBlur={() => blur('email')} />
              </div>
              {touched.email && <FieldError msg={errors.email} />}
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="username">Username</label>
                <div className="input-wrap">
                  <span className="input-icon"><Icon.at /></span>
                  <input id="username" className={'input with-icon' + (touched.username && errors.username ? ' has-error' : '')}
                    placeholder="faizul2" value={form.username}
                    onChange={(e) => update('username', e.target.value)} onBlur={() => blur('username')} />
                </div>
                {touched.username && <FieldError msg={errors.username} />}
              </div>
              <div className="field">
                <label htmlFor="location">Location</label>
                <div className="input-wrap">
                  <span className="input-icon"><Icon.pin /></span>
                  <input id="location" className={'input with-icon' + (touched.location && errors.location ? ' has-error' : '')}
                    placeholder="Dhaka" value={form.location}
                    onChange={(e) => update('location', e.target.value)} onBlur={() => blur('location')} />
                </div>
                {touched.location && <FieldError msg={errors.location} />}
              </div>
            </div>

            <div className="field">
              <label htmlFor="password2">Password</label>
              <div className="input-wrap">
                <span className="input-icon"><Icon.lock /></span>
                <input id="password2" type={showPwd ? 'text' : 'password'}
                  className={'input with-icon' + (touched.password && errors.password ? ' has-error' : '')}
                  placeholder="At least 4 characters" value={form.password}
                  onChange={(e) => update('password', e.target.value)} onBlur={() => blur('password')} />
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

            <button type="submit" className="btn btn-primary btn-block" disabled={register.isPending || login.isPending}>
              {(register.isPending || login.isPending)
                ? <><span className="spinner"></span> Creating account…</>
                : <>Create account <Icon.arrowRight /></>}
            </button>
          </form>

          <div className="auth-footer-link">
            Already have an account?{' '}
            <Link to="/signin">Sign in</Link>
          </div>
        </div>

        <div className="auth-meta-row">
          <div><span className="dot"></span>Bank-grade security</div>
          <div>By signing up you agree to our Terms · Privacy</div>
        </div>
      </div>

      <ArtPanel />
    </div>
  );
}
