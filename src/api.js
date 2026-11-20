async function req(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const api = {
  status: () => req('GET', '/api/status'),
  projects: () => req('GET', '/api/projects'),
  project: (id) => req('GET', `/api/projects/${id}`),
  create: (body) => req('POST', '/api/projects', body),
  remove: (id) => req('DELETE', `/api/projects/${id}`),
  research: (id) => req('POST', `/api/projects/${id}/research`),
  setFinding: (id, fid, status) => req('POST', `/api/projects/${id}/findings/${fid}`, { status }),
  acceptAll: (id) => req('POST', `/api/projects/${id}/accept-recommendations`),
  distill: (id) => req('POST', `/api/projects/${id}/distill`),
  waitlist: (body) => req('POST', '/api/waitlist', body),
};
