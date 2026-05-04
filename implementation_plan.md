# Build "TheOtherHand" - A Handwriting Practice App

This plan outlines the architecture and steps to build a premium, minimal web application that allows adults to practice handwriting using their non-dominant hand. It will include structured daily worksheets and free-practice banks. 

## User Review Required

> [!IMPORTANT]
> **Tech Stack Overview:** I propose using **React + Vite** for the application framework to manage the UI state efficiently, and **Vanilla CSS** for styling to create a dynamic, premium, minimal look. Is this acceptable?

> [!NOTE]
> **Data Storage:** By default, I will use browser `localStorage` to save user progress, daily streaks, and the current level of worksheets. This means the app will work offline but progress will remain on the single device. Is this okay?

> [!WARNING]
> **Notifications:** To implement daily notifications on a website, we need to ask the user for Notification permissions, and we will set up a basic Service Worker so the site can be installed as a Progressive Web App (PWA) to ensure notifications can work reliably.

## Proposed Changes

### 1. Project Initialization & Setup
- Initialize a new React + TypeScript application via Vite.
- Setup the core Vanilla CSS design tokens (typography, colors, micro-animations) prioritizing a premium, minimalistic aesthetic (e.g., sleek dark mode/light mode toggle with smooth gradients).

### 2. Core Components (The Writing Engine)
- **`CanvasPanel`**: A highly responsive HTML5 Canvas component that smooths out cursor/touch points to simulate realistic ink flow. It will have a clear button, undo, and an area for a reference character.
- **`Layout / Navigation`**: A sleek bottom or side navigation bar to switch between the Progress Tab and Practice Bank.

### 3. Application Modes
- **Practice Bank**: A tab displaying galleries of practice items (Numbers, Letters (UpperCase/LowerCase), Shapes, Lines). Selecting one opens the `CanvasPanel` with that item as a faded template in the background.
- **Daily Worksheet (Progress Mode)**: The main hub.
  - A dashboard showing current streak, daily goal status, and current level.
  - Generates a sequence of items to practice for the day based on the user's level (e.g., Day 1: lines and simple shapes. Day 5: letters. Day 15: simple words).
  - Handles the localized progression state.

### 4. Service Worker & Notifications
- Implement basic PWA metadata (`manifest.json`).
- Request notification permissions and register a timer or schedule (e.g., remind at 8 PM daily) if the daily goal hasn't been met.

## Open Questions

1. Do you have a specific color palette in mind for the "minimal" design, or should I proceed with an elegant monochrome/dark-mode palette with subtle accent gradients?
2. Should the user be forced to complete the "Progress" daily worksheet before accessing the "Practice bank", or are both always open?

## Verification Plan

### Automated Tests
- Build verification: `npm run build` to ensure Vite bundles correctly.
- Test responsive CSS sizing.

### Manual Verification
- Render the UI in a browser subagent and assess the "premium feel" visually.
- Test the HTML5 Canvas handwriting flow using the mouse.
- Verify that clearing/submitting an item correctly updates the daily progress in LocalStorage.
