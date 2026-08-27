# IronForge (mobile) Defense Plan

- **Scope:** All findings in the detect map (`.lagune/memory/detect.md`), 9 items.
- **Planned:** 2026-08-27

## Fixes

### Session tokens and profile data persisted unencrypted

- **Category:** Cleartext storage of sensitive information (CWE-312)
- **CVSS:** CVSS:4.0/AV:P/AC:L/AT:N/PR:N/UI:N/VC:H/VI:L/VA:N/SC:H/SI:L/SA:N (8.1, High)
- **Priority:** High
- **Why this priority:** Reachable with physical possession of the device via a well-known, low-complexity path (an unencrypted iOS/Android backup, or a rooted/jailbroken device) — no in-app privilege needed. What is at stake is the highest in the app: the access token grants full account impersonation against `ironforge-api`, plus the user's email and profile ride along in the same clear-text blob.
- **Upholds:** Session material never touches unencrypted storage
- **Fix:** Move the access token (and, once a refresh flow exists — see the finding above about the discarded refresh token, which this fix should restore) into `expo-secure-store`, keeping only non-sensitive UI state (role, onboarding flags) in the Zustand-persisted AsyncStorage slice. On sign-out, also revoke the session server-side, not just clear local state.
- **References:** [CWE-312: Cleartext Storage of Sensitive Information](https://cwe.mitre.org/data/definitions/312.html), [OWASP MASVS-STORAGE](https://mas.owasp.org/MASVS/06-MASVS-STORAGE/)

### No code signing configured for OTA updates

- **Category:** Download of code without integrity check (CWE-494)
- **CVSS:** CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:N/VC:H/VI:H/VA:H/SC:H/SI:H/SA:N (7.9, High)
- **Priority:** High
- **Why this priority:** The precondition (compromising the EAS publishing credential, or otherwise redirecting the update channel) is not trivial, which is why this lands High rather than Critical, but once met the payload runs as fully trusted app code on every installed device with no on-device check of who authored it — that includes reading the AsyncStorage token and health data flagged above. A wide blast radius (every user, silently, on next launch) is exactly the case the charter's baseline discipline treats as high-stakes.
- **Upholds:** None directly
- **Fix:** Configure `expo-updates` code signing (`codeSigningCertificate` / `codeSigningMetadata` in `app.json`, generated via `expo-updates` code signing tooling), so the app only accepts an update whose signature it can verify, independent of who currently holds push access to the EAS project.
- **References:** [CWE-494: Download of Code Without Integrity Check](https://cwe.mitre.org/data/definitions/494.html)

### Health and training data cached unencrypted and not purged on logout

- **Category:** Cleartext storage of sensitive information (CWE-312)
- **CVSS:** CVSS:4.0/AV:P/AC:L/AT:N/PR:N/UI:N/VC:H/VI:N/VA:N/SC:N/SI:N/SA:N (6.9, Medium)
- **Priority:** Medium
- **Why this priority:** Same physical-access exposure as the token finding, but the ceiling is lower: reading this data does not itself grant account takeover or reach the backend, it only discloses the data in place. The charter treats health/body data as sensitive under LGPD, which keeps this from settling at Low, and the fact that it survives sign-out adds a second victim (whoever uses the device next) to the same weakness.
- **Upholds:** Body and training data is sensitive and stays minimal
- **Fix:** Either encrypt this cache (store through `expo-secure-store` if the volume stays small, or encrypt the AsyncStorage payload with a key held in secure storage) or, at minimum, purge every `loadHistory:*`, `active-session`, and `session-history` key on sign-out so a new account on the same device never inherits a prior account's training history.
- **References:** [CWE-312: Cleartext Storage of Sensitive Information](https://cwe.mitre.org/data/definitions/312.html)

### Externally sourced URLs opened without a host allowlist

- **Category:** Improper verification of the source of a communication channel (CWE-346)
- **CVSS:** CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:P/VC:L/VI:N/VA:N/SC:L/SI:N/SA:N (5.3, Medium)
- **Priority:** Medium
- **Why this priority:** Reaching this requires the attacker to already control what the API returns or intercept the connection (no pinning is in place), which is a real but non-trivial precondition. The payload only opens the system browser (not an in-app WebView with the app's session), so the ceiling is phishing/credential harvesting in an external context rather than in-app compromise.
- **Upholds:** Deep links and external content are attacker-controlled input
- **Fix:** Before calling `Linking.openURL`, allowlist the scheme (`https:` only) and the host (`youtube.com`/`youtu.be` for the video fallback, the known IronForge web-panel domain for the coach-guidance link) and refuse to open anything else. Give `EXPO_PUBLIC_WEB_PANEL_URL` the same Zod URL validation the video schema already applies to `watchUrl`, rather than trusting it as an unchecked string.
- **References:** [CWE-346: Origin Validation Error](https://cwe.mitre.org/data/definitions/346.html), [OWASP Mobile Top 10 — M8: Security Misconfiguration](https://owasp.org/www-project-mobile-top-10/)

### Dev-account demo password is gated in the UI only, not in the data it ships

- **Category:** Active debug code reachable in a release build (CWE-489)
- **CVSS:** CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:N/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N (5.1, Medium)
- **Priority:** Medium
- **Why this priority:** Exploiting this needs a build-process mistake first (the env var set while producing a release build), which is a real but avoidable precondition — that keeps it out of Critical/High. If it happens, though, anyone can extract the string from the shipped bundle with no device access at all, and the two accounts it unlocks are seeded, known-email demo accounts, not arbitrary user data, which bounds the impact.
- **Upholds:** Nothing shipped to the device is a secret
- **Fix:** Wrap the `DEV_ACCOUNTS` construction itself in `dev-accounts.ts` with `if (!__DEV__) return [];` (or equivalent), so the array — and the password inside it — is dead code eliminated from any release bundle regardless of what the environment happened to hold at build time. Do not rely on the UI-layer `__DEV__` check alone.
- **References:** [CWE-489: Active Debug Code](https://cwe.mitre.org/data/definitions/489.html)

### `.env` is not fully excluded from version control

- **Category:** Inclusion of sensitive information in source code repository (CWE-540)
- **CVSS:** CVSS:4.0/AV:N/AC:L/AT:P/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N (0.0 intrinsic; treated as Low on likelihood of future secret exposure)
- **Priority:** Low
- **Why this priority:** Nothing is committed today — this is a missing guardrail, not a live leak. It stays Low because it takes a future mistake (a developer creating `.env` instead of `.env.local`, and pushing it) to turn into anything, and the CVSS Base metrics carry no confirmed impact yet to score against.
- **Upholds:** Nothing shipped to the device is a secret
- **Fix:** Add `.env` (not just `.env*.local`) to `.gitignore`, matching what `.env.example` implies developers will create, and run a one-time check that no `.env` was ever committed in this repository's history.
- **References:** [CWE-540: Inclusion of Sensitive Information in Source Code Repository](https://cwe.mitre.org/data/definitions/540.html)

### Production API base URL has no enforced or validated source

- **Category:** Insecure default fallback configuration (CWE-1188)
- **CVSS:** CVSS:4.0/AV:P/AC:H/AT:P/PR:N/UI:N/VC:N/VI:N/VA:H/SC:L/SI:N/SA:N (3.6, Low)
- **Priority:** Low
- **Why this priority:** Two independent things must go wrong at once for this to matter: a release build shipped without `EXPO_PUBLIC_API_URL`, and the platform's own default cleartext protection (iOS ATS, Android's default-blocked cleartext traffic) not applying. Today neither `app.json` carries an ATS exception nor a cleartext override, so the realistic outcome of the missing variable is the app failing to connect, not a live cleartext leak — this is a defense-in-depth gap, not a demonstrated path to data exposure.
- **Upholds:** All network traffic is encrypted, with no fallback
- **Fix:** Validate `EXPO_PUBLIC_API_URL` at module load with Zod, and only allow the `hostUri`-derived/`localhost`/`10.0.2.2` fallbacks when `__DEV__` is true; in any non-dev build, throw immediately (fail loud, not silent) if the variable is missing, instead of falling through to a hardcoded URL.
- **References:** [CWE-1188: Insecure Default Initialization of Resource](https://cwe.mitre.org/data/definitions/1188.html)

### Invite deep link accepts a client-only token with no backend round trip

- **Category:** Improper authentication of a deep-link parameter (CWE-290)
- **CVSS:** CVSS:4.0/AV:N/AC:L/AT:N/PR:N/UI:P/VC:L/VI:L/VA:N/SC:N/SI:N/SA:N (4.6, Low, per the code as it stands today)
- **Priority:** Low
- **Why this priority:** As implemented right now the flow is fenced in by its own mock: the token table is a fixed, hardcoded lookup, and "accepting" performs no real write, so a crafted deep link cannot do anything beyond navigating the local UI and echoing static demo content. This rating applies only to the current mock code — the moment this is wired to `ironforge-api` (returning a real coach and creating a real coach-athlete link), re-plan it: an unauthenticated, unexpiring, client-validated token accepting a real relationship is at least a High.
- **Upholds:** Deep links and external content are attacker-controlled input, The server is the only source of truth for who can see what
- **Fix:** When the real backend integration lands, validate the invite token server-side on accept (existence, expiry, single-use) and never let the client decide an invite is valid or accepted from local data alone. Track this fix against the backend integration story, not as a standalone client patch.
- **References:** [CWE-290: Authentication Bypass by Spoofing](https://cwe.mitre.org/data/definitions/290.html)

### Camera/photo-library permissions requested for a feature not yet implemented

- **Category:** Execution with unnecessary privileges (CWE-250)
- **CVSS:** CVSS:4.0/AV:P/AC:H/AT:P/PR:N/UI:N/VC:N/VI:N/VA:N/SC:N/SI:N/SA:N (1.8, Low)
- **Priority:** Low
- **Why this priority:** No code path exercises the permission, so there is nothing an attacker can trigger through it today; this is unused attack surface and app-store review overhead, not a reachable flaw.
- **Upholds:** None directly
- **Fix:** Remove the `expo-image-picker` plugin's permission strings from `app.json` until the upload feature is actually implemented, then re-add them scoped to that feature.
- **References:** [CWE-250: Execution with Unnecessary Privileges](https://cwe.mitre.org/data/definitions/250.html)

## Open questions

- None. All nine detect findings are covered by this plan.
