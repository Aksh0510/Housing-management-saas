# Role Permission Matrix

| Role | Primary permission areas | Notes |
|---|---|---|
| Super Admin | platform dashboards, society setup, subscriptions, platform settings | Controlled by central navigation and a role-scoped config. |
| Society Admin | society profile, billing, members, complaints, vendors, notices, reports, settings | Broad operational access with admin-only actions. |
| Member | own bills, visitor records, complaints, amenities, notices, documents | Access is limited to the resident's own records and visible society data. |
| Staff | assigned tasks, attendance, gate check-ins, incident reports | Guard and staff flows are given focused access without financial or member data. |

## Guardrail

UI-only restrictions are not a substitute for backend authorization. This front-end keeps the access patterns clear, but production enforcement would still require backend permission checks and tenant scoping.
