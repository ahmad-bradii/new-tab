function AppMenuItem({ iconSrc, label, url }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="app-menu-item"
      title={label}
    >
      {/* You might want a container div if you need more complex icon styling */}
      <img src={iconSrc} alt={label} className="app-icon" />
      <span className="app-label">{label}</span>
    </a>
  );
}

export default AppMenuItem;
