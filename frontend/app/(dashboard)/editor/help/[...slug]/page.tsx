import { redirect } from "next/navigation";

type EditorHelpRedirectProps = {
  params?: {
    slug?: string[];
  };
};

export default function EditorHelpRedirect({ params }: EditorHelpRedirectProps) {
  const slugPath = params?.slug?.join("/") ?? "";
  redirect(`/author/help/${slugPath}`);
}
