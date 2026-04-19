# Project Rules

This document outlines core development rules for the Custom New Tab Redirect project to ensure consistency and minimize maintenance overhead.

## Styling Rules

### 1. Use CSS Variables for Centralization

**Rule**: USE CSS variables (`--variable-name`) in stylesheets to centralize colors, shadows, and other reusable values.
**Rationale**: CSS variables help maintain a consistent look and feel and make it easier to tweak visual elements globally. However, keep them limited to the light theme.
**Action**: Define variables in a `:root` block and use `var()` throughout the CSS.

### 2. No Dark Mode Support

**Rule**: NEVER use dark mode media queries (`@media (prefers-color-scheme: dark)`) or dark-mode specific styling.
**Rationale**: Supporting dark mode increases the maintenance surface area and requires extra testing. We aim for a consistent light-themed experience.
**Action**: The UI should remain in its light theme regardless of the user's OS or browser color scheme settings.

### 3. Use ESM Modules

**Rule**: All JavaScript files must be loaded as ESM modules (`type="module"` in HTML).
**Rationale**: Native ESM provides better scoping and allows for modern module syntax (`import`/`export`), making the code more modular and maintainable.
**Action**: Always use `type="module"` when including scripts in HTML and follow ESM standards.

---

_Follow these rules strictly to keep the codebase clean and easy to maintain._
