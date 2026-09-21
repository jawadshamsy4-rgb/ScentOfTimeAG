import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const ADMIN_STORAGE_KEY = "scent_admin_logged_in";

export const useAdminAuth = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return localStorage.getItem(ADMIN_STORAGE_KEY) === "true";
  });
  const [checking, setChecking] = useState<boolean>(true);
  const navigate = useNavigate();
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const verifyAndKeepAlive = useCallback(async () => {
    try {
      // 1. Get current session
      let { data: { session }, error: sessionError } = await supabase.auth.getSession();

      // If session is expired or missing, try refresh
      if (!session || sessionError) {
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        if (!refreshError && refreshData.session) {
          session = refreshData.session;
        }
      }

      if (!session?.user) {
        localStorage.removeItem(ADMIN_STORAGE_KEY);
        setIsAdmin(false);
        setChecking(false);
        navigate("/admin");
        return false;
      }

      // 2. Check if token is nearing expiration (< 15 mins) and proactively refresh
      if (session.expires_at) {
        const now = Math.floor(Date.now() / 1000);
        if (session.expires_at - now < 900) {
          const { data: refreshed } = await supabase.auth.refreshSession();
          if (refreshed.session) {
            session = refreshed.session;
          }
        }
      }

      // 3. Verify admin role using the SECURITY DEFINER RPC has_role or direct user_roles query
      const { data: hasRole, error: rpcError } = await supabase.rpc("has_role", {
        _user_id: session.user.id,
        _role: "admin",
      });

      let roleVerified = hasRole === true;

      // Fallback check if RPC had an issue
      if (rpcError || hasRole === null) {
        const { data: roleRow } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", session.user.id)
          .eq("role", "admin")
          .maybeSingle();

        roleVerified = !!roleRow;
      }

      if (!roleVerified) {
        localStorage.removeItem(ADMIN_STORAGE_KEY);
        setIsAdmin(false);
        setChecking(false);
        navigate("/admin");
        return false;
      }

      // Confirmed Admin
      localStorage.setItem(ADMIN_STORAGE_KEY, "true");
      setIsAdmin(true);
      setChecking(false);
      return true;
    } catch (err) {
      console.error("Admin auth check error:", err);
      // If we previously verified this session in this browser, don't kick them out on temporary network failure
      if (localStorage.getItem(ADMIN_STORAGE_KEY) === "true") {
        setIsAdmin(true);
        setChecking(false);
        return true;
      }
      setChecking(false);
      navigate("/admin");
      return false;
    }
  }, [navigate]);

  useEffect(() => {
    void verifyAndKeepAlive();

    // Heartbeat every 5 minutes to keep Supabase session fresh indefinitely
    refreshIntervalRef.current = setInterval(() => {
      void verifyAndKeepAlive();
    }, 5 * 60 * 1000);

    // Also verify when window comes back into focus
    const onFocus = () => {
      void verifyAndKeepAlive();
    };
    window.addEventListener("focus", onFocus);

    // Listen to Supabase auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT") {
        localStorage.removeItem(ADMIN_STORAGE_KEY);
        setIsAdmin(false);
        navigate("/admin");
      } else if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") {
        if (session) {
          localStorage.setItem(ADMIN_STORAGE_KEY, "true");
          setIsAdmin(true);
        }
      }
    });

    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
      window.removeEventListener("focus", onFocus);
      subscription.unsubscribe();
    };
  }, [verifyAndKeepAlive, navigate]);

  const handleLogout = async () => {
    localStorage.removeItem(ADMIN_STORAGE_KEY);
    setIsAdmin(false);
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Logout error:", err);
    }
    navigate("/admin");
  };

  return { isAdmin, checking, handleLogout, verifyAndKeepAlive };
};
