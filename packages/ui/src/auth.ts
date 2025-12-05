export const AUTH_STORAGE_KEY = "bp-auth-status";
export const AUTH_CHANGE_EVENT = "brightpath-auth-change";

export const readAuthStatus = () => {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(AUTH_STORAGE_KEY) === "true";
};

export const writeAuthStatus = (isLoggedIn: boolean) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, isLoggedIn ? "true" : "false");
  window.dispatchEvent(new Event(AUTH_CHANGE_EVENT));
};
