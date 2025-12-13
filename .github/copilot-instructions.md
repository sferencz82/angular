<!-- Copilot / AI agent instructions tailored for this Angular "getting-started" app -->

# Quick Orientation

+ **Purpose:** This is a small Angular (v19) single-page app using standalone components and the new `bootstrapApplication` API. It demonstrates routing between `Home` and `About` pages.
+ **Key entry points:** `src/main.ts` (bootstraps the app), `src/app/app.config.ts` (application providers), `src/app/app.routes.ts` (route table), and the components under `src/app/*`.

# Architecture & Patterns (what to know)

+ Standalone components: components import dependencies directly in the `@Component({ imports: [...] })` metadata. There are no Angular `NgModule` classes. See `src/app/app.component.ts` and `src/app/home/home.component.ts`.
+ Routing is provided via `provideRouter(routes)` in `src/app/app.config.ts`. Update `src/app/app.routes.ts` when adding routes.
+ App is bootstrapped with `bootstrapApplication(AppComponent, appConfig)` in `src/main.ts` — add global providers in `appConfig`.
+ Change-detection tuning: `provideZoneChangeDetection({ eventCoalescing: true })` is used in `appConfig`. Be careful when changing detection strategies; tests and UI timing may rely on this.

# Important Files

+ `src/main.ts` — application bootstrap.
+ `src/app/app.config.ts` — central `ApplicationConfig` and providers.
+ `src/app/app.routes.ts` — canonical route definitions (use this file to add/remove routes).
+ `src/app/app.component.ts` & `src/app/app.component.html` — top-level component and shell (imports `RouterOutlet`, `RouterLink`, etc.).
+ `public/` — static assets copied into the build via `angular.json` (see `assets` configuration).
+ `angular.json` — build/serve/test configurations (note default `production` build configuration and `development` serve target).
+ `package.json` — npm scripts and dependency versions.

# Developer Workflows (commands)

+ Start dev server (hot reload):

++ `npm start`  (runs `ng serve`, default configuration: `development`, port 4200)

+ Build for production:

++ `npm run build`  (runs `ng build` — default `production` configuration)

+ Watch build during development:

++ `npm run watch`  (runs `ng build --watch --configuration development`)

+ Run unit tests (Karma):

++ `npm test`  (uses Karma, configured in `angular.json` / `tsconfig.spec.json`)

# Project-specific Conventions

+ Prefer standalone components and explicit `imports` arrays in component decorators — do not introduce NgModules.
+ Centralize route changes in `src/app/app.routes.ts`. When adding a new page component, export it as a standalone component and add it to the `routes` array.
+ Keep global providers in `src/app/app.config.ts`. If you need app-wide services, provide them here rather than scattering provider configuration.
+ Static assets live in `public/` and are referenced in `angular.json` as a glob input — use that directory for images/json that should be bundled.

# Examples (common edits an AI might be asked to make)

+ Add a new route:

++ 1. Create `src/app/feature/feature.component.ts` as a standalone component (include any `imports` it needs).
++ 2. Update `src/app/app.routes.ts`:

+++ ```ts
+++ import { FeatureComponent } from './feature/feature.component';
+++ export const routes: Routes = [
+++   { path: '', component: HomeComponent },
+++   { path: 'about', component: AboutComponent },
+++   { path: 'feature', component: FeatureComponent }
+++ ];
+++ ```

++ Use `provideRouter(routes)` in `app.config.ts` (already present). No NgModule edits required.

# Testing & Debugging Notes

+ Tests run with Karma (`npm test`). The project uses `zone.js` and testing polyfills are declared in `angular.json` test options.
+ If a UI test or manual debugging shows change-detection timing issues, consider how `provideZoneChangeDetection({ eventCoalescing: true })` affects event flushing.

# External Integrations & Dependencies

+ No backend or external services are configured in the repo. Dependencies are core Angular packages (`@angular/*`), `rxjs`, and `zone.js` — see `package.json` for exact versions.

# What I (the agent) should NOT assume

+ Do not add NgModules or switch the project to an NgModule-based bootstrap; the code intentionally uses the standalone component approach.
+ Do not move global providers out of `app.config.ts` without confirming intent — the file is the canonical place for app providers.

# Where to look for more context

+ `angular.json` — build/serve/test config and assets pipeline.
+ `package.json` — exact npm scripts and devDependencies.
+ `src/app/` — canonical place for components, routing and app config.

---
If anything here is unclear or you'd like more/less detail (examples, tests, or expanded how-to steps), tell me which section to expand and I will iterate.
