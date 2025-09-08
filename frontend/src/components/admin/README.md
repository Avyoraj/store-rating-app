# Admin Components Structure

This directory contains all admin-related components organized in a clean, modular way.

## Components

### Core Components
- `OverviewTab.jsx` - Dashboard overview with statistics cards
- `UsersTab.jsx` - User management table with search/filter capabilities
- `StoresTab.jsx` - Store listing table with ratings

### Modal Components
- `AddUserModal.jsx` - Modal for creating new users
- `AddStoreModal.jsx` - Modal for creating new stores
- `UserDetailsModal.jsx` - Modal for viewing user details

### Export
- `index.js` - Central export file for all admin components

## Usage

```jsx
import {
  OverviewTab,
  UsersTab,
  StoresTab,
  AddUserModal,
  AddStoreModal,
  UserDetailsModal
} from '../components/admin';
```

## Features

- **Consistent Design**: All components follow the same design patterns
- **Reusable**: Components are designed to be easily reusable
- **TypeScript Ready**: Components use proper prop validation
- **Accessible**: Components follow accessibility best practices
- **Responsive**: All components are mobile-friendly

## File Organization

```
admin/
├── index.js              # Central exports
├── OverviewTab.jsx        # Statistics overview
├── UsersTab.jsx          # User management
├── StoresTab.jsx         # Store listings
├── AddUserModal.jsx      # User creation modal
├── AddStoreModal.jsx     # Store creation modal
└── UserDetailsModal.jsx  # User details modal
```
