# TimePicker Complete Usage Guide

A comprehensive, security-optimized time picker component that works anywhere with a single script tag.

## 🚀 Quick Start

**1. Add the Script:**
```html
<script src="https://cdn.jsdelivr.net/gh/NerovaAutomation/nerovaTimepicker@main/timepicker.js"></script>
```

**2. Add to Input Fields:**
```html
<input data-time-picker placeholder="Select time">
```

That's it! The time picker automatically initializes on all inputs with the `data-time-picker` attribute.

---

## 📋 All Features & Attributes

### Basic Configuration

| Attribute | Purpose | Example | Default |
|-----------|---------|---------|---------|
| `data-time-picker` | **Required** - Enables time picker | `data-time-picker` | - |
| `data-minute-interval` | Set minute increments | `data-minute-interval="15"` | `1` |

```html
<!-- Basic examples -->
<input data-time-picker placeholder="Any time">
<input data-time-picker data-minute-interval="5" placeholder="5-min intervals">
<input data-time-picker data-minute-interval="30" placeholder="30-min intervals">
```

### Auto-Default Time

| Attribute | Purpose | Example | Behavior |
|-----------|---------|---------|----------|
| `data-auto-default` | Auto-set to next available time | `data-auto-default="true"` | Sets to next interval from current time |
| `data-default-time` | Set specific default time | `data-default-time="2:30 PM"` | Shows this time when page loads |

```html
<!-- Auto-default examples -->
<input data-time-picker data-auto-default="true" data-minute-interval="15">
<input data-time-picker data-default-time="9:00 AM">
```

### Time Constraints (Same Day Only)

| Attribute | Purpose | Example | Behavior |
|-----------|---------|---------|----------|
| `data-min-time` | Earliest allowed time | `data-min-time="9:00 AM"` | Blocks times before 9 AM |
| `data-max-time` | Latest allowed time | `data-max-time="5:00 PM"` | Blocks times after 5 PM |
| `data-disabled-times` | Block specific times | `data-disabled-times="12:00 PM,1:00 PM"` | Grays out lunch hours |
| `data-min-offset` | Minimum gap from another time | `data-min-offset="pickup-time:60"` | Must be 60+ min after pickup |

```html
<!-- Constraint examples -->
<input data-time-picker data-min-time="9:00 AM" data-max-time="5:00 PM">
<input data-time-picker data-disabled-times="12:00 PM,12:30 PM,1:00 PM">

<!-- Pickup/Return example (same day only) -->
<input data-time-picker id="pickup-time">
<input data-time-picker data-min-offset="pickup-time:30" id="return-time">
```

### Date-Aware Constraints (Cross-Date Support)

| Attribute | Purpose | Example | Behavior |
|-----------|---------|---------|----------|
| `data-date-ref` | Link to date input | `data-date-ref="pickup-date"` | Associates with date field |
| `data-datetime-min-offset` | Date+time minimum gap | `data-datetime-min-offset="pickup-date,pickup-time:30"` | 30+ min gap, date-aware |

```html
<!-- Date-aware example (RECOMMENDED FOR BOOKINGS) -->
<input type="date" id="pickup-date">
<input data-time-picker 
       data-auto-default="true" 
       data-date-ref="pickup-date"
       id="pickup-time">

<input type="date" id="return-date">
<input data-time-picker 
       data-date-ref="return-date"
       data-datetime-min-offset="pickup-date,pickup-time:30"
       id="return-time">
```

**Date-Aware Behavior:**
- ✅ Dec 5th 4:00 PM → Dec 7th 4:00 PM (different dates = always valid)
- ✅ Dec 5th 4:00 PM → Dec 5th 4:30 PM (same date, 30+ min gap)
- ❌ Dec 5th 4:00 PM → Dec 5th 4:15 PM (same date, < 30 min gap)

---

## 🎨 Styling & Themes

### Basic Color Customization

Override colors using CSS custom properties:

```css
:root {
    --timepicker-primary: #e74c3c;        /* OK button & accents */
    --timepicker-bg: white;               /* Popup background */
    --timepicker-text: #666;              /* Normal text */
    --timepicker-selected: #000;          /* Selected item text */
    --timepicker-border: #ddd;            /* Border color */
}
```

### Pre-Made Themes

**Dark Theme:**
```css
.dark-theme {
    --timepicker-bg: #2d3748;
    --timepicker-border: #4a5568;
    --timepicker-text: #e2e8f0;
    --timepicker-selected: #ffffff;
    --timepicker-primary: #4299e1;
    --timepicker-secondary: #4a5568;
    --timepicker-shadow: rgba(0, 0, 0, 0.8);
    --timepicker-separator: #cbd5e0;
}
```

**Red Theme:**
```css
.red-theme {
    --timepicker-primary: #e53e3e;
    --timepicker-selected: #c53030;
}
```

**Green Theme:**
```css
.green-theme {
    --timepicker-primary: #38a169;
    --timepicker-selected: #2f855a;
}
```

### All Available CSS Variables

```css
:root {
    --timepicker-bg: white;               /* Popup background */
    --timepicker-border: #ddd;            /* Border color */
    --timepicker-text: #666;              /* Normal text color */
    --timepicker-selected: #000;          /* Selected item text */
    --timepicker-primary: #007bff;        /* Primary button color */
    --timepicker-secondary: #f5f5f5;      /* Secondary button color */
    --timepicker-shadow: rgba(0,0,0,0.2); /* Popup shadow */
    --timepicker-separator: #333;         /* Colon separator color */
}
```

