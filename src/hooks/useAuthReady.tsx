import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { resetClientSession } from "@/lib/supabase-resilience";

interface AuthReadyState {
  isReady: boolean;
  authKey: string;
}

const AuthReadyContext = createContext<AuthReadyState>({ isReady: false, authKey: "boot" });

export const AuthReadyProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<AuthReadyState>({ isReady: false, authKey: "boot" });

  useEffect(() => {
    let isMounted = true;

    const restoreSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!isMounted) return;
        setState({ isReady: true, authKey: session?.user?.id ?? "anon" });
      } catch {
        if (!isMounted) return;
        setState({ isReady: true, authKey: "anon" });
      }
    };

    void restoreSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      setState({ isReady: true, authKey: session?.user?.id ?? "anon" });
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return <AuthReadyContext.Provider value={state}>{children}</AuthReadyContext.Provider>;
};

export const useAuthReady = () => useContext(AuthReadyContext);
