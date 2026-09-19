import { useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

function NavSearch() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();

  // mirror the course search on the Courses page, and start empty elsewhere
  const activeSearch = pathname === "/courses" ? searchParams.get("q") ?? "" : "";
  const [query, setQuery] = useState(activeSearch);
  const [syncedSearch, setSyncedSearch] = useState(activeSearch);

  if (syncedSearch !== activeSearch) {
    setSyncedSearch(activeSearch);
    setQuery(activeSearch);
  }

  const handleSubmit = (event) => {
    event.preventDefault();
    const term = query.trim();
    navigate(term ? `/courses?q=${encodeURIComponent(term)}` : "/courses");
  };

  return (
    <form className="nav-search" role="search" onSubmit={handleSubmit}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <label className="visually-hidden" htmlFor="nav-search">
        Search courses
      </label>
      <input
        id="nav-search"
        type="search"
        placeholder="Search courses"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />
    </form>
  );
}

export default NavSearch;
