let closed = false;

export function isSessionClosed() {
  return closed;
}

export function openSession() {
  closed = false;
}

export function endSessionLocally() {
  closed = true;
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("token");
  }
}

export function closeSession() {
  endSessionLocally();
  if (typeof window === "undefined") return;
  if (!window.location.pathname.startsWith("/auth")) {
    window.location.replace("/auth/login");
  }
}
