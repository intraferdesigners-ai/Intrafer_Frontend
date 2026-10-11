// Public project pages (/projects/[projectId]/) in the sitemap. Pure apart
// from the injectable fetch, so scripts/testProjectSitemap.mjs can run it
// with a mocked API.
//
// Source: GET /public/gallery?page=&limit= — the paginated branch of the
// same endpoint /recent-projects and /gallery use, with exactly the filter
// GET /public/projects/:id (the page's own fetch) applies: isPublished and
// moderationStatus 'approved'. Sorted (completedYear, _id), so paging is
// stable. 50 per page is the backend's paginate() maximum.

const PAGE_SIZE = 50;
export const MAX_PROJECTS = 5000;
export const PROJECT_PRIORITY = 0.6;
const OBJECT_ID = /^[a-f0-9]{24}$/i;

// Every public project, or null on any failure (network, non-ok status,
// malformed body) after one retry per page — the caller then simply
// leaves projects out, like the other groups' fallbacks. Stops at
// MAX_PROJECTS and reports `truncated`.
export async function fetchPublicProjects(api, fetchOptions, fetchImpl = fetch, { sleep = (ms) => new Promise((r) => setTimeout(r, ms)) } = {}) {
  const projects = [];
  const maxPages = Math.ceil(MAX_PROJECTS / PAGE_SIZE);
  try {
    for (let page = 1; page <= maxPages; page += 1) {
      let json = null;
      for (let attempt = 1; attempt <= 2 && !json; attempt += 1) {
        try {
          const res = await fetchImpl(`${api}/public/gallery?page=${page}&limit=${PAGE_SIZE}`, fetchOptions);
          if (!res.ok) throw new Error(`GET /public/gallery failed: ${res.status}`);
          json = await res.json();
        } catch (err) {
          if (attempt === 2) throw err;
          await sleep(300);
        }
      }
      const pageProjects = json?.data?.projects;
      if (!Array.isArray(pageProjects)) return null;
      projects.push(...pageProjects);
      const totalPages = json.data.totalPages || 1;
      if (page >= totalPages || pageProjects.length === 0) {
        return { projects, truncated: false };
      }
    }
    return { projects: projects.slice(0, MAX_PROJECTS), truncated: true };
  } catch {
    return null;
  }
}

// A project the page renders with 200 and indexes: published, approved
// (re-checked rather than trusting the endpoint's filter) and with its
// vendor still there — the page shows "Project not found" without one.
export function isPublicProject(p) {
  const vendorId = p?.vendorId && typeof p.vendorId === 'object' ? p.vendorId._id : p?.vendorId;
  return Boolean(p && typeof p._id === 'string' && OBJECT_ID.test(p._id)
    && p.isPublished === true && p.moderationStatus === 'approved' && vendorId);
}

// -> sitemap entries in the page's canonical form, `${baseUrl}/projects/<id>/`,
// lastModified from updatedAt (fallback createdAt, then `now`), deduped.
export function projectEntries(projects, baseUrl, now) {
  if (!Array.isArray(projects)) return [];
  const seen = new Set();
  const entries = [];
  for (const p of projects) {
    if (!isPublicProject(p)) continue;
    const url = `${baseUrl}/projects/${p._id}/`;
    if (seen.has(url)) continue;
    seen.add(url);
    const stamp = p.updatedAt || p.createdAt;
    const date = stamp ? new Date(stamp) : null;
    entries.push({
      url,
      lastModified: date && !Number.isNaN(date.getTime()) ? date.toISOString() : now,
      priority: PROJECT_PRIORITY,
    });
  }
  return entries;
}
