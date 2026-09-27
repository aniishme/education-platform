import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { getRole } from "../utils/auth";

function NavSearch() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const isAdmin = getRole() === "admin";

  // admins search their own catalogue and account list instead of the learner course page;
  // stay on Manage Users while already there, otherwise default to Manage Courses
  const targetPath = isAdmin ? (pathname === "/admin/users" ? "/admin/users" : "/admin/courses") : "/courses";
  const placeholder = isAdmin ? "Search courses or users" : "Search courses";

  // mirror the search on whichever page it targets, and start empty elsewhere
  const activeSearch = pathname === targetPath ? searchParams.get("q") ?? "" : "";
  const [query, setQuery] = useState(activeSearch);
  const [syncedSearch, setSyncedSearch] = useState(activeSearch);

  if (syncedSearch !== activeSearch) {
    setSyncedSearch(activeSearch);
    setQuery(activeSearch);
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const term = query.trim();
    navigate(term ? `${targetPath}?q=${encodeURIComponent(term)}` : targetPath);
  };

  return (
    <form className="nav-search" role="search" onSubmit={handleSubmit}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <label className="visually-hidden" htmlFor="nav-search">
        {placeholder}
      </label>
      <input
        id="nav-search"
        type="search"
        placeholder={placeholder}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
    </form>
  );
}

export default NavSearch;
