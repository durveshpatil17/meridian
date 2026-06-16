# Meridian

Meridian is a personal MBA and creative life organizer built with React, Vite, and Supabase.

## Local Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/meridian.git
   cd meridian
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env.local` and add your Supabase credentials:
   ```bash
   cp .env.example .env.local
   ```
   Edit `.env.local`:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

### Vercel Deployment

1. Push this repository to GitHub.
2. Go to [Vercel](https://vercel.com) and import the repository.
3. In the Vercel dashboard, add the Environment Variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
4. Deploy.

### Supabase Edge Function Deployment

To deploy the Gemini chat proxy, you need the Supabase CLI installed.

1. Login to Supabase CLI:
   ```bash
   supabase login
   ```
2. Link your project:
   ```bash
   supabase link --project-ref your-project-ref
   ```
3. Set the Gemini API key secret:
   ```bash
   supabase secrets set GEMINI_API_KEY=your_gemini_key
   ```
4. Deploy the function:
   ```bash
   supabase functions deploy gemini-chat
   ```
