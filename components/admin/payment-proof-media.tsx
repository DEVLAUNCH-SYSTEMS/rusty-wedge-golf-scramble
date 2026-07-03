type PaymentProofMediaProps = {
  contentType: string | null;
  objectUrl: string;
};

function PaymentProofPdf({ objectUrl }: { objectUrl: string }) {
  return (
    <div className="mt-4 flex flex-col gap-3">
      <iframe
        title="Payment proof PDF"
        src={objectUrl}
        className="h-[480px] w-full rounded-lg border border-slate-200"
      />
      <a
        href={objectUrl}
        target="_blank"
        rel="noreferrer"
        className="text-sm font-medium text-rw-gold-accessible hover:underline"
      >
        Open PDF in new tab
      </a>
    </div>
  );
}

function PaymentProofImage({ objectUrl }: { objectUrl: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={objectUrl}
      alt="Payment proof screenshot"
      className="mt-4 max-h-[480px] w-full rounded-lg border border-slate-200 object-contain"
    />
  );
}

export function PaymentProofMedia({ contentType, objectUrl }: PaymentProofMediaProps) {
  if (contentType === "application/pdf") {
    return <PaymentProofPdf objectUrl={objectUrl} />;
  }

  return <PaymentProofImage objectUrl={objectUrl} />;
}
