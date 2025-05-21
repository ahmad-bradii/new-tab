import EditSettings from "./EditSettings";
import GoogleAppsLauncher from "./GoogleAppsLauncher";
function Header({ action }) {
  return (
    <header className="headerContainer" style={{ padding: "10px" }}>
      <GoogleAppsLauncher />
      <EditSettings action={action} />
    </header>
  );
}

export default Header;
