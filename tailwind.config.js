/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: '#14110f',
        panel: '#1d1915',
        panel2: '#241f1a',
        ink: '#ece3d4',
        muted: '#9a8f7d',
        faint: '#6a6052',
        accent: '#c0392b',
        accent2: '#d4642f',
        conv: '#c0392b',
        acq: '#5aa17a',
        trial: '#d4a23a',
        closed: '#7d7468',
        policy: '#4a86b0',
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Spectral"', 'Georgia', 'serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      backgroundImage: {
        'radial-accent': 'radial-gradient(circle at 20% -10%, rgba(192,57,43,0.08), transparent 45%), radial-gradient(circle at 90% 0%, rgba(212,100,47,0.06), transparent 40%)',
      },
    },
  },
  plugins: [],
}
