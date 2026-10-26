export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="card flex animate-fade-up flex-col items-center px-6 py-14 text-center">
      {Icon && (
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-navy-800 text-crimson-300 ring-1 ring-line">
          <Icon className="size-7" />
        </div>
      )}
      <h3 className="font-display text-lg font-semibold text-ink">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-sm text-muted">{description}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
