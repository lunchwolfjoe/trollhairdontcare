# TrollHairDontCare Frontend

A React application for managing volunteer shifts and tasks.

## Features

- User authentication (volunteers and coordinators)
- Shift management and swap requests
- Task assignment and tracking
- Real-time notifications
- Responsive design with Material-UI

## Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Supabase account and project

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`.

## Project Structure

```
src/
├── components/         # Reusable UI components
├── contexts/          # React contexts (auth, etc.)
├── features/          # Feature-specific components
│   ├── auth/         # Authentication components
│   ├── coordinator/  # Coordinator-specific components
│   └── volunteer/    # Volunteer-specific components
├── lib/              # Utility functions and configurations
└── types/            # TypeScript type definitions
```

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the production version
- `npm run preview` - Preview the production build locally
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
