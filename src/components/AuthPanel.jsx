export default function AuthPanel({
  email,
  password,
  error,
  isSubmitting,
  onEmailChange,
  onPasswordChange,
  onSubmit
}) {
  return (
    <main className="auth-shell">
      <section className="panel auth-panel">
        <p className="eyebrow">Private Access</p>
        <h1>Horizon Home Display</h1>
        <p className="auth-copy">
          This dashboard is publicly hosted but privately gated. Sign in to load your calendars and radio panel.
        </p>
        <form className="auth-form" onSubmit={onSubmit}>
          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label className="auth-field">
            <span>Password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => onPasswordChange(event.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {error ? <p className="auth-error">{error}</p> : null}
          <button type="submit" className="refresh-button auth-submit" disabled={isSubmitting}>
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </section>
    </main>
  );
}
