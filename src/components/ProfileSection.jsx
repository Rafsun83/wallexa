import { useUserQuery } from '../hooks/useUser';

function Field({ label, value }) {
  if (!value) return null;
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '13px 0', borderBottom: '1px solid var(--ink-100)',
    }}>
      <span style={{ fontSize: 13, color: 'var(--ink-400)', fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--ink-700)' }}>{value}</span>
    </div>
  );
}

export function ProfileSection() {
  const { data: user, isLoading, error } = useUserQuery();

  const initials = (user?.name || user?.username || 'U')
    .split(' ').map((s) => s[0]).slice(0, 2).join('').toUpperCase();

  return (
    <div style={{ maxWidth: 560 }}>
      <div className="app-top" style={{ marginBottom: 28 }}>
        <div>
          <h1>Account</h1>
          <div className="subtitle">Your profile and account details.</div>
        </div>
      </div>

      {isLoading && (
        <div style={{ color: 'var(--ink-400)', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, padding: '32px 0' }}>
          <span className="spinner" /> Loading profile…
        </div>
      )}

      {error && (
        <div style={{
          color: 'var(--danger-700)', background: 'var(--danger-100)',
          padding: '10px 14px', borderRadius: 8, fontSize: 13,
        }}>
          Failed to load profile: {error.response?.data?.message || error.message}
        </div>
      )}

      {user && (
        <>
          <div style={{
            background: 'var(--ink-50, #f9fafb)', border: '1px solid var(--ink-100)',
            borderRadius: 14, padding: '24px 24px 20px', marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 18,
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'linear-gradient(140deg, var(--brand-600, #4f46e5), var(--brand-400, #818cf8))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, fontWeight: 700, color: '#fff', flexShrink: 0,
            }}>
              {initials}
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--ink-800)' }}>
                {user.name || user.username}
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-400)', marginTop: 2 }}>
                @{user.username}
              </div>
            </div>
          </div>

          <div style={{
            background: '#fff', border: '1px solid var(--ink-100)',
            borderRadius: 14, padding: '4px 20px 8px',
          }}>
            <Field label="Full name" value={user.name} />
            <Field label="Username"  value={user.username} />
            <Field label="Email"     value={user.email} />
            <Field label="Location"  value={user.location} />
          </div>
        </>
      )}
    </div>
  );
}
