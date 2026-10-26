// All calls to the devTinder backend live here, so pages never deal with fetch details.
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:7777/api/v1";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// GET requests that are on their way right now: path -> Promise
const inFlight = new Map();

// Same GET already in progress? Reuse its promise instead of sending a duplicate network call.
// (Happens when two components need the same data at once, and with React Strict Mode in dev,
// which runs every effect twice.) POST/PATCH are never shared: every click is its own action.
function request(path, options = {}) {
  const method = options.method || "GET";
  if (method !== "GET") {
    return send(path, options);
  }
  if (inFlight.has(path)) {
    return inFlight.get(path);
  }
  const promise = send(path, options).finally(() => inFlight.delete(path));
  inFlight.set(path, promise);
  return promise;
}

async function send(path, { method = "GET", body } = {}) {
  let res;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      // send/receive the httpOnly "token" cookie
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Cannot reach the server. Is the backend running on port 7777?", 0);
  }

  // Backend sometimes sends plain text (e.g. logout), so parse safely
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { message: text };
  }

  if (!res.ok) {
    // Session ended (expired token / password changed): let the auth context know
    if (res.status === 401 && typeof window !== "undefined" && !path.startsWith("/auth/")) {
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
    }
    throw new ApiError(data?.message || "Something went wrong, please try again!", res.status);
  }

  return data;
}

// The backend wraps responses a little differently per route; these helpers return clean data.
export const api = {
  // ---------- auth ----------
  signup: (payload) => request("/auth/signup", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  logout: () => request("/auth/logout", { method: "POST" }),
  forgotPassword: (emailId) => request("/auth/forgot-password", { method: "POST", body: { emailId } }),
  resetPassword: (token, password) =>
    request(`/auth/reset-password/${token}`, { method: "POST", body: { password } }),

  // ---------- profile ----------
  // GET /profile/view returns { data: [user] }
  getProfile: async () => {
    const res = await request("/profile/view");
    return Array.isArray(res?.data) ? res.data[0] : res?.data;
  },
  // PATCH /profile/edit returns { Message, data: user }
  updateProfile: async (fields) => {
    const res = await request("/profile/edit", { method: "PATCH", body: fields });
    return { user: res?.data, message: res?.Message || res?.message };
  },

  // ---------- connection requests ----------
  sendRequest: (status, toUserId) => request(`/request/send/${status}/${toUserId}`, { method: "POST" }),
  reviewRequest: (status, requestId) => request(`/request/review/${status}/${requestId}`, { method: "POST" }),

  // ---------- user ----------
  // GET /user/feed returns a plain array of users
  getFeed: async ({ page = 1, limit = 10 } = {}) => {
    const res = await request(`/user/feed?page=${page}&limit=${limit}`);
    return Array.isArray(res) ? res : res?.data || [];
  },
  getReceivedRequests: async () => (await request("/user/requests/received"))?.data || [],
  getConnections: async () => (await request("/user/connections"))?.data || [],
};
