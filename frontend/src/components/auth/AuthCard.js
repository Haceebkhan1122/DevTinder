export default function AuthCard({ title, subtitle, children, footer }) {
  return (
    <>
      <div className="card p-6 sm:p-8">
        <h1 className="text-center font-display text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-2 text-center text-sm text-muted">{subtitle}</p>}
        <div className="mt-7">{children}</div>
      </div>
      {footer && <p className="mt-6 text-center text-sm text-muted">{footer}</p>}
    </>
  );
}
