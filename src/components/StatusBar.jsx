import { formatLastUpdated } from "../utils/dateUtils";

export default function StatusBar({
  isLoading,
  source,
  error,
  lastUpdated,
  onRefresh,
  isRefreshing,
  userEmail,
  onLogout
}) {
  return (
    <section className="panel status-bar">
      <div className="status-group">
        <span className={`status-dot ${error ? "status-dot-error" : "status-dot-ok"}`} />
        <span>{isLoading ? "Loading events..." : error ? error : `Source: ${source}`}</span>
      </div>
      <div className="status-group">
        {userEmail ? <span>Signed in: {userEmail}</span> : null}
        <span>Last updated: {formatLastUpdated(lastUpdated)}</span>
        <span>Auto-refresh: 30s</span>
        <button type="button" onClick={onRefresh} disabled={isRefreshing} className="refresh-button">
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
        {onLogout ? (
          <button type="button" onClick={onLogout} className="logout-button">
            Sign out
          </button>
        ) : null}
      </div>
    </section>
  );
}
