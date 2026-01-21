# SleekSky - SleekCMS Documentation Starter

A modern, highly dynamic, and aesthetically pleasing documentation site starter built with **Next.js 14**, **Tailwind CSS**, and **SleekCMS**.

This project has been transformed from a simple blog template into a full-featured documentation platform with a dynamic homepage, nested navigation, and client-side search.

## Features

-   **Fully Dynamic Homepage**:
    -   **Hero Section**: Fetches title, subtitle, and background image from SleekCMS.
    -   **Navbar**: Links and branding are fully managed via CMS entries.
    -   **Docs Grid**: Automatically lists all top-level documentation sections.
    -   **FAQs**: Dynamic FAQ section powered by CMS entries.
-   **Smart Navigation**:
    -   Global Navbar with route-dependent styling (Transparent-to-Dark on Home, Solid Dark on others).
    -   Deeply nested sidebar navigation for documentation pages.
    -   Automatic section numbering (1.1, 1.2, etc.).
-   **Search Functionality**:
    -   Real-time client-side search.
    -   URL-state management (`?q=...`) for shareable search results.
-   **Modern Design**:
    -   Glassmorphism effects.
    -   Smooth transitions and animations.
    -   Responsive layout for all devices.
-   **Tech Stack**:
    -   Next.js 14 (App Router)
    -   Tailwind CSS
    -   SleekCMS Client

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure SleekCMS

Open `lib/sleekcms.ts` (or `lib/sleekcms-client.js`) and ensure your **Site Token** is correctly set:

```ts
siteToken: 'YOUR_SITE_TOKEN' // e.g. pub-2azet...
```

### 3. Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Content Structure in SleekCMS

To make the most of this starter, your SleekCMS project should have the following structure:

### Entries (Home Page Content)

1.  **Home Page (`/`)**:
    *   `hero`: Object containing `title`, `subtitle`, and `bg_img` (Image URL).
    *   `title`: Fallback site title.
2.  **Navbar (`navbar` entry)**:
    *   `nav_links`: Array of objects with `name` and `url`.
3.  **About / Features / FAQs (`faq` entry)**:
    *   `title`: Section title (e.g., "General FAQs").
    *   `faqs`: Array of items with `question` and `answer`.

### Documentation Pages (`/docs/*`)

Create pages under the `/docs/` path.
*   **Fields**: `title`, `description`, `order` (number), and `content` (HTML/Markdown).
*   **Structure**: content with `<h2>`, `<h3>` tags will be automatically parsed into the sidebar navigation.

---

## Project Structure

```
├── app/
│   ├── layout.tsx        # Global RootLayout with dynamic Navbar
│   ├── page.tsx          # Dynamic Homepage (Hero, Grid, FAQs)
│   ├── globals.css       # Tailwind & Custom Styles
│   ├── docs/
│   │   └── [slug]/
│   │       └── page.tsx  # Documentation Page logic
│   └── search/
│       └── page.tsx      # Search Page logic
├── components/
│   ├── HomeHero.tsx      # Homepage Hero section
│   ├── Navbar.tsx        # Global Navigation component
│   └── DocsSidebar.tsx   # Recursive sidebar for docs
├── lib/
│   ├── sleekcms.ts       # Client wrapper
│   └── doc-structure.ts  # Utilities for parsing doc sections
└── ...
```

## Customization

### Revalidation
By default, pages use `dynamic = "force-static"` or ISR. You can adjust the revalidation period in `app/page.tsx` or `app/docs/[slug]/page.tsx` by exporting:

```ts
export const revalidate = 60; // seconds
```

---

## Deployment

Deploy easily to **Vercel** or any Next.js-compatible hosting.
Ensure the `siteToken` is properly set in your environment variables or committed if using a public token.
