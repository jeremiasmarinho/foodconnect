# 🎨 FoodConnect Frontend - React Native/Expo

## Current Status

✅ **Frontend Foundation Complete** - All core architecture and authentication implemented!

### ✅ Completed Features

- **Project Setup**: React Native + Expo + TypeScript configuration
- **Authentication System**: Complete login/register flow with JWT tokens
- **Navigation**: React Navigation with typed routes and tab navigation
- **UI Components**: Reusable Button, Input, Loading, ErrorView components
- **State Management**: React Query setup with custom hooks
- **API Integration**: Complete client with JWT interceptors and error handling
- **Theme System**: Consistent colors, typography, and spacing constants

### 🔄 Next Phase

- Social feed with infinite scroll
- Restaurant discovery features
- Post creation and interactions
- User profile management

## 📱 Architecture Overview

**Tech Stack:**

- React Native with Expo
- TypeScript for type safety
- React Navigation for routing
- React Query for API state management
- AsyncStorage for local persistence
- Expo Vector Icons for consistent iconography

## 📂 Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── common/         # Generic components (Button, Input, etc.)
│   │   ├── auth/           # Authentication components
│   │   ├── feed/           # Social feed components
│   │   ├── restaurant/     # Restaurant-related components
│   │   └── user/           # User profile components
│   ├── screens/            # App screens/pages
│   │   ├── auth/           # Login, Register, etc.
│   │   ├── feed/           # Main feed, post details
│   │   ├── restaurant/     # Restaurant list, details
│   │   ├── profile/        # User profiles
│   │   └── settings/       # App settings
│   ├── navigation/         # Navigation configuration
│   ├── services/           # API calls and business logic
│   │   ├── api/            # API client configuration
│   │   ├── auth/           # Authentication services
│   │   └── storage/        # Local storage utilities
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── constants/          # App constants and configs
├── assets/                 # Images, fonts, icons
└── docs/                   # Frontend documentation
```

## 🎯 Implementation Plan

### Phase 1: Foundation (Week 1)

- [x] Expo project setup
- [ ] Navigation structure
- [ ] API client configuration
- [ ] Authentication flow
- [ ] Basic UI components

### Phase 2: Core Features (Week 2-3)

- [ ] Social feed interface
- [ ] Restaurant discovery
- [ ] Post creation
- [ ] User profiles
- [ ] Real-time interactions

### Phase 3: Polish & Deploy (Week 4)

- [ ] UI/UX refinements
- [ ] Performance optimization
- [ ] Testing & debugging
- [ ] Expo deployment

## 🔧 Development Setup

1. Install dependencies: `npm install`
2. Start development server: `npm run web` or `npm run android`
3. Access Swagger API: `http://localhost:3000/api`

## 🧰 Scripts

- start: Expo Dev server (platform selection)
- web: Expo for Web
- android / ios: Open on device/emulator
- test: Run Jest test suites
- test:ci: Run Jest in CI mode with coverage
- typecheck: TypeScript type check without emitting
- ci: Run typecheck + tests (for pipelines)
- ci:all: Run lint + tests (lint placeholder for now)

## 🔗 Version Compatibility (Expo SDK 54)

This app pins React and test renderer versions to match Expo SDK 54 expectations to avoid warnings and ensure stable tooling:

- react: 19.1.0
- react-dom: 19.1.0
- react-test-renderer: 19.1.0
- jest: ~29.7.0

Notes:

- If you see compatibility warnings in the Expo banner, ensure the above versions are installed (they are pinned in `package.json` and enforced via `overrides`).
- React Native version is managed by Expo; keep SDK upgrades coordinated (update React versions accordingly).

## ✅ CI

Use the consolidated script that verifies types and tests:

- `npm run ci` — runs TypeScript typecheck and Jest in CI mode

For broader checks (once linting is configured):

- `npm run ci:all` — runs lint and tests

## 📋 Key Features to Implement

- **Authentication**: Login/Register with JWT
- **Social Feed**: Instagram-like post feed
- **Restaurant Discovery**: Search and browse restaurants
- **Social Interactions**: Like, comment, follow
- **User Profiles**: Personal and restaurant profiles
- **Real-time Updates**: Live feed updates
