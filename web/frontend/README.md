# Nexus Platform - Web Frontend

Beautiful, responsive React + Next.js frontend for the Nexus Global Impact Platform.

## Features

- 🎨 **Modern UI** - Built with React, Next.js, and Tailwind CSS
- 📱 **Responsive Design** - Mobile-first, works on all devices
- 🔐 **Authentication** - JWT-based auth with secure token storage
- 🌐 **Multi-Module** - Healthcare, Education, Economic, Data, Crisis
- 📊 **Real-Time Data** - Live SDG tracking and platform metrics
- ♿ **Accessible** - WCAG 2.1 AA compliant
- 🚀 **Fast** - Optimized for performance with Next.js SSR

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.local.example .env.local

# Start development server
npm run dev

# Open http://localhost:3000
```

## Project Structure

```
src/
  components/      # Reusable UI components
    Layout.tsx     # Main layout with navigation
  lib/            # Utilities and API client
    api.ts        # API client with all endpoints
  pages/          # Next.js pages
    index.tsx     # Landing page
    dashboard.tsx # User dashboard
    healthcare.tsx
    education.tsx
    economic.tsx
    data.tsx
    crisis.tsx
    login.tsx
    register.tsx
  store/          # State management (Zustand)
    authStore.ts  # Authentication state
  styles/         # Global styles
    globals.css   # Tailwind CSS configuration
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## API Integration

The frontend connects to the following services:

- **Auth Service** (port 3001) - User authentication
- **Healthcare Service** (port 3003) - Healthcare features
- **Education Service** (port 3004) - Courses and learning
- **Economic Service** (port 3005) - Jobs and wallet
- **Data Analytics Service** (port 3006) - SDG tracking
- **Crisis Service** (port 3007) - Crisis response
- **AI/ML Service** (port 3008) - AI features

All requests go through the API Gateway on port 8000.

## Key Pages

### Landing Page (/)
- Platform overview with statistics
- Module showcase
- Call-to-action for registration

### Dashboard (/dashboard)
- Personalized welcome
- Quick actions
- Platform impact metrics
- Module access cards

### Healthcare (/healthcare)
- Book appointments
- View providers
- Healthcare training modules
- Health data submission

### Education (/education)
- Course catalog
- My enrollments
- Certificates
- AI-powered recommendations

### Economic (/economic)
- Job marketplace
- Mobile wallet
- Microlending
- Women's programs

### Data & Analytics (/data)
- SDG progress tracking (all 17 goals)
- Platform impact metrics
- Open data access

### Crisis Response (/crisis)
- Crisis map
- Active alerts
- Volunteer registration
- Incident reporting

## State Management

Using Zustand for lightweight state management:

- `authStore` - User authentication state
- Persisted to localStorage
- Automatic token management

## Styling

- **Tailwind CSS** - Utility-first CSS framework
- **Custom Colors** - Primary (blue) and secondary (purple) themes
- **Responsive** - Mobile-first breakpoints
- **Dark Mode** - Ready (media query support)

## Authentication Flow

1. User registers/logs in
2. Backend returns JWT token
3. Token stored in localStorage and Zustand
4. Token added to all API requests via Axios interceptor
5. Automatic redirect if not authenticated

## Development

### Adding a New Page

1. Create file in `src/pages/`
2. Import Layout component
3. Add to navigation in `Layout.tsx`
4. Add API calls if needed in `lib/api.ts`

### Adding API Endpoints

Add to `lib/api.ts`:

```typescript
export const myModuleAPI = {
  getData: () => api.get('/api/v1/mymodule/data'),
  postData: (data: any) => api.post('/api/v1/mymodule/data', data),
};
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Docker

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production
CMD ["npm", "start"]
```

## Environment Variables

- `NEXT_PUBLIC_API_URL` - API Gateway URL
- `NEXT_PUBLIC_AUTH_URL` - Auth service URL (optional, uses API_URL by default)

## Browser Support

- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
- Mobile browsers

## Contributing

See [CONTRIBUTING.md](../../CONTRIBUTING.md) in the root directory.

## License

MIT License - See [LICENSE](../../LICENSE)

---

Built with ❤️ for global impact
