function SearchBar({ value, onChange }) {
  return (
    <div className="filter-field search-field">
      <label htmlFor="course-search">Search by course title</label>
      <input
        id="course-search"
        type="search"
        placeholder="e.g. React Fundamentals"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export default SearchBar;
