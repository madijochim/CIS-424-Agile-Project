# Small Business Payroll Processing System

## Project Overview

A web application designed to give small businesses an affordable, simplified payroll processing solution. The system enables businesses to calculate employee wages, overtime, bonuses, reimbursements, and tax deductions — reducing errors, saving time, and eliminating dependence on expensive third-party payroll services.

## Course

**CIS 424 – Software Development With Agile Methodologies**

## Features

- Employee management (add, edit, deactivate employees)
- Wage and salary calculation (hourly and salaried)
- Overtime calculation
- Bonus and reimbursement tracking
- Tax deduction computation (federal, state, local)
- Payroll run history and reporting
- User authentication and role-based access

## Project Structure

```
├── frontend/               # Client-side web application
│   ├── public/             # Static assets (index.html, favicon, etc.)
│   └── src/
│       ├── assets/         # Images, fonts, and global styles
│       ├── components/     # Reusable UI components
│       │   ├── auth/       # Login, registration, and auth guards
│       │   ├── dashboard/  # Main dashboard widgets
│       │   ├── employees/  # Employee management components
│       │   ├── payroll/    # Payroll processing components
│       │   └── reports/    # Reporting and export components
│       ├── pages/          # Top-level page views
│       ├── services/       # API communication layer
│       └── utils/          # Shared helper functions
│
├── backend/                # Server-side application
│   ├── src/
│   │   ├── config/         # Environment and app configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, validation, error handling
│   │   ├── models/         # Data models / database schemas
│   │   ├── routes/         # API route definitions
│   │   ├── services/       # Business logic (payroll calculations, etc.)
│   │   └── utils/          # Shared utility functions
│   └── tests/              # Backend unit and integration tests
│
├── database/               # Database management
│   ├── migrations/         # Schema migration scripts
│   └── seeds/              # Sample/seed data for development
│
└── docs/                   # Project documentation
    ├── diagrams/           # UML, ERD, and architecture diagrams
    ├── meeting-notes/      # Sprint and team meeting notes
    ├── requirements/       # User stories, requirements, and acceptance criteria
    └── sprints/            # Sprint planning, reviews, and retrospectives
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Database (TBD by team)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd "CIS 424 Agile Project"
   ```

2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```

3. Install backend dependencies:
   ```bash
   cd ../backend
   npm install
   ```

4. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your local settings
   ```

5. Run database migrations:
   ```bash
   npm run migrate
   ```

6. Start the development servers:
   ```bash
   # Backend
   npm run dev

   # Frontend (in a separate terminal)
   cd ../frontend
   npm run dev
   ```

## Team

| Name | Role |
|------|------|
|      |      |
|      |      |
|      |      |

## Agile Process

This project follows Scrum methodology:
- **Sprint Length:** 2 weeks
- **Sprint artifacts** are stored in `docs/sprints/`
- **Meeting notes** are stored in `docs/meeting-notes/`

## License

This project is developed for academic purposes as part of CIS 424.
