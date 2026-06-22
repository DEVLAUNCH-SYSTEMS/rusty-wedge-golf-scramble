type HeaderEntry = {
  key: string;
  value: string;
};

type HeaderGroup = {
  source: string;
  headers: HeaderEntry[];
};

const BASELINE_CSP = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https:",
].join("; ");

export const securityHeaderGroups: HeaderGroup[] = [
  {
    source: "/:path*",
    headers: [
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "X-Frame-Options",
        value: "DENY",
      },
      {
        key: "Content-Security-Policy",
        value: BASELINE_CSP,
      },
    ],
  },
  {
    source: "/admin/:path*",
    headers: [
      {
        key: "Cache-Control",
        value: "no-store",
      },
      {
        key: "X-Robots-Tag",
        value: "noindex, nofollow",
      },
    ],
  },
  {
    source: "/api/admin/payment-proofs/:path*",
    headers: [
      {
        key: "Cache-Control",
        value: "no-store",
      },
      {
        key: "X-Robots-Tag",
        value: "noindex, nofollow",
      },
    ],
  },
];
