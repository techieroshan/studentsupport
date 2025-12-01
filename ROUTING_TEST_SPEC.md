# Routing Test Specification

## Overview
This document specifies the expected behavior for the routing implementation in the StudentSupport application.

## Test Cases

### TC-1: URL Updates on Navigation
**Given:** User is on the home page (`/#/`)
**When:** User clicks on "Browse" in the navbar
**Then:** 
- URL should update to `/#/browse`
- Browser address bar should show the new URL
- Browse page with map should be displayed

### TC-2: Direct URL Navigation
**Given:** User navigates directly to `http://localhost:3001/#/browse`
**When:** Page loads
**Then:**
- Browse page with map should be displayed
- URL should remain `/#/browse`

### TC-3: Menu Item Navigation
**Given:** User is on any page
**When:** User clicks on any menu item (Browse, Donors, How It Works, etc.)
**Then:**
- URL should update to reflect the selected page
- Correct page content should be displayed
- Browser back/forward buttons should work

### TC-4: Browse Page Map Display
**Given:** User navigates to Browse page (`/#/browse`)
**When:** Page loads
**Then:**
- Leaflet.js map should be displayed
- Map should show markers for available requests and offers
- Map should be interactive (zoom, pan)

### TC-5: State Synchronization
**Given:** User navigates between pages
**When:** URL changes
**Then:**
- `currentPage` state should sync with URL
- Page content should match the URL route

### TC-6: Login Navigation
**Given:** User clicks "Student Login" or "I Want to Help"
**When:** Authentication modal appears
**Then:**
- URL should not change (login is modal, not route)
- After successful login, user should be redirected to appropriate dashboard
- URL should update to `/dashboard-seeker` or `/dashboard-donor`

### TC-7: Logout Navigation
**Given:** User is logged in and on any page
**When:** User clicks logout
**Then:**
- User should be redirected to home page
- URL should update to `/#/`
- User state should be cleared

## Implementation Details

### Routes Configured
- `/` - Home page
- `/browse` - Browse page with map
- `/admin` - Admin dashboard
- `/donors` - Donors page
- `/terms` - Terms of Use
- `/privacy` - Privacy Policy
- `/how-it-works` - How It Works page
- `/dashboard-seeker` - Student dashboard
- `/dashboard-donor` - Donor dashboard
- `/post-request` - Post request form
- `/post-offer` - Post offer form

### Router Type
- Using `HashRouter` for compatibility with static hosting
- Routes use hash-based navigation (`/#/route`)

### Navigation Method
- Using React Router's `useNavigate` hook
- `handleNavigate` function updates both URL and state
- State syncs with URL via `useLocation` hook

