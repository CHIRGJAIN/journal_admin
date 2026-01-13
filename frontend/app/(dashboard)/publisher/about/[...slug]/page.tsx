import { redirect } from "next/navigation";

type PublisherAboutRedirectProps = {
  params?: {
    slug?: string[];
  };
};

export default function PublisherAboutRedirect({
  params,
}: PublisherAboutRedirectProps) {
  const slugPath = params?.slug?.join("/") ?? "";
  redirect(`/author/about/${slugPath}`);
}
