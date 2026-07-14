# Senior Developer Web Design & Architecture Rules

This document outlines the strict, production-level standards for building the frontend of this website.

## 1. Responsive Design (Mobile-First Philosophy)
Every component must be designed to be fluid and adapt perfectly to any screen size. Use the following standard set of breakpoints:
- **Mobile (Phones):** `< 480px` (Default base styles)
- **Tablets / Large Phones:** `481px - 768px`
- **Laptops / Small Desktops:** `769px - 1024px`
- **Large Desktops:** `1025px+`
- **Ultrawide Monitors:** `1440px+`

*Rule:* Use `rem`/`em` for spacing and typography, and `clamp()` for fluid text sizes. Layouts must rely on CSS Flexbox and Grid to eliminate fixed widths.

## 2. Production-Level Code Quality
- **Componentization:** Break down complex UI into small, reusable, and testable micro-components.
- **DRY (Don't Repeat Yourself):** Extract repeated logic into custom React hooks or utility files.
- **State Management:** Keep state local to the component where possible.
- **Error Handling:** Implement React Error Boundaries so that a single component failure doesn't crash the entire website.

## 3. Performance & Optimization
- **Asset Optimization:** All images, videos, and SVGs must be optimized. SVGs will be used for icons and illustrations wherever possible to reduce payload size.
- **Lazy Loading:** Off-screen components, heavy sections, and below-the-fold images will be dynamically imported/lazy-loaded to keep the initial load time blazing fast.
- **Minimal Re-renders:** Use `React.memo`, `useMemo`, and `useCallback` appropriately to prevent unnecessary DOM painting.

## 4. Modern Aesthetics & UI/UX
- **Visual Impact:** Use modern web design trends: vibrant but harmonious colors, sleek dark modes (if desired), and dynamic glassmorphism effects.
- **Micro-Animations:** Buttons, cards, and links must have subtle hover transitions and active states to make the UI feel alive and responsive.
- **Typography:** Use clean, modern Google fonts (like Inter, Roboto, or Outfit) instead of default browser fonts.

## 5. Accessibility & SEO Best Practices
- **Semantic HTML:** Strict usage of `<header>`, `<main>`, `<footer>`, `<section>`, `<article>`, and proper `<h1>` through `<h6>` hierarchies.
- **ARIA & A11y:** All interactive elements will have focus states and `aria-labels`. Images will have descriptive `alt` tags.
