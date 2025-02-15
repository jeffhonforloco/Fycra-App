# Fycra Android App

Native Android application for Fycra - AI YouTube Thumbnail Generator.

## Requirements

- Android Studio Hedgehog (2023.1.1) or newer
- Kotlin 1.9.0+
- Minimum SDK: 24 (Android 7.0)
- Target SDK: 34 (Android 14)

## Setup

1. Open the project in Android Studio
2. Sync Gradle files
3. Configure environment variables in `local.properties`

## Architecture

The app follows Clean Architecture with MVVM pattern and Jetpack Compose:

- `app/`: Application module
  - `src/main/`
    - `kotlin/com/fycra/app/`
      - `FycraApplication.kt`
      - `MainActivity.kt`
      - `di/`: Dependency injection
      - `ui/`: UI components
      - `util/`: Utilities

- `features/`: Feature modules
  - `auth/`: Authentication
  - `dashboard/`: Main dashboard
  - `generation/`: Thumbnail generation
  - `settings/`: App settings

- `core/`: Core functionality
  - `network/`: Networking
  - `database/`: Local storage
  - `security/`: Security
  - `analytics/`: Analytics

- `common/`: Shared components
  - `ui/`: Reusable composables
  - `util/`: Utilities
  - `test/`: Test utilities

## Features

- [ ] Material You design
- [ ] Dark/Light theme
- [ ] Offline support
- [ ] Biometric authentication
- [ ] Push notifications
- [ ] Widget support
- [ ] App shortcuts

## Security

- Certificate pinning
- Biometric authentication
- SafetyNet attestation
- Secure key storage
- Root detection
- App security policies