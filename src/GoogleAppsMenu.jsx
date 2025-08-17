import AppMenuItem from "./AppMenuItem";

// Sample Data - Now with actual URLs
const appsData = [
  {
    id: "account",
    label: "Account",
    iconSrc:
      "https://www.google.com/s2/favicons?domain=myaccount.google.com&sz=128",
    url: "https://myaccount.google.com/",
  },
  {
    id: "drive",
    label: "Drive",
    iconSrc:
      "https://www.google.com/s2/favicons?domain=drive.google.com&sz=128",
    url: "https://drive.google.com/",
  },
  {
    id: "gmail",
    label: "Gmail",
    iconSrc:
      "https://t0.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://mail.google.com/&size=128",
    url: "https://mail.google.com/",
  },
  {
    id: "youtube",
    label: "YouTube",
    iconSrc: "https://www.google.com/s2/favicons?domain=youtube.com&sz=128",
    url: "https://www.youtube.com/",
  },
  {
    id: "gemini",
    label: "Gemini",
    iconSrc:
      "https://www.google.com/s2/favicons?domain=gemini.google.com&sz=128",
    url: "https://gemini.google.com/",
  },
  {
    id: "maps",
    label: "Maps",
    iconSrc: "https://www.google.com/s2/favicons?domain=maps.google.com&sz=128",
    url: "https://maps.google.com/",
  },
  {
    id: "search",
    label: "Search",
    iconSrc: "https://www.google.com/s2/favicons?domain=google.com&sz=128",
    url: "https://www.google.com/",
  },
  {
    id: "calendar",
    label: "Calendar",
    iconSrc:
      "https://www.google.com/s2/favicons?domain=calendar.google.com&sz=128",
    url: "https://calendar.google.com/",
  },
  {
    id: "news",
    label: "News",
    iconSrc: "https://www.google.com/s2/favicons?domain=news.google.com&sz=128",
    url: "https://news.google.com/",
  },
  {
    id: "photos",
    label: "Photos",
    iconSrc:
      "https://www.google.com/s2/favicons?domain=photos.google.com&sz=128",
    url: "https://photos.google.com/",
  },
  {
    id: "meet",
    label: "Meet",
    iconSrc: "https://www.google.com/s2/favicons?domain=meet.google.com&sz=128",
    url: "https://meet.google.com/",
  },
  {
    id: "translate",
    label: "Translate",
    iconSrc:
      "https://www.google.com/s2/favicons?domain=translate.google.com&sz=128",
    url: "https://translate.google.com/",
  },
  // Add other apps as needed (Docs, Sheets, etc.)
];

function GoogleAppsMenu() {
  return (
    <div className="google-apps-menu-container">
      <div className="google-apps-menu">
        {appsData.map((app) => (
          <AppMenuItem
            key={app.id}
            iconSrc={app.iconSrc}
            label={app.label}
            url={app.url}
          />
        ))}
        {/* You could add a "More from Google" link here */}
      </div>
    </div>
  );
}

export default GoogleAppsMenu;
