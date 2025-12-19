"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  role: "patient" | "parent" | "practitioner" | "admin";
  emailVerified: boolean;
  needsConsent: boolean;
};

export type AuthSessionState = {
  user: SessionUser | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:4000";
export const SESSION_CHANGE_EVENT = "brightpath-session-change";

const parseError = async (response: Response) => {
  try {
    const data = await response.json();
    if (data?.message) {
      if (Array.isArray(data.message)) return data.message.join(" ");
      if (typeof data.message === "string") return data.message;
    }
  } catch (err) {
    return (err as Error).message;
  }
  return response.statusText || "Request failed";
};

const notifySessionChange = () => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });

  if (!response.ok) {
    const message = await parseError(response);
    throw new Error(message || "Request failed");
  }

  return (await response.json()) as T;
};

export async function loginRequest(input: { email: string; password: string }) {
  const result = await request<{ user: SessionUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  notifySessionChange();
  return result;
}

export async function logoutRequest() {
  const result = await request<{ success: boolean }>("/auth/logout", {
    method: "POST",
  });
  notifySessionChange();
  return result;
}

export async function verifyEmailRequest(input: { email: string; token: string }) {
  return request<{ verified: boolean }>("/auth/verify", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function registerRequest(input: { email: string; password: string; name: string; role: SessionUser["role"] }) {
  return request<{ user: SessionUser; verificationToken: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function submitConsentRequest(input: {
  childId?: string;
  childName: string;
  preferredName?: string;
  childDob: string;
  consentKind?: string;
  method: string;
  details?: string;
}) {
  return request<{ child: unknown; consent: unknown }>("/users/consents", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export const useSession = (): AuthSessionState => {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
      if (!response.ok) {
        setUser(null);
        setError(null);
        return;
      }
      const nextUser = (await response.json()) as SessionUser;
      if (!mountedRef.current) return;
      setUser(nextUser);
      setError(null);
    } catch (err) {
      if (!mountedRef.current) return;
      setUser(null);
      setError((err as Error).message);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    refresh();
    const handleFocus = () => refresh();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const handleSessionEvent = () => refresh();

    if (typeof window !== "undefined") {
      window.addEventListener("focus", handleFocus);
      document.addEventListener("visibilitychange", handleVisibility);
      window.addEventListener(SESSION_CHANGE_EVENT, handleSessionEvent);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("focus", handleFocus);
        document.removeEventListener("visibilitychange", handleVisibility);
        window.removeEventListener(SESSION_CHANGE_EVENT, handleSessionEvent);
      }
    };
  }, [refresh]);

  return useMemo(() => ({ user, loading, error, refresh }), [error, loading, refresh, user]);
};
