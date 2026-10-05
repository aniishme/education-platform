export default function StatusBadge({ value }) {
  const labels = {
    PUBLISHED: "Published",
    DRAFT: "Draft",
    active: "Active",
    deactivated: "Inactive",
    ADMIN: "Admin",
    EDUCATOR: "Educator",
    LEARNER: "Learner",
  };
  return (
    <span className={"status-badge badge-" + value.toLowerCase()}>
      {labels[value] || value}
    </span>
  );
}
