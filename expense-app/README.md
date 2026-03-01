# 💼 ExpenseFlow — Angular Expense Tracking & Approval System

A full-featured Angular 17 expense management system built with **standalone components**, **signals**, **lazy-loaded routes**, and **role-based access control**.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### Install & Run
```bash
# 1. Extract the project
unzip expense-flow-angular.zip
cd expense-flow

# 2. Install dependencies
npm install

# 3. Start dev server
npm start
# → Opens at http://localhost:4200
```

---

## 🔐 Demo Accounts

| Role     | Email                 | Password  |
|----------|-----------------------|-----------|
| Employee | employee@demo.com     | demo123   |
| Manager  | manager@demo.com      | demo123   |

Or click the **Quick Demo** buttons on the login page.

---

## 📁 Project Structure

```
src/app/
├── auth/
│   ├── login/            → Login with role selector
│   └── register/         → Registration with validation
├── shared/
│   ├── models/           → TypeScript interfaces & enums
│   ├── services/
│   │   ├── auth.service.ts     → Auth with Signals
│   │   ├── expense.service.ts  → CRUD + analytics
│   │   └── toast.service.ts    → Notification system
│   ├── guards/           → authGuard, employeeGuard, managerGuard, guestGuard
│   └── components/
│       ├── sidebar/      → Role-aware navigation sidebar
│       └── toast/        → Global toast notifications
├── dashboard/
│   ├── employee/
│   │   ├── employee-shell.component.ts  → Layout wrapper
│   │   └── overview/    → Stats, recent expenses, category chart
│   └── manager/
│       ├── manager-shell.component.ts   → Layout wrapper
│       └── overview/    → Team stats, pending queue, category summary
├── expenses/
│   ├── submit/           → Expense submission with validation
│   └── list/             → My expenses with search/filter + detail panel
├── approvals/
│   ├── pending/          → Pending approvals with review modal
│   └── all/              → All expenses (manager view)
└── reports/
    ├── employee-report/  → Monthly summaries + category breakdown
    └── manager-report/   → Team-wide analytics
```

---

## ✅ Features

### 🔐 Auth & Role-Based Access
- Employee & Manager roles
- Route guards (`authGuard`, `employeeGuard`, `managerGuard`, `guestGuard`)
- Session persistence via localStorage
- Registration with all validations

### 👤 Employee Dashboard
- **Overview** — Stats, recent expenses, category chart
- **Submit Expense** — Full form with validation rules:
  - Amount: ₹1 to ₹1,00,000
  - Date: cannot be in the future
  - Client Entertainment requires receipt reminder
  - Required fields enforced
- **My Expenses** — Search, filter by status/category, detail panel with manager notes
- **Monthly Summary** — 3-month breakdown, all-time stats, approval rate

### 👔 Manager Dashboard
- **Overview** — Team stats, quick approve/reject queue, category summary
- **Pending Approvals** — Full table with high-value warnings, review modal with notes
- **All Expenses** — Search/filter across entire team
- **Monthly Reports** — Team analytics and category breakdown

### 🎨 Design
- Dark editorial theme with Sora + JetBrains Mono fonts
- Noise texture overlay
- Animated glows and transitions
- Responsive sidebar navigation
- Status badges, progress bars, stat cards
- Slide-up modals and toast notifications

---

## 🏗️ Architecture

| Feature        | Implementation |
|----------------|----------------|
| Components     | Standalone (no NgModule) |
| State          | Angular Signals |
| Routing        | Lazy-loaded routes |
| Forms          | Template-driven with validation |
| Persistence    | localStorage |
| Styles         | Component-scoped SCSS + global utilities |
| Angular Version | 17 |

---

## 🧪 Testing Focus Areas

Per the hackathon spec:

**Expense Validation Rules**
- Title required
- Amount: min ₹1, max ₹1,00,000
- Category required
- Date: required, no future dates
- Receipt optional (warned for Client Entertainment)

**Approval Flow**
- Submit → Pending
- Manager quick-approve / reject from overview
- Manager detailed review with optional note
- Status updates instantly via Signals
- Employee sees manager note in expense detail

---

## 🔧 Build for Production
```bash
npm run build
# Output: dist/expense-flow/
```
