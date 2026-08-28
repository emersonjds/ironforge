# IronForge (mobile) Detect Map

- **Scope:** A full project scan of the `ironforge` mobile app (Expo/React Native), focused review requested on local storage, `EXPO_PUBLIC_*` config, deep links, transport, video playback, logging, and dependencies.
- **Mapped:** 2026-08-27

## Findings

### Session tokens and profile data persisted unencrypted

- **What it is:** The authentication store keeps the access token, the full user object (id, email, display name, avatar), and the athlete profile in a Zustand store persisted to AsyncStorage in plain JSON. The login response also returns a refresh token, which is read and validated but then dropped: it is never stored or used, so there is no session-renewal path, only a single long-lived access token kept indefinitely.
- **Why it matters:** AsyncStorage is unencrypted device storage. Anyone with filesystem access to the device (a lost/stolen phone, a cloud backup extraction, another app on a rooted/jailbroken device, or a debugging tool) can read the token and impersonate the user, and read their email and profile without needing to break anything. Because there is no refresh token, the only way to end a session server-side is a full logout; a copied token stays valid until it expires or the account is force-logged-out server-side.
- **Evidence:** the `useAuthStore` persisted state and its `persist`/`createJSONStorage(() => AsyncStorage)` config, and the `loginWithPassword` action, which destructures only `accessToken` and `user` from the login response and discards `refreshToken`.

### Health and training data cached unencrypted and not purged on logout

- **What it is:** Workout sessions (sets, weights, reps, RIR, bodyweight), load-history entries per exercise, and finished-session history are all written to AsyncStorage in plain JSON, keyed by athlete ID. None of these keys are cleared when a user signs out.
- **Why it matters:** This is health/body data, which carries heightened sensitivity under LGPD. Storing it unencrypted has the same device-compromise exposure as the token finding above, and because sign-out never purges these keys, a previous account's full training history remains readable on a shared or resold device even after a different user logs in.
- **Evidence:** the load-history store's `readFromStorage`/`writeToStorage` helpers, the active-session store's persisted state, and the session-history and last-finished-session hooks, all writing through `AsyncStorage.setItem` with no encryption layer; the `signOut` action in the auth store, which resets only auth-related state.

### Dev-account demo password is gated in the UI only, not in the data it ships

- **What it is:** The literal demo password was removed from source (now read from `EXPO_PUBLIC_DEV_ACCOUNT_PASSWORD`), and the picker component that lists the demo accounts only renders under `__DEV__`. But the module that builds the `DEV_ACCOUNTS` array (with the plaintext password and both demo emails) computes it unconditionally from the env var — it does not itself check `__DEV__`.
- **Why it matters:** `EXPO_PUBLIC_*` values are inlined into the JS bundle at build time in every build, dev or release. The `__DEV__` check only hides the UI; it does not stop the array (and the password inside it) from being compiled into a release bundle if the environment variable happens to be set when a production build runs (a leaked CI secret, a developer running `eas build --profile production` locally with their `.env` loaded). Today this is prevented only by convention (a comment telling developers never to set it in production), not by code.
- **Evidence:** `DEV_ACCOUNTS` array construction, built from `EXPO_PUBLIC_DEV_ACCOUNT_PASSWORD` with no `__DEV__` guard; the guard lives one layer up, in the picker component that renders it.

### `.env` is not fully excluded from version control

- **What it is:** `.gitignore` excludes `.env*.local` but not the plain `.env` file, which is the default filename Expo loads and the one a developer would naturally create from `.env.example`.
- **Why it matters:** A real `.env` (potentially holding a non-placeholder `EXPO_PUBLIC_API_URL` pointing at internal infrastructure, or a real `EXPO_PUBLIC_DEV_ACCOUNT_PASSWORD`) can be committed by accident, since git will not silently skip it. No `.env` is committed today, but the guardrail that should prevent it is missing.
- **Evidence:** the repository's `.gitignore`, whose only env-related rule is `.env*.local`.

### Production API base URL has no enforced or validated source

- **What it is:** `resolveApiBaseUrl` picks `EXPO_PUBLIC_API_URL` if set, otherwise derives a URL from the Expo bundler's `hostUri`, and if neither is present, falls back unconditionally to a hardcoded `http://localhost:3333` (or `http://10.0.2.2:3333` on Android). None of these branches check `__DEV__`, and there is no boot-time validation that fails loudly when the production-required `EXPO_PUBLIC_API_URL` is absent.
- **Why it matters:** The fallback is dev-only by convention (the `.env.example` comment says the variable is "required in production builds"), but nothing in the code enforces that. If a release build ever ships without the variable set (a CI misconfiguration, a missed EAS secret), the app silently targets a hardcoded, cleartext `localhost` URL instead of failing at boot with a clear error — on iOS in particular, nothing blocks that request from being attempted. This turns a build-config mistake into a silent, hard-to-diagnose outage or, on a platform/config where cleartext isn't blocked by default, a cleartext request path in production.
- **Evidence:** `resolveApiBaseUrl`'s fallback chain in the shared API client's base-URL resolution, called unconditionally at module load with no environment check.

