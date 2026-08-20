# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.1-otolab.1] - 2026-08-20

### Added

- Emacs-style kill ring (`useKillRing`) with `Ctrl+K` / `Ctrl+W` / `Ctrl+U` integration
- `Ctrl+F` / `Ctrl+B` character-wise navigation (Emacs forward/backward char)
- `Alt+Y` yank-pop to rotate the kill ring after a yank

### Changed

- **`Ctrl+Y` is yank (paste from kill ring), not redo.** Upstream `react-ink-textarea` binds `Ctrl+Y` to redo; this otolab fork follows Readline/Emacs semantics instead. Redo is no longer exposed on the keyboard (undo stack still works via `Ctrl+Z`).

### Tests

- `tests/hooks/useKillRing.test.tsx` and Emacs chord coverage in `tests/TextArea/keybindings.test.tsx`

## [0.4.1-otolab.0] - 2026-08-15

### Added

- npm publish as `@otolab/react-ink-textarea` (fork of upstream `react-ink-textarea@0.4.0`)
- `cursorStart` prop — Ink 7 `useCursor` integration for OS IME physical cursor sync
- `prepare` / `prepublishOnly` scripts to build `dist/` on install and publish

### Changed

- Package scope and repository URLs point to [otolab/react-ink-textarea](https://github.com/otolab/react-ink-textarea)

## [0.4.0] - 2026-08-07

### Added

- `lineSuffix` render-prop — the right-side mirror of `linePrefix`, for per-line context
  information (char/token counts, git blame, status badges) pinned to the right edge. Accepts
  a `ReactNode` or a `(props: TLineSuffixProps) => ReactNode` render prop.
- `isLastChunkOfLine` on `TLinePrefixProps` (and thus `TLineSuffixProps`) so a decoration can
  render once per logical line instead of on every wrapped row.

### Fixed

- Text wrapping now accounts for each **sub-row's** own `linePrefix`/`lineSuffix` width,
  measured per visual row, so a decoration whose width differs between lines — or between a
  line's first row and its wrapped continuations (e.g. a marker only on the caret's first
  sub-row) — wraps correctly, re-wrapping only the sub-rows it actually affects. Previously a
  single width, measured from the first visible row, was applied to every line. Rows outside
  `viewportLines` use a best-effort fallback width until scrolled in.
  ([#13](https://github.com/omranjamal/react-ink-textarea/issues/13))
