# Components

## 📌 Purpose
This folder contains reusable components used throughout the Mirror Exhibit e-commerce platform.

## 📂 Files Overview
- `StoreProvider.tsx` - Redux store provider component with client-side only rendering

## 🧩 Components and Functions

### StoreProvider
- **Purpose:** Provides the Redux store to the application with client-side only rendering
- **Usage:** Used in the root layout to wrap the application with the Redux store
- **Features:**
  - Uses useRef to ensure the store is only created once per client session
  - Creates the Redux store on the client side to avoid server-side rendering issues
  - Prevents errors related to localStorage and window access on the server
  - Implements a pattern that's compatible with Next.js 14+ and App Router

## 🔄 Recent Changes
| Date       | Change Description                                                 | Reason                                      |
|------------|-------------------------------------------------------------------|---------------------------------------------|
| 2023-06-15 | Created StoreProvider component                                   | Fix server-side rendering issues with Redux |
| 2024-05-15 | Updated StoreProvider to use useRef for store creation            | Fix "Cannot find module '@reduxjs.js'" error in Next.js 14 |
