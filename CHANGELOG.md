# Changelog

## v1.10.7
*   **Documentation:** Added application screenshot to README.
*   **Maintenance:** Cleanup of deprecated files (`.gitignore.txt`, `.dockerignore.txt`).

## v1.10.6
*   **Maintenance:** Codebase cleanup and optimization.
*   **Refactor:** Removed unused components (`HelpModal`) and services (`geminiService`).
*   **Refactor:** Removed unused icons and imports.
*   **Standards:** Enforced `dockerignore.txt` and `gitignore.txt` naming conventions.

## v1.10.5
*   **Standards:** Added `DEV_STANDARDS.md` to outline project conventions.
*   **Architecture:** Implemented `version.ts` as the central source of truth for application versioning.
*   **Documentation:** Added `CHANGELOG.md`.
*   **DevOps:** Added `HEALTHCHECK` to `Dockerfile.txt`.

## v1.10.4
*   **Documentation:** Consolidated all documentation into README.md.
*   **Documentation:** Added new `about.md` for user guide and app details.
*   **Maintenance:** Cleaned up deprecated documentation files.

## v1.10.3
*   **Bug Fix:** "Format to Ver" now correctly forces the update of the version key in the file content.
*   **UI:** Updated Theme icon to a proper painter's palette.

## v1.10.2
*   **Logic Update:** "Format to Ver" now immediately formats the code in the editor to the selected version.
*   **Fix:** Fixed an issue where the "Jump To" feature would not properly highlight the selected code section.
*   **UI:** Updated icons for Themes and About actions.

## v1.10.1
*   **Functionality:** Selecting a target version ("Format to Ver") now automatically formats the code to that standard.
*   **UI Update:** Redesigned toolbars with standard dropdowns for Insert Snippet and Jump To.
*   **Navigation:** "Jump to" now properly scrolls to and highlights the selected section.
*   **Style:** Implemented "Folder Tab" styling for panels and updated icons.
