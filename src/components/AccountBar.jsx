export default function AccountBar({ userEmail, source, error, onManagePassword, onLogout }) {
  return (
    <footer className="panel account-bar">
      <div className="status-group">
        <span className={`status-dot ${error ? "status-dot-error" : "status-dot-ok"}`} />
        <span>{error ? error : `Source: ${source}`}</span>
      </div>
      <div className="status-group">
        <span>Signed in: {userEmail}</span>
      </div>
      <div className="status-group">
        <button type="button" onClick={onManagePassword} className="logout-button">
          Set password
        </button>
        <button type="button" onClick={onLogout} className="logout-button">
          Sign out
        </button>
      </div>
    </footer>
  );
}
