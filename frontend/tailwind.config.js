/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0B1220',
        surface: '#111A2E',
        'surface-subtle': '#16223B',
        border: '#1F2A44',
        'border-strong': '#2C3A5A',
        text: '#E6EDF7',
        'text-secondary': '#8FA3C0',
        accent: '#22D3EE',
        'accent-hover': '#06B6D4',
        success: '#34D399',
        danger: '#F87171',
        warning: '#FBBF24',
      },
      fontFamily: {
        sans: ['Inter', 'Plus Jakarta Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
}
