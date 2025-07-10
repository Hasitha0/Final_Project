/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		fontFamily: {
  			sans: ['Roboto', 'sans-serif'],
  			roboto: ['Roboto', 'sans-serif'],
  			'roboto-condensed': ['Roboto Condensed', 'sans-serif'],
  			'roboto-slab': ['Roboto Slab', 'serif'],
  		},
  		animation: {
  			'text-gradient': 'text-gradient 1.5s linear infinite',
  			'meteor-effect': 'meteor 5s linear infinite',
  			'text-reveal': 'text-reveal 0.5s ease forwards',
  			'shiny-text': 'shiny-text 3s ease-in-out infinite',
  			'shiny-text-gradient': 'shiny-text-gradient 3s ease-in-out infinite',
  			'slow-spin': 'slow-spin 20s linear infinite',
  			'reverse-slow-spin': 'reverse-slow-spin 25s linear infinite',
        'gradient': 'gradient 8s ease infinite',
        'shimmer': 'shimmer 2s infinite',
        'meteor': 'meteor 5s linear infinite',
        'text-reveal': 'text-reveal 1s ease forwards'
  		},
  		keyframes: {
  			'text-gradient': {
  				'to': {
  					'backgroundPosition': '200% center'
  				}
  			},
  			meteor: {
  				'0%': {
  					transform: 'rotate(215deg) translateX(0)',
  					opacity: '1'
  				},
  				'70%': {
  					opacity: '1'
  				},
  				'100%': {
  					transform: 'rotate(215deg) translateX(-500px)',
  					opacity: '0'
  				}
  			},
  			'text-reveal': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(20px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			borderBeam: {
  				'0%': {
  					WebkitMaskPosition: '0% 0%'
  				},
  				'100%': {
  					WebkitMaskPosition: '300% 0%'
  				}
  			},
  			'shiny-text': {
  				'0%': {
  					backgroundPosition: '0% 50%',
  					color: 'hsla(160, 84%, 39%, 0.95)'
  				},
  				'50%': {
  					backgroundPosition: '100% 50%',
  					color: 'hsla(179, 67%, 57%, 0.95)'
  				},
  				'100%': {
  					backgroundPosition: '0% 50%',
  					color: 'hsla(160, 84%, 39%, 0.95)'
  				}
  			},
  			'shiny-text-gradient': {
  				'0%': {
  					backgroundPosition: '0% 50%'
  				},
  				'50%': {
  					backgroundPosition: '100% 50%'
  				},
  				'100%': {
  					backgroundPosition: '0% 50%'
  				}
  			},
  			'slow-spin': {
  				'0%': {
  					transform: 'rotate(0deg)'
  				},
  				'100%': {
  					transform: 'rotate(360deg)'
  				}
  			},
  			'reverse-slow-spin': {
  				'0%': {
  					transform: 'rotate(0deg)'
  				},
  				'100%': {
  					transform: 'rotate(-360deg)'
  				}
  			},
        gradient: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' }
        },
        shimmer: {
          'from': { backgroundPosition: '0 0' },
          'to': { backgroundPosition: '-200% 0' }
        }
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}

