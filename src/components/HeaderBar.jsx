import { formatClock, formatLongDate } from "../utils/dateUtils";

export default function HeaderBar({ now }) {
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
        <div className="date-pill">{formatLongDate(now)}</div>
        <div className="clock">{formatClock(now)}</div>
      </div>
    </header>
  );
}
