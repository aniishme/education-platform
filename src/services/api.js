export async function api(path, options = {}) {
 const response = await fetch(`/api${path}`, {
  credentials: 'include', ...options,
  headers: { 'Content-Type': 'application/json', ...options.headers },
  body: options.body === undefined ? undefined : JSON.stringify(options.body),
 });
 const data = await response.json().catch(() => ({ message: 'The server returned an invalid response.' }));
 if (!response.ok) {
  if(response.status===401) window.dispatchEvent(new Event('studyflow-session-expired'));
  throw new Error(data.message || 'Unable to complete the request.');
 }
 return data;
}
