import { redirect } from "next/navigation";

type ReviewerHelpRedirectProps = {
  params?: {
    slug?: string[];
  };
};

export default function ReviewerHelpRedirect({
  params,
}: ReviewerHelpRedirectProps) {
  const slugPath = params?.slug?.join("/") ?? "";
  redirect(`/author/help/${slugPath}`);
}
