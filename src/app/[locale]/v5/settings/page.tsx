import SettingsTemplate from "@/uiux-v5/templates/SettingsTemplate";

export default function SettingsV5() {
  const user = {
    name: "Admin User",
    email: "admin@apexrebate.com"
  };

  return <SettingsTemplate user={user} />;
}