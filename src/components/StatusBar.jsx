import { formatLastUpdated } from "../utils/dateUtils";

export default function StatusBar({
  isLoading,
  lastUpdated,
  onRefresh,
  isRefreshing
}) {
  return (
    <section className="panel status-bar">
      <div className="status-group">
        <span>{isLoading ? "Loading events..." : "Dashboard synced"}</span>
      </div>
      <div className="status-group">
        <span>Last updated: {formatLastUpdated(lastUpdated)}</span>
        <span>Auto-refresh: 30s</span>
        <button type="button" onClick={onRefresh} disabled={isRefreshing} className="refresh-button">
          {isRefreshing ? "Refreshing..." : "Refresh"}
        </button>
      </div>
    </section>
  );
}
