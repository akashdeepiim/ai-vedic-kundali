# Vedic Astra

A sophisticated Vedic Astrology application that combines ancient Jyotish wisdom with modern AI to provide deep, personalized life insights.

## Features

- **Advanced Kundali Generation**: Accurate calculation of planetary positions, Rasi charts, and Nakshatras using the `astronomy-engine` and `date-fns` libraries.
- **South Indian Chart Style**: Traditional South Indian chart visualization for clear planetary alignment view.
- **AI-Powered Analysis**: Generates detailed reports on Career, Love, Marriage, and Daily/Weekly/Monthly outlooks using OpenAI's GPT-3.5 Turbo.
- **Major Life Events Timeline**: Interactive timeline highlighting 5-7 significant future events (next 15 years) with detailed predictions.
- **Indian English TTS**: Built-in Text-to-Speech engine that automatically selects a natural Indian English voice for reading reports aloud.
- **Modern UI/UX**: Beautiful glassmorphism design with smooth animations and responsive layout.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Lucide React
- **AI**: OpenAI API
- **Astrology**: Custom implementation based on `astronomy-engine`

## Getting Started

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/akashdeepiim/vedic-astra.git
    cd vedic-astra
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Set up Environment Variables**:
    Create a `.env.local` file in the root directory and add your OpenAI API key:
    ```env
    OPENAI_API_KEY=your_api_key_here
    ```

4.  **Run the development server**:
    ```bash
    npm run dev
    ```

5.  Open [http://localhost:3000](http://localhost:3000) with your browser.

## Project Structure

- `app/kundali`: Main application page.
- `app/api/analyze`: Backend API route for generating AI analysis.
- `components/AnalysisReport.tsx`: Main component for displaying the report and timeline.
- `lib/astrology`: Core astrological calculation logic.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.
