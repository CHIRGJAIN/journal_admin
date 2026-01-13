import { redirect } from "next/navigation";

export default function PublisherSettingsRedirect() {
  redirect("/author/settings");
}
