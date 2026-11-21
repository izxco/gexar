import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { Cache, CACHE_KEYS } from "@/lib/cache";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string | null;
  isOnboardingComplete: boolean;
}

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

type AuthContextType = {
  session: null;
  status: AuthStatus;
  user: UserProfile;
  userLoading: boolean;
  userError: string | null;
  signOut: () => Promise<void>;
  refetchUser: () => Promise<void>;
  updateProfile: (patch: Partial<UserProfile>) => void;
};

const DEFAULT_PROFILE: UserProfile = {
  id: "gexar-athlete",
  email: "athlete@gexarfit.local",
  fullName: "GEXAR Athlete",
  isOnboardingComplete: true,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile>(() => {
    return Cache.get<UserProfile>(CACHE_KEYS.USER_PROFILE) ?? DEFAULT_PROFILE;
  });

  const updateProfile = useCallback((patch: Partial<UserProfile>) => {
    setUser((prev) => {
      const next = { ...prev, ...patch };
      Cache.set(CACHE_KEYS.USER_PROFILE, next);
      return next;
    });
  }, []);

  const signOut = useCallback(async () => {
    setUser(DEFAULT_PROFILE);
    Cache.set(CACHE_KEYS.USER_PROFILE, DEFAULT_PROFILE);
  }, []);

  const refetchUser = useCallback(async () => {
    const cached = Cache.get<UserProfile>(CACHE_KEYS.USER_PROFILE);
    if (cached) setUser(cached);
  }, []);

  const value: AuthContextType = {
    session: null,
    status: "authenticated",
    user,
    userLoading: false,
    userError: null,
    signOut,
    refetchUser,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
