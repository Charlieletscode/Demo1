# PRD — Refactor into Reusable, Callable Components

**Goal:** Turn the working features (color palette + data table) into **self-contained, reusable components** that any page can drop in with a single tag, e.g. `<app-palette />` or `<app-datatable />`. Each component owns its own logic; pages just place it and (optionally) pass inputs.

**Audience:** You will implement this yourself. This doc is the spec + step-by-step.

**Stack:** Angular 20, standalone components, signals, SCSS. Prettier: `singleQuote`, `printWidth 100`.

---

## 0. Guiding principle: "Smart" vs "Dumb" components

Two clean patterns. Pick per component:

- **Self-fetching (smart):** component injects `GatewayService`, fetches its own data on init. Page just writes `<app-datatable />`. Simplest to reuse.
- **Presentational (dumb):** component takes data via `@Input()` and emits via `@Output()`; the page fetches and passes data in. More flexible/testable.

**Recommendation:** make each feature component **smart by default** (self-fetching) but **accept optional `@Input()`s** to override (e.g. a custom prompt, or externally-supplied rows). That gives "just call it" simplicity AND flexibility.

---

## 1. Fix the service contract FIRST (blocker)

Your pasted `DatatableComponent` references things that don't exist in the current [gateway.service.ts](src/app/gateway.service.ts). Reconcile before anything else.

### 1a. Add the missing `EmployeeRow` type
The service exports only `EmployeeMetadata<T>`. Your component imports `EmployeeRow`. Add this export to `gateway.service.ts`:
```ts
// A single table row: dynamic column names -> cell values.
export type EmployeeRow = Record<string, string | number | boolean>;
```

