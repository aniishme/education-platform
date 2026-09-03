function ErrorMessage({ message }) {
  return (
    <div className="status-message status-error" role="alert">
      {message}
    </div>
  );
}

export default ErrorMessage;