---

## 📱 Common Use Cases

### 1. Simple Time Selection
```html
<input data-time-picker placeholder="Select time">
```

### 2. Business Hours Only
```html
<input data-time-picker 
       data-min-time="9:00 AM" 
       data-max-time="5:00 PM" 
       data-minute-interval="30">
```

### 3. Auto-Default to Current Time
```html
<input data-time-picker 
       data-auto-default="true" 
       data-minute-interval="15">
```

### 4. Appointment Booking (30-min slots, no lunch)
```html
<input data-time-picker 
       data-minute-interval="30"
       data-min-time="9:00 AM"
       data-max-time="5:00 PM"
       data-disabled-times="12:00 PM,12:30 PM,1:00 PM,1:30 PM">
```

### 5. Vehicle Rental (Date-Aware)
```html
<!-- Pickup -->
<label>Pickup Date:</label>
<input type="date" id="pickup-date" required>
<label>Pickup Time:</label>
<input data-time-picker 
       data-auto-default="true"
       data-minute-interval="15"
       data-date-ref="pickup-date"
       id="pickup-time" required>

<!-- Return -->
<label>Return Date:</label>
<input type="date" id="return-date" required>
<label>Return Time:</label>
<input data-time-picker 
       data-minute-interval="15"
       data-date-ref="return-date"
       data-datetime-min-offset="pickup-date,pickup-time:30"
       id="return-time" required>
```

### 6. Restaurant Reservations
```html
<input data-time-picker 
       data-auto-default="true"
       data-minute-interval="30"
       data-min-time="5:00 PM"
       data-max-time="10:00 PM"
       data-disabled-times="6:00 PM,6:30 PM">
```

---

## 🔧 JavaScript Events & Methods

### Events
```javascript
// Listen for time selection
document.querySelector('[data-time-picker]').addEventListener('change', function(e) {
    console.log('Selected time:', e.target.value); // "2:30 PM"
});

// Listen for input events (real-time)
document.querySelector('[data-time-picker]').addEventListener('input', function(e) {
    console.log('Time changing:', e.target.value);
});
```

### Manual Initialization
```javascript
// Manual initialization (if needed)
const input = document.querySelector('#my-input');
const timePicker = new TimePicker(input);

// Destroy when needed
timePicker.destroy();
```

### Validation Helper
```javascript
// Check if times meet minimum gap requirement
function validateBooking() {
    const pickup = document.getElementById('pickup-time').value;
    const returnTime = document.getElementById('return-time').value;
    const pickupDate = document.getElementById('pickup-date').value;
    const returnDate = document.getElementById('return-date').value;
    
    if (!pickup || !returnTime || !pickupDate || !returnDate) {
        alert('Please select all dates and times');
        return false;
    }
    
    // If same date, check minimum gap (handled automatically by component)
    // If different dates, always valid
    return true;
}

document.getElementById('book-now').addEventListener('click', validateBooking);
```

---

## 🛡️ Security Features

- **XSS Protection**: All inputs sanitized and validated
- **DOM Validation**: Ensures safe element manipulation  
- **Input Validation**: Time formats strictly validated
- **Range Validation**: Hours (1-12), minutes (0-59) enforced
- **Attribute Sanitization**: All data attributes cleaned

---

## ⚡ Performance & Compatibility

- **File Size**: ~12KB minified
- **Dependencies**: None (vanilla JavaScript)
- **Browser Support**: Chrome 60+, Firefox 55+, Safari 12+, Edge 79+
- **Mobile**: Fully responsive and touch-optimized
- **Framework Agnostic**: Works with React, Vue, Angular, vanilla HTML

---

## 🚨 Important Notes

1. **IDs Must Be Unique**: When using constraints, ensure referenced input IDs are unique
2. **Date Format**: Use standard HTML date inputs (`<input type="date">`)
3. **Time Format**: Component outputs format: "2:30 PM" (12-hour with AM/PM)
4. **Cross-Date Validation**: Use `data-datetime-min-offset` for date-aware constraints
5. **Auto-Initialization**: Component automatically finds and initializes all `[data-time-picker]` inputs

---

## 🔄 Updates & Versioning

**Latest Version:**
```html
<script src="https://cdn.jsdelivr.net/gh/NerovaAutomation/nerovaTimepicker@main/timepicker.js"></script>
```

**Specific Version (Recommended for Production):**
```html
<script src="https://cdn.jsdelivr.net/gh/NerovaAutomation/nerovaTimepicker@5bb1dc8/timepicker.js"></script>
```

**Cache Busting:**
```html
<script src="https://cdn.jsdelivr.net/gh/NerovaAutomation/nerovaTimepicker@main/timepicker.js?v=1"></script>
```

---

## 📞 Support

- **GitHub**: [NerovaAutomation/nerovaTimepicker](https://github.com/NerovaAutomation/nerovaTimepicker)
- **Issues**: Report bugs or request features via GitHub Issues
- **License**: MIT License - free for any use

---

*This component is production-ready and battle-tested. Drop it into any project with zero configuration required.*