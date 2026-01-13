import { redirect } from "next/navigation";

export default function ReviewerSettingsRedirect() {
  redirect("/author/settings");
}
