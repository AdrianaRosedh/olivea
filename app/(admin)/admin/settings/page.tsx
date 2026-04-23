import { redirect } from "next/navigation";

// Settings is handled by the site-settings hub.
export default function SettingsPage() {
  redirect("/admin/site-settings");
}
