(() => {
  const SUPABASE_MODULE_URL = "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

  let clientPromise = null;

  const getConfig = () => ({
    url: String(window.SB_SUPABASE_URL || "").trim().replace(/\/+$/, ""),
    publishableKey: String(window.SB_SUPABASE_PUBLISHABLE_KEY || "").trim(),
    redirectUrl: String(window.SB_AUTH_REDIRECT_URL || "").trim(),
  });

  const isConfigured = () => {
    const cfg = getConfig();
    return !!(cfg.url && cfg.publishableKey && !cfg.publishableKey.includes("REPLACE_WITH"));
  };

  const getClient = async () => {
    if (!isConfigured()) {
      throw new Error("Supabase auth is not configured.");
    }
    if (!clientPromise) {
      clientPromise = import(SUPABASE_MODULE_URL).then(({ createClient }) => {
        const cfg = getConfig();
        return createClient(cfg.url, cfg.publishableKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        });
      });
    }
    return clientPromise;
  };

  const getSession = async () => {
    if (!isConfigured()) return null;
    const client = await getClient();
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    return data?.session || null;
  };

  const getAccessToken = async () => {
    const session = await getSession();
    return session?.access_token || "";
  };

  const getUser = async () => {
    const session = await getSession();
    return session?.user || null;
  };

  const signInWithOtp = async (email) => {
    const client = await getClient();
    const cfg = getConfig();
    const normalized = String(email || "").trim().toLowerCase();
    if (!normalized) {
      throw new Error("Email is required.");
    }
    const { error } = await client.auth.signInWithOtp({
      email: normalized,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: cfg.redirectUrl || undefined,
      },
    });
    if (error) throw error;
    return true;
  };

  const signOut = async () => {
    if (!isConfigured()) return;
    const client = await getClient();
    const { error } = await client.auth.signOut();
    if (error) throw error;
  };

  const authFetch = async (input, init = {}) => {
    const headers = new Headers(init.headers || {});
    const token = await getAccessToken();
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return fetch(input, {
      ...init,
      headers,
      credentials: init.credentials || "same-origin",
    });
  };

  const authJson = async (input, init = {}) => {
    const res = await authFetch(input, init);
    const text = await res.text();
    let data = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch (_err) {
      data = { raw: text };
    }
    if (!res.ok) {
      const msg = data.detail || data.error || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    return data;
  };

  const redirectToAuth = () => {
    if (window.location.pathname.endsWith("/auth.html") || window.location.pathname.endsWith("auth.html")) {
      return;
    }
    window.location.href = "auth.html";
  };

  window.SBAuth = {
    isConfigured,
    getClient,
    getSession,
    getAccessToken,
    getUser,
    signInWithOtp,
    signOut,
    fetch: authFetch,
    json: authJson,
    redirectToAuth,
  };
})();
