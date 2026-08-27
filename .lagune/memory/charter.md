# IronForge (mobile) Security Charter

## Principles

### I. Session material never touches unencrypted storage

Never persist an access token, refresh token, or any other session credential to AsyncStorage, a plain file, or any other unencrypted store. Always keep session material in OS-backed secure storage (`expo-secure-store` / Keychain / Keystore), and always let the server revoke a session on logout, not just clear it locally.

- Why: this app runs on a device the platform must treat as hostile — lost, stolen, backed up to the cloud, or inspected by another app. A token sitting in clear text in AsyncStorage is a full account takeover for anyone who reads the device's storage, and a client-only logout that never reaches the server leaves the token valid forever.

### II. Body and training data is sensitive and stays minimal

Treat workout history, body measurements, load progression, and PRs as sensitive personal data. Always ask whether a screen, log line, cache, or crash report needs that data before it touches it, and never persist it in clear text anywhere the app does not need it for its own function.

- Why: this data reveals a person's health and body over time. Health-adjacent data has heightened LGPD sensitivity, and every place it is stored, cached, or logged in clear text is another way it can leak.

### III. Nothing shipped to the device is a secret

Never put an API key, password, signing secret, or other credential in an `EXPO_PUBLIC_*` variable, `app.json`, or any other value that ships in the JS bundle or app binary. Always keep credentials server-side, and treat anything inlined into the client as public the moment it ships.

- Why: `EXPO_PUBLIC_*` values and everything in the compiled bundle are trivially extracted from the installed app or the OTA update package — there is no client-side secret, only ones that have not been extracted yet.

### IV. Deep links and external content are attacker-controlled input

Treat every deep link (`ironforge://…`), notification payload, and URL returned by the API (exercise demo video, external link) as attacker-controlled until validated. Always check scheme, host, and shape before acting on a link or param, never let a link trigger a privileged action or navigate with elevated state, and never load a URL from an untrusted source into a WebView or video player without validating it first.

- Why: a deep link or a video URL is not something the app's own code produced — anyone can craft one and send it to an installed app via a share sheet, a message, or a malicious API response. Acting on it unchecked is how an attacker forces navigation, hijacks a screen, or gets hostile content rendered with the app's privileges.

### V. The server is the only source of truth for who can see what

Never treat a client-held ID, a hidden UI element, or a locally cached role as an authorization decision. Always assume the coach-athlete relationship, and any other cross-actor read or write, is enforced server-side on every request, and treat any place the app appears to gate access purely on the client as a finding to flag, not a control to rely on.

- Why: this is a two-sided platform (coach and athlete) where one user's workout, body data, and progress must never be reachable by another user who guesses an ID or replays a request — the client's own checks are cosmetic if the server does not re-check.

### VI. All network traffic is encrypted, with no fallback

Always require HTTPS for every request the app makes, in every build. Never allow cleartext traffic (no `usesCleartextTraffic`, no ATS exception) and never let a development-only host-detection path for the API base URL survive into a release build.

- Why: an attacker in the same coffee-shop Wi-Fi or on a compromised network can read or alter unencrypted traffic; a debug convenience that resolves the API host automatically is a valuable tool in development and a way to redirect a production app to a hostile server if it leaks into a release build.

## Baseline discipline

Lagune holds this charter, every principle, every time. A principle is not suspended because a control looks small, familiar, or unlikely to be hit. This is not a judgement call.

### Only the controls the project needs

Lagune recommends and applies only the controls this project's context calls for. A control the project does not need is never added for completeness, and a generic checklist is not thoroughness. Every later phase acts on what the system actually does, never on what it might hypothetically do.

- Why: effort spent on risks the project does not have buries the risks it does have. Fewer, right-sized controls are easier to apply, prove, and keep true than a checklist no one finishes.

### Prefer the simplest vetted control

When a control is needed, reach for the safest option already proven, in order: a control this project already has, then a platform or framework built-in, then a well-maintained vetted library, and only then custom code. Never hand-roll a security primitive (cryptography, escaping, authentication, sessions) that a vetted standard already provides. A new dependency is new attack surface, justified and not assumed. Code, an endpoint, or a feature the project does not use is attack surface too, so removing it is itself a control.

- Why: hand-rolled security is where subtle, unaudited bugs live, and a second control duplicating an existing one is the one that gets forgotten and drifts. Boring, standard controls are easier to audit and harder to get wrong, and less surface is less to defend.

### When a control seems skippable

A control is held even when a reason to skip it feels reasonable:

- "Too small to need a control": small gaps are where breaches start.
- "Already handled elsewhere": assumed coverage is exactly how gaps hide.
- "Unlikely to be hit": attackers target the path no one is watching.
- "It works, ship it": working and safe are different claims, and the charter requires both.

## Governance

This charter governs every Lagune phase run against the `ironforge` mobile repository. Any principle change goes through a new `/lagune.charter` run, reviewed by the project owner before the version is bumped. Findings and fixes in later phases are read against the version of the charter in force at the time; a charter update does not retroactively invalidate a completed review, but the next detect/plan cycle re-checks against the new text.

Version: 1.0.0 | Ratified: 2026-08-27
