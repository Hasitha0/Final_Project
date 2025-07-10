# Roboto Font Family Usage Guide

## Available Font Variants

Your EcoTech project now includes the complete Roboto font family:

### 1. Roboto (Default)
- **Tailwind Class**: `font-roboto` or `font-sans` (default)
- **CSS**: `font-family: 'Roboto', sans-serif;`
- **Weights**: 100, 300, 400, 500, 700, 900
- **Usage**: Primary font for body text, buttons, and general UI elements

### 2. Roboto Condensed
- **Tailwind Class**: `font-roboto-condensed`
- **CSS**: `font-family: 'Roboto Condensed', sans-serif;`
- **Weights**: 100-900
- **Usage**: Ideal for headings, navigation, and space-constrained areas

### 3. Roboto Slab
- **Tailwind Class**: `font-roboto-slab`
- **CSS**: `font-family: 'Roboto Slab', serif;`
- **Weights**: 100-900
- **Usage**: Perfect for headings, hero sections, and emphasis text

## Usage Examples

### In JSX Components
```jsx
// Default Roboto
<p className="font-sans text-base">Regular body text</p>

// Roboto Condensed for headings
<h1 className="font-roboto-condensed text-4xl font-bold">
  Compact Heading
</h1>

// Roboto Slab for emphasis
<h2 className="font-roboto-slab text-2xl font-semibold">
  Elegant Serif Heading
</h2>
```

### Font Weight Classes
- `font-thin` - 100
- `font-light` - 300
- `font-normal` - 400 (default)
- `font-medium` - 500
- `font-bold` - 700
- `font-black` - 900

### Recommended Usage Patterns

1. **Headers & Navigation**: `font-roboto-condensed`
2. **Body Text**: `font-roboto` (default)
3. **Hero Sections**: `font-roboto-slab`
4. **Buttons**: `font-roboto font-medium`
5. **Captions**: `font-roboto font-light`

## Browser Support
All Roboto variants are loaded via Google Fonts with optimal performance and broad browser support. 