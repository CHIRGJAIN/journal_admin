import { redirect } from "next/navigation";

type ReviewerAboutRedirectProps = {
  params?: {
    slug?: string[];
  };
};

export default function ReviewerAboutRedirect({
  params,
}: ReviewerAboutRedirectProps) {
  const slugPath = params?.slug?.join("/") ?? "";
  redirect(`/author/about/${slugPath}`);
}
