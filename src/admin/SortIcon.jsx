// A neutral double-arrow on an unsorted column, a single arrow once it's active.
function SortIcon({ direction }) {
  return (
    <span className={`admin-sort-icon${direction ? " active" : ""}`} aria-hidden="true">
      {direction === "desc" ? "↓" : direction === "asc" ? "↑" : "↕"}
    </span>
  );
}

export default SortIcon;
