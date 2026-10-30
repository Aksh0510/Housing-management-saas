# Mock Data and Workflows

## Data model

The app uses deterministic, fictional records separated by domain and role. The main datasets are stored in the `src/shared/data` and `src/shared/services` areas.

## Cross-module workflow guarantees expected by the demo

- generated bill appears in both admin and member views
- payment updates the bill and receipt state within the same in-memory data store
- resident complaints appear in manager and staff queues
- gate check-ins update resident-visible visitor history
- amenity bookings are conflict-checked
- notices are audience-scoped by wing/flat permissions

## Important caveat

This is a front-end demo backed by mock services. It does not connect to a live backend, payment gateway, messaging provider, or external gate system. Every such flow must be clearly labelled as Demo Mode.