### 1b. Decide the data method
Your component calls `this.gateway.getEmployeeTable()`, which was removed (now it's `askForJson(prompt)`). Two options:

- **Option A (recommended):** re-add a thin `getEmployeeTable()` wrapper so the datatable code works unchanged:
  ```ts
  getEmployeeTable() {
    return this.askForJson(
      'Give me a random data table of over 100 employees. ' +
      'Each employee must have at least 6 random columns. ' +
      'Include at least one string, one unique id, one boolean, one numeric. ' +
      'Respond with ONLY valid JSON in the shape { "employees": [...] }.'
    );
  }
  ```
- **Option B:** change the component to call `askForJson(yourPrompt)` directly.

### 1c. Return type note
`askForJson` currently returns `Observable<Record<string, any>[]>` (loosely typed). That's fine for the table (dynamic columns). If you want stricter typing, cast to `EmployeeRow[]` in the component's `subscribe`.

---

## 2. Dependencies to install (your Datatable needs these)

Your pasted code imports `lodash` and `xlsx`, which are **NOT** in [package.json](package.json). Install them:

```bash
npm install lodash xlsx
npm install -D @types/lodash
```

- `xlsx` ships its own types (no separate @types needed).
- `lodash` needs `@types/lodash` for TypeScript.

**Note:** you import `_` and `divide` from lodash but only use `_` (exposed as `this.lodash`). Drop the unused `divide` import to avoid lint noise. Also `xlsx` (SheetJS) adds ~400KB — acceptable for an internal tool; be aware of bundle size.

---

## 3. File/style naming consistency

Your `@Component` says `styleUrl: "./datatable.css"` but the repo has `datatable.scss`. Pick one:
- Keep SCSS (matches the rest of the project) → set `styleUrl: './datatable.scss'`.
- The existing scaffolded files are: [datatable.ts](src/app/datatable/datatable.ts), `datatable.html`, `datatable.scss`.

Also note the existing scaffold class is `Datatable` with selector `app-datatable`. Your pasted class is `DatatableComponent` with selector `app-table`. **Standardize** — recommend: class `DatatableComponent`, selector `app-datatable`, in folder `src/app/datatable/`.

---

## 4. Component inventory (what to build)

| Component | Selector | Folder | Responsibility |
|---|---|---|---|
| Palette | `app-palette` | `src/app/palette/` | The Palette Studio (input + generate + rainbow + swatch cards + copy). Extract from current `page-first`. |
| Datatable | `app-datatable` | `src/app/datatable/` | The employee/data table (sort, paginate, row-count, Excel import/export). Your pasted code. |

Then **pages become thin**: each page component's template is basically one tag.

---

## 5. Build Step-by-Step

### Step 1 — Service fixes (Section 1)
1. Add `EmployeeRow` export.
2. Add `getEmployeeTable()` wrapper (Option A).
3. Optionally remove the `console.log` in the `tap` (leftover debug).
4. Verify build: `npx ng build --configuration development`.

### Step 2 — Install deps (Section 2)
Run the npm installs. Rebuild to confirm `lodash`/`xlsx` resolve.

### Step 3 — Build the Datatable component
1. In `src/app/datatable/`, set:
   - class `DatatableComponent`, `standalone: true`, `selector: 'app-datatable'`
   - `imports: [CommonModule]` (you use `*ngIf`/`*ngFor`/pipes → needs CommonModule; if you convert the template to `@if`/`@for`, CommonModule is not required but harmless)
   - `styleUrl: './datatable.scss'`, `templateUrl: './datatable.html'`
2. Paste your working TS logic (the code you provided). Ensure imports resolve:
   - `import { EmployeeRow, GatewayService } from '../gateway.service';` (path is one level up from `datatable/`)
   - `import _ from 'lodash';` (drop `divide`)
   - `import * as XLSX from 'xlsx';`
3. Write `datatable.html` (you likely already have it). It must use `visableData()`, `sortBy(col)`, `columns()`, pagination (`nextPage`/`prevPage`/`totalPages`/`currentPage`), `onRowCountChange`, `onFileUpload`, `downloadExcel`. NOTE: `visableData()` is a **method call in the template** — it re-runs on every change detection. Fine for now; if perf matters later, convert to a `computed()` signal.
4. Build + manually test at a temp route.

**Optional inputs to make it reusable (recommended):**
```ts
// Accept an external prompt or external data so pages can customize:
@Input() prompt?: string;            // if set, fetch with this instead of default employees
@Input() initialData?: EmployeeRow[]; // if set, skip fetch and use this
@Input() defaultRowCount = 5;
```
In `ngOnInit`: if `initialData` → use it; else if `prompt` → `askForJson(prompt)`; else → `getEmployeeTable()`.

### Step 4 — Extract the Palette component
1. Create `src/app/palette/` with `palette.ts`, `palette.html`, `palette.scss`.
2. Move ALL palette logic from `page-first` (theme, colors, loading, error, copied, showRainbow, rainbowColors, DEFAULT_RAINBOW, generate(), finishReveal(), copy(), lum(), textColor(), rainbowGradient getter).
3. `selector: 'app-palette'`, `standalone: true`, `imports: [FormsModule]`.
4. Move `page-first.html` → `palette.html`, `page-first.scss` → `palette.scss` (adjust `styleUrl`/`templateUrl`).
5. Optional inputs:
   ```ts
   @Input() defaultTheme = 'cyberpunk';
   @Input() autoGenerateOnInit = true;
   @Output() paletteGenerated = new EventEmitter<any[]>(); // emit colors when done
   ```

### Step 5 — Make pages thin wrappers
Each page component just hosts the feature component.

`page-first.ts`:
```ts
import { Component } from '@angular/core';
import { PaletteComponent } from '../palette/palette';

@Component({
  selector: 'app-page-first',
  standalone: true,
  imports: [PaletteComponent],
  template: `<app-palette />`,
})
export class PageFirst {}
```

`page-second.ts`:
```ts
import { Component } from '@angular/core';
import { DatatableComponent } from '../datatable/datatable';

@Component({
  selector: 'app-page-second',
  standalone: true,
  imports: [DatatableComponent],
  template: `<app-datatable />`,
})
export class PageSecond {}
```

### Step 6 — Routing (already mostly done)
[app.routes.ts](src/app/app.routes.ts) already has `/first` and `/second`. Now:
- `/first` → PageFirst → renders `<app-palette />`
- `/second` → PageSecond → renders `<app-datatable />`

Add a route for a datatable-only page if you want, or use the component directly anywhere:
```ts
{ path: 'table', component: PageSecond },
```

You can even put BOTH on one page: `<app-palette /> <app-datatable />`.

---

## 6. Import path cheat-sheet (common mistake source)

From a component in `src/app/<feature>/`:
- Service: `'../gateway.service'`
- Another component in `src/app/<other>/`: `'../<other>/<file>'`

From a page in `src/app/page-first/`:
- Feature component: `'../palette/palette'`

---

## 7. Acceptance criteria (definition of done)

- [ ] `gateway.service.ts` exports `EmployeeRow` and has a working data method the datatable calls.
- [ ] `lodash` + `xlsx` (+ `@types/lodash`) installed; build resolves them.
- [ ] `DatatableComponent` (`app-datatable`) is standalone, self-contained, and renders a sortable, paginated table with Excel import/export.
- [ ] `PaletteComponent` (`app-palette`) is standalone and contains ALL palette logic (generate, rainbow, copy).
- [ ] `page-first` template = `<app-palette />`; `page-second` template = `<app-datatable />`.
- [ ] Both components can be dropped onto ANY page with a single tag and just work.
- [ ] `npx ng build --configuration development` → "Application bundle generation complete."
- [ ] Manual check at `/first` and `/second` in the browser: palette generates; table sorts/paginates/imports/exports.

---

## 8. Gotchas specific to YOUR code

1. **`getEmployeeTable()` doesn't exist anymore** → add the wrapper (1b) or switch to `askForJson`.
2. **`EmployeeRow` isn't exported** → add it (1a).
3. **`lodash`/`xlsx` not installed** → `npm install` them (Section 2).
4. **`styleUrl: './datatable.css'`** → should be `.scss`.
5. **Selector collision:** the scaffold uses `app-datatable`, your paste uses `app-table`. Standardize to `app-datatable` and update any template tags accordingly.
6. **`divide` import from lodash is unused** → remove it.
7. **`visableData()` is a method in template** → runs every CD cycle. Works, but for large tables convert to `computed(() => ...)` signal later. (Note the typo: consider renaming to `visibleData` for clarity — optional.)
8. **SSR note:** you already guard the fetch with `isPlatformBrowser`. Keep that if SSR is ever enabled; harmless otherwise.
9. **`rowCountOptions` has commented-out dead code** → clean it up when you paste, keep only the working `presets.filter(...)` + `next` logic.

---

## 9. Suggested order of operations (fastest path)

1. Fix service (`EmployeeRow` + `getEmployeeTable` wrapper) → build.
2. `npm install lodash xlsx -D @types/lodash` → build.
3. Wire your Datatable component into `src/app/datatable/` (fix selector/styleUrl/imports) → build → test at `/second`.
4. Extract Palette into `src/app/palette/` → make `page-first` a thin wrapper → build → test at `/first`.
5. Confirm both tags are droppable anywhere. Done.
