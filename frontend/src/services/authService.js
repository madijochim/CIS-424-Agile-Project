/* global __API_BASE__ */
function apiUrl(path) {
  const raw =
    typeof __API_BASE__ !== "undefined" && __API_BASE__ !== ""
      ? String(__API_BASE__).replace(/\/$/, "")
      : "";
  const p = path.startsWith("/") ? path : `/${path}`;
  if (!raw) return p;
  return `${raw}${p}`;
}

export async function registerUser(payload) {
  let response;
  try {
    response = await fetch(apiUrl("/api/auth/register"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      "Cannot reach the API. Start the backend from the backend folder (npm run dev) so it listens on port 5000, then try again."
    );
  }

  let data = {};
  try {
    data = await response.json();
  } catch {
    /* non-JSON body */
  }

  if (!response.ok) {
    const msg = data.error || data.message || "Registration failed.";
    throw new Error(msg);
  }

  return data;
}

export async function loginUser(payload) {
  let response;
  try {
    response = await fetch(apiUrl("/api/auth/login"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });
  } catch {
    throw new Error(
      "Cannot reach the API. Start the backend (npm run dev in the backend folder) on port 5000, then try again."
    );
  }

  let data = {};
  try {
    data = await response.json();
  } catch {
    /* non-JSON body */
  }

  if (!response.ok) {
    const msg = data.error || data.message || "Login failed.";
    throw new Error(msg);
  }

  return data;
}

export async function fetchMe() {
  const response = await fetch(apiUrl("/api/auth/me"), {
    credentials: "include",
  });

  const data = await response.json();
  if (!response.ok) {
    const err = new Error(data.error || "Not authenticated.");
    err.status = response.status;
    throw err;
  }
  return data;
}

export async function logoutUser() {
  await fetch(apiUrl("/api/auth/logout"), {
    method: "POST",
    credentials: "include",
  });
}