### Externally sourced URLs opened without a host allowlist

- **What it is:** The exercise-demo video player opens a YouTube "watch" URL via `Linking.openURL`, and the coach-guidance screen opens the web panel URL the same way. Both URLs are validated only for well-formedness (Zod `.url()`, or a plain env-var string with no format check at all for the web panel URL), not for which host they point to.
- **Why it matters:** These URLs originate from the API response (video watch URL) or from `EXPO_PUBLIC_WEB_PANEL_URL` (no validation at all beyond being a non-empty string). If the API response is tampered with (a compromised backend, a MITM on a connection that isn't pinned) or the env var is misconfigured, the app will open whatever URL it is given in the external browser with no scheme/host check, which is exactly the deep-link/URL-handling gap the OWASP Mobile guidance calls out for `Linking.openURL`.
- **Evidence:** the `YoutubePlayer` component's fallback button, which calls `Linking.openURL(watchUrl)` with the API-supplied `watchUrl`; the coach-guidance screen's `Linking.openURL(WEB_PANEL_URL)`, where `WEB_PANEL_URL` falls back to `process.env.EXPO_PUBLIC_WEB_PANEL_URL ?? "https://ironforge.app"` with no format or host validation.

### Invite deep link accepts a client-only token with no backend round trip

- **What it is:** The `(auth)/invite` screen reads a `token` query param from the incoming deep link (`ironforge://invite?token=…` or the equivalent Expo Router web/universal link) and resolves it against a static, hardcoded in-app table (`MOCK_TOKENS`) rather than calling the backend. "Accepting" the invite navigates straight to onboarding without any network request.
- **Why it matters:** A deep link's query params are attacker-controlled by definition — anyone can craft an `ironforge://invite?token=...` link. Today the blast radius is limited because the token table is a fixed, hardcoded mock and accepting the invite performs no real state change (a comment marks this as a mock pending real backend integration). But as shipped, the flow does not validate the deep link's `token` against any source of truth, and if this ships to production before the backend wiring lands, any link with a guessed or shared token string will render a coach's name, avatar, and bio, and let a user "accept" it with no verification of authenticity or expiry beyond a client-computed 48h TTL.
- **Evidence:** the invite screen's `useEffect`, which calls `decodeMockInviteToken(token)` from the local search params and transitions state to `ready`/`accepting` without an API call; the mock token table in the invite entity's token-decoding helper.

### No code signing configured for OTA updates

- **What it is:** `app.json` configures `expo-updates` with an update URL (`updates.url`) but no `codeSigningCertificate`/`codeSigningMetadata`.
- **Why it matters:** Without code signing, the on-device integrity check for an OTA JS update relies entirely on TLS to the update server and on who can push to the EAS project — there is no on-device signature verification that the update actually came from IronForge. A compromised EAS/CI credential (or a misdirected update channel) could push arbitrary JavaScript that runs with the full privileges of the installed app, including access to the AsyncStorage-held token and health data noted above.
- **Evidence:** the `expo` block's `updates` key in `app.json`, which sets only `url`.

### Camera/photo-library permissions requested for a feature not yet implemented

- **What it is:** `app.json`'s `expo-image-picker` plugin config declares camera and photo-library permission strings, but no code in `src/` or `app/` currently calls `expo-image-picker` or `expo-file-system`.
- **Why it matters:** The permission entitlement ships in the app regardless of whether the feature is live, which is unnecessary attack/review surface (and an unnecessary prompt-eligibility) for a capability the current build never exercises. Low impact today, but worth tracking so the permission is either used or removed before release rather than carried indefinitely.
- **Evidence:** the `expo-image-picker` plugin block in `app.json`'s `plugins` array; no `ImagePicker`/`FileSystem` import exists anywhere under `src/` or `app/`.

### The externalized dev-account password is still a plaintext literal in the repository

- **What it is:** The dev-only demo password was moved out of `src/` into `EXPO_PUBLIC_DEV_ACCOUNT_PASSWORD`, and a test asserts the literal string no longer appears anywhere under `src/`. But the same literal value is hardcoded as a constant inside the test file that performs that scan, which lives under `tests/`, outside the scanned directory.
- **Why it matters:** This is the direct answer to "does the fix close the hole": it does not. The real password is still committed to the repository in clear text, just relocated from `src/` to `tests/`, and the test that is supposed to guard against exactly this keeps it in scope-adjacent code where nobody thought to re-check. Anyone with read access to the repo (a contractor, a leaked clone, a public fork, git history after a future rewrite) gets the working password for the seeded `athlete-demo`/`coach-demo` backend accounts without needing the env var at all. Whether those accounts are reachable against a production backend cannot be confirmed from this repository, but nothing in this repo prevents it.
- **Evidence:** the `DEV_PASSWORD` constant in the source-scanning test under `tests/unit/features/auth/`, which holds the real value and is only compared against files under `src/`, never checked against itself or against `tests/`.

### Authenticated route groups have no client-side session guard, so a deep link reaches them directly

- **What it is:** Auth-gating exists only as a `Redirect` computed once at the app's root route (`/`), based on `resolveRootRoute(isAuthenticated, hasCompletedOnboarding, role)`. None of the screens inside the `(app)` tab group (dashboard, workouts, progress, history, profile) or the `(workout)` stack (preview, logger, summary, exercise sheet) check `isAuthenticated` themselves, at the screen or layout level.
- **Why it matters:** Expo Router resolves a deep link (`ironforge://workouts`, a notification payload, a universal link, or `router.push` from anywhere) straight to the matching file-based route, bypassing the root `index.tsx` redirect entirely — that guard only runs when the app is opened at `/`. Combined with the AsyncStorage-backed hooks (`useSessionHistory`, `useLastFinishedSession`) that read local workout/health history with no dependency on the auth store at all, and with `signOut` never purging those same keys (see the health-data finding above), a deep link into `(app)/history` or `(app)/index` after logout — or crafted while logged out — renders real cached training data with zero authentication check in the client. Screens that call the API (`useAssignments`, `useExercises`) still fail closed because the backend rejects the missing/expired token, but the local-only screens do not.
- **Evidence:** `app/index.tsx`'s `Redirect` is the only place `isAuthenticated` gates navigation; `app/(app)/_layout.tsx` and `app/(workout)/_layout.tsx` wrap their screens in a plain `Tabs`/`Stack` with no auth check; `app/(app)/index.tsx`, `workouts.tsx`, `progress.tsx`, and `history.tsx` render unconditionally and read `useSessionHistory`/`useLastFinishedSession` directly from AsyncStorage.

## Applied sub-skills

- `.lagune/skills/regex.md`: ran the deterministic ReDoS scanner over `src/` and `app/` — clean, no unsafe patterns, no finding.
- `.lagune/skills/secrets.md`: ran the deterministic hardcoded-secret scanner over the whole project — two leads, both reviewed and confirmed false positives (a mock invite-token key in the invite entity, and MSW test fixture tokens in `tests/msw/auth-handlers.ts`), no finding.
- `.lagune/skills/transport.md`: confirmed no ATS exception in `app.json`, no cleartext override, and traced the dev host-detection fallback — surfaced "Production API base URL has no enforced or validated source".
- `.lagune/skills/javascript.md`: checked for eval/dynamic execution, prototype-pollution-prone merges, and unsafe deserialization — none found; AsyncStorage reads for load-history and the active session are schema-validated with Zod before use, the auth store's rehydration is not.
- `.lagune/skills/access-control.md`: reviewed session integrity and client-side role gating — confirmed `resolveRootRoute`/role checks are UI routing only, not a substitute for server-side authorization, and surfaced "Authenticated route groups have no client-side session guard, so a deep link reaches them directly" (a concrete instance of the client-side-gating risk this charter principle calls out).
- `.lagune/skills/http-request.md`: reviewed the API client's request construction — Bearer token in the `Authorization` header (not a cookie), so no CSRF exposure; no `Origin`/CORS handling needed client-side; no finding.
- `.lagune/skills/browser.md`: `react-native-webview` is present only transitively (via `react-native-youtube-iframe`'s embedded player), with no app code setting `originWhitelist` or blocking file/`content://` access — the app has no direct control over that dependency's WebView config today; tracked as a dependency-hardening gap, not a distinct finding since the app never loads the WebView with app-controlled or user-supplied HTML.
- `.lagune/skills/upload.md`, `.lagune/skills/path.md`: no upload UI or filesystem code path exists yet in `src/`/`app/` (the video-upload Zod schemas exist but nothing calls them, and `expo-file-system`/`expo-image-picker` are unused) — context absent, skipped.

## Not determined

- Whether the backend enforces coach-athlete ownership server-side on every read/write (plan fetch, session sync, load-history sync) cannot be confirmed from this repository — that logic lives in `ironforge-api`, outside this scope.
- Whether `EXPO_PUBLIC_API_URL` is actually set as a required, validated EAS secret for every production build profile could not be confirmed: `eas.json` currently defines only a `preview` profile, with no `production` profile to inspect.
