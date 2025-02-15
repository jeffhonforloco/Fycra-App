# Fycra iOS App

Native iOS application for Fycra - AI YouTube Thumbnail Generator.

## Requirements

- Xcode 15.0+
- iOS 17.0+
- Swift 5.9+

## Setup

1. Install dependencies:
```bash
cd ios
pod install
```

2. Open `Fycra.xcworkspace` in Xcode

3. Configure environment variables in `Config/Environment.swift`

## Architecture

The app follows Clean Architecture with MVVM pattern:

- `App/`: Application layer
  - `AppDelegate.swift`
  - `SceneDelegate.swift`
  - `AppCoordinator.swift`
  
- `Features/`: Feature modules
  - `Authentication/`: Auth flows
  - `Dashboard/`: Main dashboard
  - `Generation/`: Thumbnail generation
  - `Settings/`: App settings

- `Core/`: Core functionality
  - `Network/`: Networking layer
  - `Storage/`: Local storage
  - `Security/`: Security utilities
  - `Analytics/`: Analytics tracking

- `Common/`: Shared components
  - `Views/`: Reusable UI components
  - `Extensions/`: Swift extensions
  - `Utilities/`: Helper functions

- `Resources/`: Assets and resources
  - `Assets.xcassets`
  - `Localizable.strings`
  - `Info.plist`

## Features

- [ ] User Authentication
- [ ] Thumbnail Dashboard
- [ ] Thumbnail Generation
- [ ] A/B Testing
- [ ] Analytics
- [ ] Push Notifications
- [ ] Offline Support

## Security

- Keychain for sensitive data
- Certificate pinning
- Biometric authentication
- App transport security
- Jailbreak detection
- Secure local storage