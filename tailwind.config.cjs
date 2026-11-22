/** @type {import('tailwindcss').Config} */
module.exports = {
  important: false,
  content: [
    './app/**/*.{js,ts,jsx,tsx,scss,css}',
    // The engine's default pages, header, footer and home blocks carry their own Tailwind classes.
    './node_modules/@salla.sa/twilight-theme-engine/dist/**/*.js',
    // SSR'd skeletons and wrapper markup carry `s-*` classes; scan the package that renders them.
    './node_modules/@salla.sa/twilight-components-react/dist/**/*.js',
  ],
  // The engine's `<Image objectFit>` builds these at runtime, out of the scanner's sight.
  safelist: ['object-contain', 'object-cover'],
  // `hover:` only where a real pointer can hover, so a tap on a phone doesn't leave it stuck.
  future: { hoverOnlyWhenSupported: true },
  darkMode: 'class',
  theme: {
    container: {
      center: true,
      padding: 'var(--gutter)',
      screens: { '2xl': '1320px' },
    },
    // Arabic first: the store font from the Salla SDK (`--font-main`), then system fonts that
    // cover Arabic script on each platform, then the generic sans (never the default serif).
    fontFamily: {
      sans: [
        'var(--font-main)',
        'system-ui',
        '-apple-system',
        '"Segoe UI"',
        'Tahoma',
        '"Geeza Pro"',
        '"Noto Sans Arabic"',
        'Roboto',
        'Arial',
        'sans-serif',
      ],
      primary: ['var(--font-main)', 'system-ui', 'Tahoma', 'sans-serif'],
      head: ['var(--font-head, var(--font-main))', 'system-ui', 'Tahoma', 'sans-serif'],
    },
    extend: {
      transitionTimingFunction: {
        elastic: 'cubic-bezier(0.55, 0, 0.1, 1)',
      },
      gridTemplateColumns: {
        'auto-fill': 'repeat(auto-fill, 290px)',
      },
      colors: {
        // Theme tokens (app/styles/tokens.css). New components use these names, never hex values.
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        surface2: 'var(--surface2)',
        ink: 'var(--ink)',
        muted: 'var(--muted)',
        line: 'var(--line)',
        accent: 'var(--accent)',
        'accent-ink': 'var(--accent-ink)',
        'accent-soft': 'var(--accent-soft)',
        danger: 'var(--danger)',
        'danger-ink': 'var(--danger-ink)',
        // Read by the baseline styles (app/styles/0*) for the engine's default components.
        dark: '#1D1F1F',
        darker: '#0E0F0F',
        primary: 'var(--color-primary)',
        'primary-dark': 'var(--color-primary-dark)',
      },
      spacing: {
        3.75: '15px',
        7.5: '30px',
        58: '232px',
        62: '248px',
        100: '28rem',
        116: '464px',
        132: '528px',
        200: '800px',
      },
      borderRadius: {
        large: '22px',
        big: '40px',
        tiny: '3px',
        pill: '9999px',
        // `rounded` is the theme radius; Salla web components read the same value (`--s-radius`).
        DEFAULT: 'var(--radius)',
      },
      fontSize: {
        'icon-lg': '33px',
        xxs: '10px',
        xxxs: '8px',
        'title-size': '42px',
        '22px': '22px',
      },
      lineHeight: {
        12: '3rem',
        14: '3.5rem',
        16: '4rem',
        18: '4.5rem',
        20: '5rem',
      },
      boxShadow: {
        default: '5px 10px 30px #2B2D340D;',
        top: '0px 0px 10px #0000001A;',
        md: '5px 10px 99px #2B2D340D',
        dropdown: '0 4px 8px rgba(161, 121, 121, 0.07)',
        light: '0px 4px 15px rgba(1, 1, 1, 0.06)',
        huge: '0px 3px 6px #00000029',
        progress: '0 5px 15px rgba(92, 213, 196, 0.4)',
        mobile:
          'rgb(0 0 0 / 9%) 0px 2px 1px, rgb(0 0 0 / 9%) 0px 4px 2px, rgb(0 0 0 / 9%) 0px 8px 4px, rgb(0 0 0 / 9%) 0px 16px 18px, rgb(0 0 0 / 9%) -15px 10px 7px, rgb(0 0 0 / 9%) -20px 10px 20px, rgb(0 0 0 / 9%) -20px 10px 20px, rgb(0 0 0 / 9%) -25px 20px 20px',
      },
      width: {
        18: '4.5rem',
        22: '5.5rem',
        74: '18.5rem',
        76: '19rem',
        78: '19.5rem',
      },
      height: {
        banner: '200px',
        'lg-banner': '428px',
        'full-banner': '600px',
        500: '500px',
        460: '460px',
      },
      minWidth: {
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
      },
      maxWidth: {
        '1/4': '25%',
        '1/2': '50%',
        '3/4': '75%',
      },
      zIndex: {
        1: '1',
        2: '2',
        '-1': '-1',
      },
      screens: {
        xxs: { min: '380px', max: '479px' },
        xs: '480px',
      },
      backgroundOpacity: {
        '05': '0.05',
      },
      transitionProperty: {
        height: 'height',
      },
      keyframes: {
        slideUpFromBottom: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0%)', opacity: '1' },
        },
        slideDownFromBottom: {
          '0%': { transform: 'translateY(0%)', opacity: '1' },
          '100%': { transform: 'translateY(100%)', opacity: '0' },
        },
      },
      animation: {
        slideUpFromBottom: 'slideUpFromBottom .6s linear',
        slideDownFromBottom: 'slideDownFromBottom .6s linear',
      },
    },
  },
  corePlugins: {
    outline: false,
  },
  plugins: [require('@salla.sa/twilight-tailwind-theme'), require('@tailwindcss/forms')],
};
