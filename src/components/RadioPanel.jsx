export default function RadioPanel({ isExpanded, onToggleExpand }) {
  return (
    <aside className={`panel radio-panel ${isExpanded ? "radio-panel-expanded" : ""}`}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">Streaming panel</p>
          <h2>Neon Horizon Radio</h2>
          <p className="radio-subtitle">
            {isExpanded ? "Expanded full-page view" : "Compact docked view"}
          </p>
        </div>
        <button type="button" className="radio-toggle-button" onClick={onToggleExpand}>
          {isExpanded ? "Collapse" : "Expand"}
        </button>
      </div>
      <div className={`radio-frame-wrap ${isExpanded ? "" : "radio-frame-wrap-collapsed"}`}>
        {!isExpanded ? (
          <div className="radio-placeholder" aria-hidden="true">
            <img
              src="/neon-horizon-placeholder.png"
              alt=""
              className="radio-placeholder-image"
            />
          </div>
        ) : null}
        <iframe
          title="Neon Horizon Radio"
          src="https://neonhorizonradio.netlify.app/"
          allow="autoplay"
          className={`radio-frame ${isExpanded ? "radio-frame-expanded" : "radio-frame-hidden"}`}
        />
      </div>
    </aside>
  );
}
