import { formatClock, formatLongDate } from "../utils/dateUtils";

export default function HeaderBar({ now, onAddEvent }) {
  return (
    <header className="header-bar panel">
      <div>
        <p className="eyebrow">Home Dashboard</p>
        <img
          src="/lilholt-home-hub.png"
          alt="Lilholt Home Hub"
          className="header-logo-image"
        />
      </div>
      <div className="header-meta">
        <button type="button" className="header-action-button" onClick={onAddEvent}>
          Add Event
        </button>
        <div className="date-pill">{formatLongDate(now)}</div>
        <div className="clock">{formatClock(now)}</div>
      </div>
    </header>
  );
}
