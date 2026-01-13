import { redirect } from "next/navigation";

type PublisherHelpRedirectProps = {
  params?: {
    slug?: string[];
  };
};

export default function PublisherHelpRedirect({
  params,
}: PublisherHelpRedirectProps) {
  const slugPath = params?.slug?.join("/") ?? "";
  redirect(`/author/help/${slugPath}`);
}
