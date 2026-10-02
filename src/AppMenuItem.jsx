function AppMenuItem({ iconSrc, label, url }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="app-item">
      <img src={iconSrc} alt="" width={36} height={36} />
      <span>{label}</span>
    </a>
  );
}

export default AppMenuItem;
