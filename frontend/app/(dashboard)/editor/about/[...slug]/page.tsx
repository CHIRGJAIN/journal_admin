import { redirect } from "next/navigation";

type EditorAboutRedirectProps = {
  params?: {
    slug?: string[];
  };
};

export default function EditorAboutRedirect({
  params,
}: EditorAboutRedirectProps) {
  const slugPath = params?.slug?.join("/") ?? "";
  redirect(`/author/about/${slugPath}`);
}
