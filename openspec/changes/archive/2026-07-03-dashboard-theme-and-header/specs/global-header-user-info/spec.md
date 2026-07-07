# Global Header User Info Specification

## Purpose

Define how the global top navigation surfaces the authenticated user's identity while preserving the visitor login/register flow.

## Requirements

### REQ-001 — Authenticated user info replaces dashboard link

When a user session exists, the global header MUST render the user's avatar, name, and role through `UserAvatarMenu` and MUST NOT render the "Mi panel" dashboard link.

#### Scenario: Patient is logged in

- GIVEN an authenticated patient on any page
- WHEN the global header renders
- THEN the patient's avatar, name, and role dropdown are visible
- AND the "Mi panel" link is absent

#### Scenario: Professional is logged in

- GIVEN an authenticated professional on any page
- WHEN the global header renders
- THEN the professional's avatar, name, and role dropdown are visible
- AND the "Mi panel" link is absent

### REQ-002 — Visitor login/register buttons remain unchanged

When no user session exists, the global header MUST continue to render the login and register buttons.

#### Scenario: Anonymous visitor

- GIVEN a visitor without a session
- WHEN the global header renders
- THEN login and register buttons are visible
- AND no user avatar, name, or role dropdown is rendered

### REQ-003 — Header remains layout-stable

The global header MUST keep its sticky position, border, and background styling while accommodating the wider user-info area.

#### Scenario: Resizing on mobile

- GIVEN a logged-in user on a narrow viewport
- WHEN the header renders
- THEN the user name MAY be truncated or hidden but the avatar menu remains accessible
