export default function WorkspaceHeader({
  eyebrow,
  title,
  description,
  action,
  children,
}) {
  return (
    <header className="workspace-header">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="workspace-description">{description}</p>
        {children}
      </div>
      {action && <div className="workspace-header-action">{action}</div>}
    </header>
  );
}
