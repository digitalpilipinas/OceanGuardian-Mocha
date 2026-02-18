import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";
import type { UserProfile } from "@/shared/types";

interface UserProfileContextValue {
    profile: UserProfile | null;
    loading: boolean;
    refresh: () => Promise<UserProfile | null>;
    logout: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextValue | null>(null);
let profileCache: UserProfile | null | undefined = undefined;
let profileRequest: Promise<UserProfile | null> | null = null;

async function fetchProfileRequest(): Promise<UserProfile | null> {
    if (!profileRequest) {
        profileRequest = (async () => {
            try {
                const res = await fetch("/api/auth/me");
                if (!res.ok) {
                    return null;
                }

                const data = await res.json();
                return (data.user ?? null) as UserProfile | null;
            } catch (error) {
                console.error("Failed to fetch profile", error);
                return null;
            } finally {
                profileRequest = null;
            }
        })();
    }

    return profileRequest;
}

export function UserProfileProvider({ children }: { children: ReactNode }) {
    const [profile, setProfile] = useState<UserProfile | null>(() => profileCache ?? null);
    const [loading, setLoading] = useState(() => profileCache === undefined);

    const fetchProfile = useCallback(async () => {
        setLoading(true);
        const nextProfile = await fetchProfileRequest();
        profileCache = nextProfile;
        setProfile(nextProfile);
        setLoading(false);
        return nextProfile;
    }, []);

    useEffect(() => {
        if (profileCache === undefined) {
            void fetchProfile();
        } else {
            setProfile(profileCache);
            setLoading(false);
        }

        const handleRefresh = () => {
            void fetchProfile();
        };

        window.addEventListener("og:user-data-refresh", handleRefresh);

        return () => {
            window.removeEventListener("og:user-data-refresh", handleRefresh);
        };
    }, [fetchProfile]);

    const logout = useCallback(async () => {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            profileCache = null;
            setProfile(null);
            window.location.href = "/login";
        }
    }, []);

    const value = useMemo<UserProfileContextValue>(
        () => ({ profile, loading, refresh: fetchProfile, logout }),
        [profile, loading, fetchProfile, logout]
    );

    return (
        <UserProfileContext.Provider value={value}>
            {children}
        </UserProfileContext.Provider>
    );
}

function useStandaloneUserProfile(disabled: boolean): UserProfileContextValue {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(!disabled);

    const fetchProfile = useCallback(async () => {
        if (disabled) return null;
        setLoading(true);
        const nextProfile = await fetchProfileRequest();
        setProfile(nextProfile);
        setLoading(false);
        return nextProfile;
    }, [disabled]);

    useEffect(() => {
        if (disabled) {
            setLoading(false);
            return;
        }

        void fetchProfile();

        const handleRefresh = () => {
            void fetchProfile();
        };

        window.addEventListener("og:user-data-refresh", handleRefresh);
        return () => {
            window.removeEventListener("og:user-data-refresh", handleRefresh);
        };
    }, [disabled, fetchProfile]);

    const logout = useCallback(async () => {
        if (disabled) return;
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            setProfile(null);
            window.location.href = "/login";
        }
    }, [disabled]);

    return { profile, loading, refresh: fetchProfile, logout };
}

export function useUserProfile() {
    const ctx = useContext(UserProfileContext);
    const standalone = useStandaloneUserProfile(Boolean(ctx));
    return ctx ?? standalone;
}
