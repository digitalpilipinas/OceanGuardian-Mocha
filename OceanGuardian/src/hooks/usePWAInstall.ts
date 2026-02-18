
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface IOSNavigator extends Navigator {
    standalone?: boolean;
}

interface InstallPromptWindow extends Window {
    __ogDeferredInstallPrompt?: BeforeInstallPromptEvent | null;
    __ogInstallPromptListenerInitialized?: boolean;
}

const INSTALL_PROMPT_READY_EVENT = "og:install-prompt-ready";
const INSTALL_PROMPT_CLEARED_EVENT = "og:install-prompt-cleared";

function getInstallPromptWindow(): InstallPromptWindow | null {
    return typeof window === "undefined" ? null : (window as InstallPromptWindow);
}

function getCachedDeferredPrompt(): BeforeInstallPromptEvent | null {
    return getInstallPromptWindow()?.__ogDeferredInstallPrompt ?? null;
}

function setCachedDeferredPrompt(promptEvent: BeforeInstallPromptEvent | null) {
    const installWindow = getInstallPromptWindow();
    if (!installWindow) return;
    installWindow.__ogDeferredInstallPrompt = promptEvent;
}

function isInStandaloneMode() {
    if (typeof window === "undefined") return false;

    return (
        window.matchMedia("(display-mode: standalone)").matches ||
        window.matchMedia("(display-mode: fullscreen)").matches ||
        (window.navigator as IOSNavigator).standalone === true ||
        document.referrer.includes("android-app://")
    );
}

function detectIOS() {
    if (typeof navigator === "undefined") return false;

    const userAgentIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const iPadOS = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

    return userAgentIOS || iPadOS;
}

function initializeInstallPromptListener() {
    const installWindow = getInstallPromptWindow();
    if (!installWindow || installWindow.__ogInstallPromptListenerInitialized) return;

    installWindow.__ogInstallPromptListenerInitialized = true;

    window.addEventListener("beforeinstallprompt", (event) => {
        event.preventDefault();
        setCachedDeferredPrompt(event as BeforeInstallPromptEvent);
        window.dispatchEvent(new Event(INSTALL_PROMPT_READY_EVENT));
    });

    window.addEventListener("appinstalled", () => {
        setCachedDeferredPrompt(null);
        window.dispatchEvent(new Event(INSTALL_PROMPT_CLEARED_EVENT));
    });
}

initializeInstallPromptListener();

export function usePWAInstall() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(() =>
        getCachedDeferredPrompt(),
    );
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        setIsIOS(detectIOS());
        setIsStandalone(isInStandaloneMode());
        setDeferredPrompt(getCachedDeferredPrompt());

        const syncDeferredPrompt = () => {
            setDeferredPrompt(getCachedDeferredPrompt());
        };

        const handleInstalled = () => {
            setDeferredPrompt(null);
            setIsStandalone(true);
        };

        const handleDisplayModeChange = () => {
            setIsStandalone(isInStandaloneMode());
        };

        window.addEventListener(INSTALL_PROMPT_READY_EVENT, syncDeferredPrompt);
        window.addEventListener(INSTALL_PROMPT_CLEARED_EVENT, handleInstalled);

        const standaloneMediaQuery = window.matchMedia("(display-mode: standalone)");
        if (typeof standaloneMediaQuery.addEventListener === "function") {
            standaloneMediaQuery.addEventListener("change", handleDisplayModeChange);
        } else {
            standaloneMediaQuery.addListener(handleDisplayModeChange);
        }

        return () => {
            window.removeEventListener(INSTALL_PROMPT_READY_EVENT, syncDeferredPrompt);
            window.removeEventListener(INSTALL_PROMPT_CLEARED_EVENT, handleInstalled);
            if (typeof standaloneMediaQuery.removeEventListener === "function") {
                standaloneMediaQuery.removeEventListener("change", handleDisplayModeChange);
            } else {
                standaloneMediaQuery.removeListener(handleDisplayModeChange);
            }
        };
    }, []);

    const installPWA = async () => {
        const promptEvent = deferredPrompt ?? getCachedDeferredPrompt();
        if (!promptEvent) return;

        // A prompt event is single-use, so clear it before invoking.
        setDeferredPrompt(null);
        setCachedDeferredPrompt(null);

        await promptEvent.prompt();
        await promptEvent.userChoice;
    };

    return { deferredPrompt, isIOS, isStandalone, installPWA };
}
