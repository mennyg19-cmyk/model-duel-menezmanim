import Link from "next/link";

export default function RegisterSsoCallbackPage() {
  return (
    <main className="auth-shell">
      <div className="auth-card">
        <p className="eyebrow">OAuth callback</p>
        <h1>/register/sso-callback</h1>
        <p className="auth-copy">
          Clerk OAuth must use this catch-all path. Local experiment auth does not complete SSO here;
          configure Clerk keys to enable provider sign-up.
        </p>
        <Link className="button button-primary" href="/register">
          Back to register
        </Link>
      </div>
    </main>
  );
}
