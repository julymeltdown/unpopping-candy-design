# Composition checklist

- One clear page frame and content hierarchy.
- Layout primitives before custom wrappers.
- One primary action per decision region.
- Presentation models at the library boundary.
- Loading, empty, failure, success, pending, and read-only states.
- Feedback placed at the scope that owns the failure.
- No network, router, authentication, or server-cache hooks in visual components.
- No invented imports or props.
