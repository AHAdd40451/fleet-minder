# GlassyApp

## Overview

GlassyApp is a React Native Expo application that showcases a modern glassy UI design system with beautiful blur effects and gradient backgrounds. The app is built with cross-platform compatibility in mind, supporting iOS, Android, and web platforms. It features a comprehensive set of reusable glass-morphism components and integrates with Supabase for backend services and authentication.

**Current Status**: Fully functional React Native Expo app with:
- Cross-platform support (Web, iOS, Android) 
- Beautiful glassy UI components with blur effects
- Supabase integration configured and ready
- Development server running on port 5000
- Modern gradient-based design system

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The application follows a component-based React Native architecture built on Expo framework:

- **Navigation**: Uses React Navigation with Stack Navigator for screen management, currently configured with header hidden for custom UI control
- **Component System**: Modular glass-morphism UI components including GlassCard, GlassButton, and GlassInput that leverage expo-blur and expo-linear-gradient for visual effects
- **Styling**: Centralized theme system with comprehensive color palettes, typography, spacing, and glass effect configurations
- **State Management**: Currently uses React's built-in state management (useState/useEffect), suitable for the current simple structure

### Cross-Platform Support
The app is configured for multi-platform deployment:
- **iOS**: Native iOS support with tablet compatibility
- **Android**: Adaptive icon support for modern Android devices  
- **Web**: Metro bundler configuration for web deployment with favicon support

### UI Design System
The core architectural decision centers around glass-morphism design:
- **Glass Effects**: Consistent blur intensity and transparency across components
- **Color System**: Sophisticated RGBA-based color palette with opacity variants for glass effects
- **Gradient Backgrounds**: Linear gradients used extensively for depth and visual appeal
- **Component Reusability**: Standardized props interface across glass components for consistency

### Screen Architecture
Currently implements a single-screen architecture with:
- **HomeScreen**: Main landing page showcasing the glass component library
- **Scrollable Layout**: Vertical scroll container for content presentation
- **Card-based Content**: Feature showcase using glass card components

## External Dependencies

### Core Framework
- **Expo SDK**: Version 54.x for React Native development and deployment
- **React Native**: Version 0.81.x for cross-platform mobile development

### UI and Animation Libraries
- **expo-blur**: Provides native blur effects for glass-morphism components
- **expo-linear-gradient**: Creates gradient backgrounds and overlays
- **react-native-reanimated**: Animation library for smooth transitions (configured but not yet implemented)
- **react-native-gesture-handler**: Touch gesture handling
- **@expo/vector-icons**: Icon library for UI elements

### Navigation
- **@react-navigation/native**: Core navigation functionality
- **@react-navigation/stack**: Stack-based navigation pattern
- **@react-navigation/bottom-tabs**: Tab navigation (installed but not yet implemented)

### Backend Integration
- **Supabase**: Backend-as-a-Service platform providing:
  - User authentication and authorization
  - Real-time database capabilities
  - RESTful API access
  - Environment-based configuration for URL and API keys

### Development Tools
- **expo-constants**: Access to app configuration and environment variables
- **expo-device**: Device information and capabilities detection
- **expo-font**: Custom font loading capabilities
- **Metro**: JavaScript bundler for Expo applications