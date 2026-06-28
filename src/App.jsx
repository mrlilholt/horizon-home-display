import { useEffect, useMemo, useState } from "react";
import { AuthError, getUser, handleAuthCallback, login, logout, onAuthChange } from "@netlify/identity";
import AuthPanel from "./components/AuthPanel";
import HeaderBar from "./components/HeaderBar";
import RadioPanel from "./components/RadioPanel";
import StatusBar from "./components/StatusBar";
import TodayAgenda from "./components/TodayAgenda";
import UpcomingEvents from "./components/UpcomingEvents";
import WeekStrip from "./components/WeekStrip";
import { groupEventsByDay, isEventNow, isSameDay, startOfDay } from "./utils/dateUtils";

const POLL_MS = 30000;
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

export default function App() {
  const [now, setNow] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [source, setSource] = useState("mock");
  const [lastUpdated, setLastUpdated] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRadioExpanded, setIsRadioExpanded] = useState(false);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const isLocalMode = LOCAL_HOSTS.has(window.location.hostname);

  async function loadEvents({ silent = false } = {}) {
    if (!isLocalMode && !user) {
      setIsLoading(false);
      return;
    }

    if (silent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const response = await fetch("/api/events");
      if (!response.ok) {
        if (response.status === 401) {
          setUser(null);
          throw new Error("Please sign in to access your calendar.");
        }
        throw new Error(`Calendar request failed with status ${response.status}`);
      }

      const payload = await response.json();
      setEvents(Array.isArray(payload.events) ? payload.events : []);
      setSource(payload.source || "unknown");
      setLastUpdated(payload.lastFetched || new Date().toISOString());
      setError(payload.error || "");
    } catch (requestError) {
      setError(requestError.message || "Unable to reach the backend.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }

  useEffect(() => {
    if (isLocalMode) {
      setAuthReady(true);
      loadEvents();
      return;
    }

    async function initializeAuth() {
      try {
        await handleAuthCallback();
      } catch (callbackError) {
        setAuthError(callbackError.message || "Authentication callback failed.");
      }

      const existingUser = await getUser();
      setUser(existingUser);
      setAuthReady(true);

      if (!existingUser) {
        setIsLoading(false);
      }
    }

    initializeAuth();

    const unsubscribe = onAuthChange((_event, nextUser) => {
      setUser(nextUser || null);
      setAuthError("");
    });

    return () => {
      unsubscribe?.();
    };
  }, [isLocalMode]);

  useEffect(() => {
    if (!isLocalMode && !user) {
      return;
    }

    loadEvents();

    const poller = window.setInterval(() => {
      loadEvents({ silent: true });
    }, POLL_MS);

    return () => {
      window.clearInterval(poller);
    };
  }, [isLocalMode, user]);

  useEffect(() => {
    const ticker = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(ticker);
  }, []);

  const todayEvents = useMemo(() => {
    return events.filter((event) => isSameDay(new Date(event.start), now));
  }, [events, now]);

  const nextEventId = useMemo(() => {
    const nextEvent = events.find((event) => new Date(event.end) >= now && !isEventNow(event, now));
    return nextEvent?.id || "";
  }, [events, now]);

  const groupedUpcoming = useMemo(() => {
    const todayStart = startOfDay(now);
    const upcoming = events.filter((event) => startOfDay(new Date(event.start)) > todayStart);
    const grouped = groupEventsByDay(upcoming);
    return Object.entries(grouped);
  }, [events, now]);

  async function handleSignIn(event) {
    event.preventDefault();
    setIsSigningIn(true);
    setAuthError("");

    try {
      const nextUser = await login(authEmail, authPassword);
      setUser(nextUser);
      setAuthPassword("");
    } catch (signInError) {
      if (signInError instanceof AuthError) {
        setAuthError(signInError.status === 401 ? "Incorrect email or password." : signInError.message);
      } else {
        setAuthError(signInError.message || "Sign in failed.");
      }
    } finally {
      setIsSigningIn(false);
    }
  }

  async function handleLogout() {
    await logout();
    setUser(null);
    setEvents([]);
    setLastUpdated("");
  }

  if (!authReady) {
    return <div className="app-shell app-shell-loading" />;
  }

  if (!isLocalMode && !user) {
    return (
      <AuthPanel
        email={authEmail}
        password={authPassword}
        error={authError}
        isSubmitting={isSigningIn}
        onEmailChange={setAuthEmail}
        onPasswordChange={setAuthPassword}
        onSubmit={handleSignIn}
      />
    );
  }

  return (
    <div className="app-shell">
      <HeaderBar now={now} />
      <StatusBar
        isLoading={isLoading}
        source={source}
        error={error}
        lastUpdated={lastUpdated}
        onRefresh={() => loadEvents({ silent: true })}
        isRefreshing={isRefreshing}
        userEmail={user?.email || ""}
        onLogout={isLocalMode ? null : handleLogout}
      />
      <main className={`main-grid ${isRadioExpanded ? "main-grid-radio-expanded" : ""}`}>
        <section className="left-column">
          <WeekStrip events={events} now={now} />
          <TodayAgenda events={todayEvents} nextEventId={nextEventId} now={now} />
          <UpcomingEvents groupedEntries={groupedUpcoming} nextEventId={nextEventId} now={now} />
        </section>
        <RadioPanel
          isExpanded={isRadioExpanded}
          onToggleExpand={() => setIsRadioExpanded((current) => !current)}
        />
      </main>
    </div>
  );
}
