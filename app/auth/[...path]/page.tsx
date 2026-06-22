import { AuthViewClient } from "@/components/auth/auth-view-client";

type AuthPageProps = {
  params: Promise<{ path: string[] }>;
};

export default async function AuthPage({ params }: AuthPageProps) {
  const { path } = await params;
  const authPath = path.length > 0 ? path.join("/") : "sign-in";

  return <AuthViewClient path={authPath} />;
}
