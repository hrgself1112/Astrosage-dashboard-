# Astrosage Dashboard - Next.js 16

A modern admin dashboard built with Next.js 16, React 18, and Material Design 3.

## Features

- **Admin Panel**: Complete user management, role management, and audit logging
- **Background Removal Tool**: Bulk image background removal using Canvas API
- **Authentication**: Firebase-based authentication with role-based access control
- **Modern UI**: Material Design 3 with dark/light theme support
- **Responsive Design**: Mobile-first responsive design with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **UI**: React 18, TypeScript, Tailwind CSS
- **Components**: Radix UI, Lucide React icons
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Styling**: Material Design 3 system
- **Development**: ESLint, TypeScript

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase:
   - Create a Firebase project at https://console.firebase.google.com
   - Enable Authentication, Firestore, and Storage
   - Download service account key and place it as `service-account-key.json`
   - Copy Firebase configuration to `.env.local`

4. Update environment variables in `.env.local`:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
   ```

### Running the Application

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

Type checking:
```bash
npm run type-check
```

Linting:
```bash
npm run lint
```

## Project Structure

```
nextjs-app/
├── app/                    # Next.js App Router pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── (auth)/            # Authentication pages
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── admin/            # Admin panel components
│   └── *.tsx             # Feature components
├── contexts/             # React contexts
├── lib/                  # Utility libraries
├── services/             # API services
├── types/                # TypeScript type definitions
└── *.config.*            # Configuration files
```

## Features Overview

### Admin Panel
- **User Management**: Create, edit, delete users with role assignments
- **Role Management**: Configure permissions and access control
- **Audit Logs**: Track system activity and user actions
- **Bulk Operations**: Mass user actions with filtering and search

### Background Removal Tool
- **Drag & Drop**: Intuitive file upload interface
- **Bulk Processing**: Process multiple images simultaneously
- **Progress Tracking**: Real-time progress updates
- **Download Options**: Download processed images individually or as ZIP

### Authentication
- **Firebase Auth**: Secure authentication with email/password
- **Role-Based Access**: Admin and user roles with different permissions
- **Session Management**: Automatic session timeout and renewal

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Admin
- `GET /api/users` - List users (admin only)
- `POST /api/users` - Create user (admin only)
- `PUT /api/users/[id]` - Update user (admin only)
- `DELETE /api/users/[id]` - Delete user (admin only)

### Audit Logs
- `GET /api/audit` - Get audit logs (admin only)
- `POST /api/audit` - Create audit log entry

## Environment Variables

See `.env.local.example` for required environment variables.

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
Ensure the following are configured:
- Node.js 18+ runtime
- Environment variables
- Build command: `npm run build`
- Start command: `npm start`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please open an issue on GitHub.