# Enhanced Partner Security & Password Management

Implement a robust first-time login flow, password reset mechanism, and admin auditing tools for partner domains.

## User Review Required

> [!IMPORTANT]
> - **First-time Login**: Partners using the default `everpure` password will be forced to create a new password immediately upon successful login.
> - **Reset Password**: Requires a valid email address matching the domain of the partner card.
> - **Security Log**: A new "Credential Audit" section will be added to the Admin dashboard where `pureuser` can see the current set passwords for all partner domains.

## Proposed Changes

### [Component] [AuthContext.tsx](file:///Users/jwestman/.gemini/antigravity/scratch/campaigniq-dashboard/client/src/contexts/AuthContext.tsx)

#### [MODIFY] Authentication Logic
- Update `login` to detect and return a `requiresSetup` flag if the password is the default "everpure".
- Update `changePassword` to mark a domain as "initialized".
- Implement a global credential index in `localStorage` specifically for the Admin "Credential Audit" view.

### [Page] [LoginPage.tsx](file:///Users/jwestman/.gemini/antigravity/scratch/campaigniq-dashboard/client/src/pages/LoginPage.tsx)

#### [NEW] First-time Password Flow
- Add an overlay that triggers when a partner logs in with the default password. This overlay will block access until a new, strong password is saved.

#### [NEW] Forgot Password & Reset Flow
- **Forgot Password View**: New link on login screen. Redirects to "Request Reset" state.
- **Domain Validation**: Verification that the provided email belongs to the domain being reset.
- **Reset Link Simulation**: A toast/modal showing the "Email Content" with a clickable reset link.
- **Reset Password View**: Page with "New Password" fields and a "I am not a robot" checkbox.

### [Component] [Sidebar.tsx](file:///Users/jwestman/.gemini/antigravity/scratch/campaigniq-dashboard/client/src/components/Sidebar.tsx) & [SecurityLogPage.tsx](file:///Users/jwestman/.gemini/antigravity/scratch/campaigniq-dashboard/client/src/pages/SecurityLogPage.tsx)

#### [NEW] Admin Credential Audit
- Add a "Security Audit" link to the Sidebar visible ONLY to admins.
- Create a new page that iterates through all tracked partner passwords and metadata to provide the "Admin Log" requested.

## Verification Plan

### Automated Tests
- N/A

### Manual Verification
- **Login 1**: Log in with `pureuser` / `prevents.comm1ts`. Verify "Security Audit" tab exists.
- **Login 2**: Log in with a new domain (e.g., `altron.com`) using `everpure`. Verify the "Set New Password" overlay appears.
- **Reset**: Use "Forgot Password" with an incorrect email domain (verify error). Use correct email, click simulated link, verify captcha and new password functionality.
