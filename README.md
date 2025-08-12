# TimePicker - Simple Time Selection Component

A lightweight, customizable time picker that works with any project using a single script tag.

## Features

- 🚀 **Single script import** - Just one line to get started
- 🎨 **Fully customizable** - Colors and themes via CSS variables
- ⚙️ **Configurable intervals** - 1, 5, 10, 15, 30 minute increments
- 📱 **Responsive** - Adapts to input width and screen size
- 🔧 **Auto-initialization** - Works with dynamically added inputs
- 💾 **No dependencies** - Pure vanilla JavaScript

## Quick Start

### 1. Add the Script

```html
<script src="https://cdn.jsdelivr.net/gh/yourusername/timepicker@main/timepicker.js"></script>
```

### 2. Use on Any Input

```html
<input data-time-picker placeholder="Select time">
<input data-time-picker data-minute-interval="5" placeholder="5-min intervals">
<input data-time-picker data-minute-interval="15" placeholder="15-min intervals">
```

That's it! The time picker will automatically initialize on all inputs with the `data-time-picker` attribute.

## Configuration Options

### Minute Intervals

Use the `data-minute-interval` attribute to set minute increments:

```html
<input data-time-picker data-minute-interval="1">  <!-- 1-minute intervals (default) -->
<input data-time-picker data-minute-interval="5">  <!-- 5-minute intervals -->
<input data-time-picker data-minute-interval="10"> <!-- 10-minute intervals -->
<input data-time-picker data-minute-interval="15"> <!-- 15-minute intervals -->
<input data-time-picker data-minute-interval="30"> <!-- 30-minute intervals -->
```

## Customization

### Basic Color Customization

Override the default colors using CSS custom properties:

```css
:root {
    --timepicker-primary: #e53e3e;     /* OK button and accents */
    --timepicker-bg: white;            /* Popup background */
    --timepicker-text: #666;           /* Text color */
    --timepicker-selected: #000;       /* Selected item text */
    --timepicker-border: #ddd;         /* Border color */
}
```

### Theme Examples

#### Dark Theme
```css
.dark-theme {
    --timepicker-bg: #2d3748;
    --timepicker-border: #4a5568;
    --timepicker-text: #e2e8f0;
    --timepicker-selected: #ffffff;
    --timepicker-primary: #4299e1;
    --timepicker-secondary: #4a5568;
    --timepicker-shadow: rgba(0, 0, 0, 0.5);
    --timepicker-separator: #cbd5e0;
}
```

#### Red Theme
```css
.red-theme {
    --timepicker-primary: #e53e3e;
    --timepicker-selected: #c53030;
}
```

### All Available CSS Variables

```css
:root {
    --timepicker-bg: white;              /* Popup background */
    --timepicker-border: #ddd;           /* Border color */
    --timepicker-text: #666;             /* Normal text color */
    --timepicker-selected: #000;         /* Selected item text */
    --timepicker-primary: #007bff;       /* Primary button color */
    --timepicker-secondary: #f5f5f5;     /* Secondary button color */
    --timepicker-shadow: rgba(0,0,0,0.2); /* Popup shadow */
    --timepicker-separator: #333;        /* Colon separator color */
}
```

## Features

### Responsive Design
- Adapts popup width to match input field width (minimum 200px)
- Responsive breakpoints for mobile devices
- Smart positioning to stay within viewport

### Accessibility
- Keyboard navigation support
- Proper ARIA attributes
- Screen reader friendly

### Auto-initialization
- Works with dynamically added inputs
- Mutation observer watches for new elements
- No need to manually initialize

## Browser Support

- Chrome/Edge 60+
- Firefox 55+
- Safari 12+
- Mobile browsers

## File Size

- **Minified**: ~8KB
- **Gzipped**: ~3KB

## Manual Usage

For advanced usage, you can manually initialize time pickers:

```javascript
// Manual initialization
const input = document.querySelector('#my-input');
const timePicker = new TimePicker(input);

// Destroy when needed
timePicker.destroy();
```

## Events

The component triggers standard `change` and `input` events when a time is selected:

```javascript
document.querySelector('input[data-time-picker]').addEventListener('change', function(e) {
    console.log('Selected time:', e.target.value); // "02:30 PM"
});
```

## CDN Options

### jsDelivr (Recommended)
```html
<script src="https://cdn.jsdelivr.net/gh/yourusername/timepicker@main/timepicker.js"></script>
```

### GitHub Pages
```html
<script src="https://yourusername.github.io/timepicker/timepicker.js"></script>
```

### Local File
```html
<script src="./timepicker.js"></script>
```

## License

MIT License - feel free to use in any project!