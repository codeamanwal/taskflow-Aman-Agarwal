# TaskFlow — Frontend Submission

This is the frontend implementation of the TaskFlow engineering take-home assignment.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
1. Navigate to the frontend directory:
   ```bash
   cd vite-project
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173) in your browser.

### Test Credentials
- **Email**: `test@example.com`
- **Password**: `password123`

---

## ✨ Features Implemented

### 1. Robust Authentication
- **Login & Register**: Full client-side validation with specific error messages.
- **Persistence**: Auth state persists across refreshes using `localStorage`.
- **Protected Routes**: Secure navigation using React Router guards.

### 2. Advanced Project Management
- **Dashboard**: High-end grid view of projects with task count indicators and creation flow.
- **Kanban Board**: Drag-and-drop task management powered by `@hello-pangea/dnd`.
- **Task CRUD**: Detailed modal for creating and editing tasks with priority, status, assignee, and due dates.

### 3. Professional UI/UX
- **Dark Mode**: Persistent dark mode support with a sleekZinc/Slate palette.
- **Optimistic UI**: Instant feedback on task status changes with automatic revert on failure.
- **Responsive Design**: Mobile-first approach, fully compatible with all screen sizes.
- **State Management**: React Context API for lightweight, efficient state handling.
- **Loading States**: Graceful skeletons and spinners for all asynchronous operations.

### 4. Mock API Layer
- **Persistent Backend Simulator**: Custom service using `localStorage` to simulate a real REST API.
- **Latency Emulation**: Artificial delays to demonstrate loading states and UX resilience.
- **Relationship Mapping**: Handles user-project-task relationships seamlessly.

---

## 🛠 Tech Stack
- **Framework**: React 19 (Vite)
- **Styling**: Tailwind CSS v4 (Modern & High Performance)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns
- **DND**: @hello-pangea/dnd
- **Persistence**: Custom localStorage wrapper

---

## 🏗 Key Decisions
- **Optimistic Updates**: Implemented for status changes to ensure the board feels snappy and professional.
- **Bespoke UI Components**: Avoided heavy UI libraries in favor of custom, highly-performant Tailwind components to demonstrate CSS mastery.
- **Relationship Modeling**: Added `getUsers` and `assignee_id` logic to go beyond basic boilerplate and show full-stack awareness.
