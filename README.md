# LeaveFlow — Automated Leave Processing and Management System

ND2 full-stack project using HTML5, CSS3, Vanilla JavaScript Fetch API, Express.js and MongoDB.

## Features
- Admin and employee roles
- Admin creates employee accounts with temporary credentials
- First-login password change
- Employee username/password login
- Leave types: annual, sick, maternity, paternity, compassionate, study, casual, unpaid
- Automatic working-day calculation (weekends excluded)
- Leave balance validation
- Overlapping leave detection
- Admin approval/rejection
- Employee leave history and cancellation of pending applications
- Responsive mobile/tablet/desktop interface

## Requirements
- Node.js 18+
- MongoDB (local or MongoDB Atlas)

## Setup
1. Copy `.env.example` to `.env`.
2. Set `MONGODB_URI` and `JWT_SECRET`.
3. Run:
   npm install
   npm start
4. Open http://localhost:5000

Default admin is created from `ADMIN_USERNAME` and `ADMIN_PASSWORD` in `.env`.

## Project structure
client/  -> HTML, CSS and browser JavaScript
server/  -> Express API, models, routes and authentication

## Important
This is an academic starter project. For production use, add stronger validation, rate limiting, audit logs, CSRF/security headers, password reset/email verification and a more sophisticated leave-policy engine.
