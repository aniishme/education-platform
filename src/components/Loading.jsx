function Loading({ message = "Loading..." }) {
  return (
    <div className="status-message" role="status">
      <span className="loading-dot" aria-hidden="true" />
      {message}
    </div>
  );
}

export default Loading;
