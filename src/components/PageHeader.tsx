import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  className,
  children,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className={cn("mb-8", className)} data-reveal>
      <h1 className="text-balance text-[clamp(28px,5vw,48px)] leading-tight">
        {title}
      </h1>
      {description && (
        <p className="mt-3 max-w-reading text-[15px] text-text-muted">
          {description}
        </p>
      )}
      {children}
    </header>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass rounded-card p-8 text-center text-sm text-text-muted">
      {children}
    </div>
  );
}
