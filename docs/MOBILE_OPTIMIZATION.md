# Mobile Optimization

The app is optimized for mobile devices across all modes (student, teacher, admin).

## Changes Applied

### Home Page — Learning Modules (Student mode)
- **Grid** — `grid-cols-2 sm:grid-cols-3` (2 columns on mobile, 3 on desktop)
- **ModuleCard** — Responsive padding, icon size (`h-7` on mobile, `h-9` on desktop), image width (`w-20` → `w-28`), `line-clamp-2` for long names, `active:scale-[0.99]` for touch feedback

### Tables
- **UserManagementTable**, **SessionsList**, **ReportsTable**, **modules schedule** — `overflow-x-auto` with horizontal scroll on small screens; `min-w` on tables for readable columns
- Negative margin (`-mx-2`) on mobile so scroll extends to edges

### Navigation
- **AppNav** — "Perform Bayat" shows "Bayat" on mobile, full text on desktop
- **AdminNav** — Horizontal scroll on mobile; 44px touch targets
- **Hamburger menu** — 44px close button
- **Bottom nav** — Safe area padding for notched devices (`env(safe-area-inset-bottom)`)

### Forms
- **SessionsList**, **ResourcesList**, **UserManagementTable** — Form inputs stack vertically on mobile (`flex-col sm:flex-row`)
- **Touch targets** — `min-h-[44px]` on buttons and inputs

### Layout
- **Viewport** — `device-width`, `initialScale: 1`, `maximumScale: 5`
- **Content padding** — `pb-[calc(4rem+env(safe-area-inset-bottom))]` for bottom nav clearance
- **Admin header** — Stacks on mobile (`flex-col sm:flex-row`)

### Touch Targets
- Menu button, Bayat button, close button, nav links, form buttons — minimum 44×44px
