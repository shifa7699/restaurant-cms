# TODO List for User Dashboard and Login Flow

## Task Overview
- Add "Book Table" and "View Reservations" buttons to user dashboard
- Add booking form to user dashboard
- Require login for booking from home page

## Steps Completed:

- [x] 1. Modify backend/user-dashboard.html - Add buttons and booking form
- [x] 2. Modify frontend/src/Reservation.jsx - Add login check before booking
- [x] 3. Modify frontend/src/Home.jsx - Require login before booking

## Summary of Changes:

### 1. backend/user-dashboard.html
- Added "Book Table" and "View Reservations" navigation buttons
- Added complete booking form (same as Reservation.jsx)
- Added JavaScript functions to toggle between views
- Pre-fills user's email when booking
- Submits reservation to backend API

### 2. frontend/src/Reservation.jsx
- Added login check in handleSubmit
- Shows "Please login first to book a table!" alert when not logged in
- Opens login modal when user tries to book without being logged in

### 3. frontend/src/Home.jsx
- Changed "Book Table" button from Link to button with onClick handler
- Checks sessionStorage for user login status
- Shows alert and opens login dropdown if not logged in
- Redirects to reservation page if logged in

