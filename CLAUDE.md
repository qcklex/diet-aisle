# DietAisle

Single-file Vue 3 PWA (no build step). See REQUIREMENTS.md (features), DESIGN.md (visual system), PHASES.md (lifecycle), CHANGELOG.md (release log).

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

## Workflow rules
- After editing inline JS in index.html: extract the script and run `node --check` before considering the change done.
- Bump the SW cache version in sw.js whenever index.html changes, and add a matching CHANGELOG.md entry.
- Stage specific files only — never `git add -A`; never commit node_modules, .env, api/keto.json.
- After deploy: verify the live site, then sync the Desktop mirror at `/Users/alex/Desktop/A1. PROJECTS TO DO  - PROGRAMING /0.  MAIN PROJECT/DietAisle/`.
