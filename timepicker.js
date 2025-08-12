(function() {
    'use strict';
    
    // Inject CSS styles
    const css = `
        :root {
            --timepicker-bg: white;
            --timepicker-border: #ddd;
            --timepicker-text: #666;
            --timepicker-selected: #000;
            --timepicker-primary: #007bff;
            --timepicker-secondary: #f5f5f5;
            --timepicker-shadow: rgba(0, 0, 0, 0.2);
            --timepicker-separator: #333;
        }
        
        .timepicker-popup {
            position: absolute;
            background-color: var(--timepicker-bg);
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 4px 20px var(--timepicker-shadow);
            display: none;
            gap: 10px;
            align-items: center;
            z-index: 10000;
            border: 1px solid var(--timepicker-border);
            font-family: Arial, sans-serif;
        }
        
        
        .timepicker-column {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 60px;
        }
        
        .timepicker-scroller {
            height: 150px;
            overflow-y: auto;
            border: none;
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 40px 0;
        }
        
        .timepicker-scroller::-webkit-scrollbar {
            display: none;
        }
        
        .timepicker-scroller {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        
        .timepicker-item {
            padding: 8px 12px;
            cursor: pointer;
            font-size: 18px;
            font-weight: normal;
            color: var(--timepicker-text);
            min-height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .timepicker-item:hover {
            color: #000;
        }
        
        .timepicker-item.selected {
            color: var(--timepicker-selected);
            font-weight: bold;
        }
        
        .timepicker-separator {
            font-size: 24px;
            font-weight: bold;
            color: var(--timepicker-separator);
        }
        
        .timepicker-buttons {
            display: flex;
            gap: 8px;
            margin-top: 10px;
        }
        
        .timepicker-btn {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: opacity 0.2s ease;
        }
        
        .timepicker-btn-cancel {
            background-color: var(--timepicker-secondary);
            color: var(--timepicker-text);
        }
        
        .timepicker-btn-ok {
            background-color: var(--timepicker-primary);
            color: white;
        }
        
        .timepicker-btn:hover {
            opacity: 0.8;
        }
        
        /* Mobile optimizations */
        @media (max-width: 768px) {
            .timepicker-popup {
                padding: 20px;
                border-radius: 12px;
                box-shadow: 0 8px 32px var(--timepicker-shadow);
                min-width: 280px;
            }
            
            .timepicker-column {
                width: 70px;
            }
            
            .timepicker-scroller {
                height: 140px;
                padding: 35px 0;
            }
            
            .timepicker-item {
                padding: 12px 16px;
                font-size: 20px;
                min-height: 24px;
                border-radius: 6px;
            }
            
            .timepicker-separator {
                font-size: 28px;
                margin: 0 8px;
            }
            
            .timepicker-buttons {
                margin-top: 15px;
                gap: 12px;
            }
            
            .timepicker-btn {
                padding: 12px 20px;
                font-size: 16px;
                border-radius: 8px;
                min-height: 44px;
            }
        }
        
        /* Touch-specific optimizations */
        @media (hover: none) and (pointer: coarse) {
            .timepicker-item {
                padding: 14px 18px;
                min-height: 28px;
            }
            
            .timepicker-btn {
                min-height: 48px;
                padding: 14px 24px;
            }
        }
        
    `;
    
    // Inject styles into head
    if (!document.getElementById('timepicker-styles')) {
        const style = document.createElement('style');
        style.id = 'timepicker-styles';
        style.textContent = css;
        document.head.appendChild(style);
    }
    
    class TimePicker {
        constructor(inputElement) {
            this.input = inputElement;
            this.selectedHour = 12;
            this.selectedMinute = 0;
            this.selectedPeriod = 'AM';
            
            // Get configuration from data attributes
            this.minuteInterval = parseInt(this.input.dataset.minuteInterval) || 1;
            
            this.picker = null;
            this.hourScroller = null;
            this.minuteScroller = null;
            this.periodScroller = null;
            this.cancelBtn = null;
            this.okBtn = null;
            
            this.init();
        }
        
        init() {
            this.createPicker();
            this.populateScrollers();
            this.setupEventListeners();
            this.updateSelection();
        }
        
        createPicker() {
            this.picker = document.createElement('div');
            this.picker.className = 'timepicker-popup';
            
            // Find the closest parent that might have theme classes
            let themeParent = this.input.parentElement;
            while (themeParent && !this.hasThemeClass(themeParent)) {
                themeParent = themeParent.parentElement;
            }
            
            // If we found a theme parent, append to it instead of body
            const appendTarget = themeParent || document.body;
            
            // Adapt width to input field
            const inputWidth = this.input.offsetWidth;
            if (inputWidth > 200) {
                this.picker.style.minWidth = inputWidth + 'px';
            }
            
            this.picker.innerHTML = `
                <div style="display: flex; gap: 10px; align-items: center;">
                    <div class="timepicker-column">
                        <div class="timepicker-scroller timepicker-hour-scroller"></div>
                    </div>
                    <div class="timepicker-separator">:</div>
                    <div class="timepicker-column">
                        <div class="timepicker-scroller timepicker-minute-scroller"></div>
                    </div>
                    <div class="timepicker-column">
                        <div class="timepicker-scroller timepicker-period-scroller"></div>
                    </div>
                </div>
                <div class="timepicker-buttons">
                    <button class="timepicker-btn timepicker-btn-cancel">Cancel</button>
                    <button class="timepicker-btn timepicker-btn-ok">OK</button>
                </div>
            `;
            
            appendTarget.appendChild(this.picker);
            
            // Get references to elements
            this.hourScroller = this.picker.querySelector('.timepicker-hour-scroller');
            this.minuteScroller = this.picker.querySelector('.timepicker-minute-scroller');
            this.periodScroller = this.picker.querySelector('.timepicker-period-scroller');
            this.cancelBtn = this.picker.querySelector('.timepicker-btn-cancel');
            this.okBtn = this.picker.querySelector('.timepicker-btn-ok');
        }
        
        hasThemeClass(element) {
            return element.classList && (
                element.classList.contains('dark-theme') ||
                element.classList.contains('red-theme') ||
                element.classList.contains('green-theme') ||
                element.classList.contains('blue-theme') ||
                Array.from(element.classList).some(cls => cls.includes('theme'))
            );
        }
        
        populateScrollers() {
            // Hours 1-12
            for (let i = 1; i <= 12; i++) {
                const item = document.createElement('div');
                item.className = 'timepicker-item';
                item.textContent = i.toString().padStart(2, '0');
                item.dataset.value = i;
                this.hourScroller.appendChild(item);
            }
            
            // Minutes with configurable interval
            for (let i = 0; i <= 59; i += this.minuteInterval) {
                const item = document.createElement('div');
                item.className = 'timepicker-item';
                item.textContent = i.toString().padStart(2, '0');
                item.dataset.value = i;
                this.minuteScroller.appendChild(item);
            }
            
            // AM/PM
            ['AM', 'PM'].forEach(period => {
                const item = document.createElement('div');
                item.className = 'timepicker-item';
                item.textContent = period;
                item.dataset.value = period;
                this.periodScroller.appendChild(item);
            });
        }
        
        setupEventListeners() {
            this.input.addEventListener('click', (e) => {
                e.stopPropagation();
                this.show();
            });
            
            this.cancelBtn.addEventListener('click', () => this.hide());
            this.okBtn.addEventListener('click', () => this.selectTime());
            
            // Close picker when clicking outside
            document.addEventListener('click', (e) => {
                if (!this.picker.contains(e.target) && e.target !== this.input) {
                    this.hide();
                }
            });
            
            // Hour selection
            this.hourScroller.addEventListener('click', (e) => {
                if (e.target.classList.contains('timepicker-item')) {
                    this.selectedHour = parseInt(e.target.dataset.value);
                    this.updateSelection();
                }
            });
            
            // Minute selection
            this.minuteScroller.addEventListener('click', (e) => {
                if (e.target.classList.contains('timepicker-item')) {
                    this.selectedMinute = parseInt(e.target.dataset.value);
                    this.updateSelection();
                }
            });
            
            // Period selection
            this.periodScroller.addEventListener('click', (e) => {
                if (e.target.classList.contains('timepicker-item')) {
                    this.selectedPeriod = e.target.dataset.value;
                    this.updateSelection();
                }
            });
            
            // Disable scroll-based selection to prevent random darkening
            // this.setupScrollSelection();
            
            // Handle window resize
            window.addEventListener('resize', () => {
                if (this.picker.style.display === 'block') {
                    this.positionPicker();
                }
            });
            
            // Add touch event handling for mobile
            this.setupTouchEvents();
        }
        
        setupScrollSelection() {
            let scrollTimeouts = {};
            
            this.hourScroller.addEventListener('scroll', () => {
                clearTimeout(scrollTimeouts.hour);
                scrollTimeouts.hour = setTimeout(() => {
                    this.updateSelectionFromScroll(this.hourScroller, 'hour');
                }, 150);
            });
            
            this.minuteScroller.addEventListener('scroll', () => {
                clearTimeout(scrollTimeouts.minute);
                scrollTimeouts.minute = setTimeout(() => {
                    this.updateSelectionFromScroll(this.minuteScroller, 'minute');
                }, 150);
            });
            
            this.periodScroller.addEventListener('scroll', () => {
                clearTimeout(scrollTimeouts.period);
                scrollTimeouts.period = setTimeout(() => {
                    this.updateSelectionFromScroll(this.periodScroller, 'period');
                }, 150);
            });
        }
        
        setupTouchEvents() {
            // Improve touch scrolling on mobile
            [this.hourScroller, this.minuteScroller, this.periodScroller].forEach(scroller => {
                // Enable momentum scrolling on iOS
                scroller.style.webkitOverflowScrolling = 'touch';
                scroller.style.overscrollBehavior = 'contain';
                
                // Prevent context menu on long press
                scroller.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                });
                
                // Handle touch selection on mobile
                let touchStartY = 0;
                let touchMoved = false;
                
                scroller.addEventListener('touchstart', (e) => {
                    touchStartY = e.touches[0].clientY;
                    touchMoved = false;
                }, { passive: true });
                
                scroller.addEventListener('touchmove', (e) => {
                    const touchCurrentY = e.touches[0].clientY;
                    const touchDiff = Math.abs(touchCurrentY - touchStartY);
                    if (touchDiff > 10) {
                        touchMoved = true;
                    }
                }, { passive: true });
                
                scroller.addEventListener('touchend', (e) => {
                    // Only trigger click if it wasn't a scroll gesture
                    if (!touchMoved && e.target.classList.contains('timepicker-item')) {
                        e.target.click();
                    }
                }, { passive: true });
            });
            
            // Better touch handling for buttons
            [this.cancelBtn, this.okBtn].forEach(btn => {
                btn.addEventListener('touchstart', () => {
                    btn.style.opacity = '0.7';
                });
                
                btn.addEventListener('touchend', () => {
                    btn.style.opacity = '';
                });
                
                btn.addEventListener('touchcancel', () => {
                    btn.style.opacity = '';
                });
            });
        }
        
        updateSelectionFromScroll(scroller, type) {
            const scrollTop = scroller.scrollTop;
            const scrollerHeight = scroller.offsetHeight;
            const scrollerCenter = scrollTop + (scrollerHeight / 2);
            const items = scroller.querySelectorAll('.timepicker-item');
            
            let closestItem = null;
            let closestDistance = Infinity;
            
            items.forEach(item => {
                const itemTop = item.offsetTop;
                const itemHeight = item.offsetHeight;
                const itemCenter = itemTop + (itemHeight / 2);
                const distance = Math.abs(scrollerCenter - itemCenter);
                
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestItem = item;
                }
            });
            
            if (closestItem) {
                if (type === 'hour') {
                    this.selectedHour = parseInt(closestItem.dataset.value);
                } else if (type === 'minute') {
                    this.selectedMinute = parseInt(closestItem.dataset.value);
                } else if (type === 'period') {
                    this.selectedPeriod = closestItem.dataset.value;
                }
                this.updateSelection();
            }
        }
        
        updateSelection() {
            // Clear all selections
            this.picker.querySelectorAll('.timepicker-item').forEach(item => {
                item.classList.remove('selected');
            });
            
            // Mark selected items
            const selectedHour = this.hourScroller.querySelector(`[data-value="${this.selectedHour}"]`);
            const selectedMinute = this.minuteScroller.querySelector(`[data-value="${this.selectedMinute}"]`);
            const selectedPeriod = this.periodScroller.querySelector(`[data-value="${this.selectedPeriod}"]`);
            
            if (selectedHour) selectedHour.classList.add('selected');
            if (selectedMinute) selectedMinute.classList.add('selected');
            if (selectedPeriod) selectedPeriod.classList.add('selected');
        }
        
        positionPicker() {
            const inputRect = this.input.getBoundingClientRect();
            const pickerRect = this.picker.getBoundingClientRect();
            const isMobile = window.innerWidth <= 768;
            
            let top = inputRect.bottom + window.scrollY + 5;
            let left = inputRect.left + window.scrollX;
            
            if (isMobile) {
                // Center horizontally on mobile if screen is small
                const availableWidth = window.innerWidth - 20; // 10px margin on each side
                if (pickerRect.width > availableWidth) {
                    left = 10;
                    this.picker.style.width = (availableWidth) + 'px';
                } else {
                    left = (window.innerWidth - pickerRect.width) / 2;
                }
                
                // Ensure picker doesn't go below viewport on mobile
                const maxTop = window.innerHeight + window.scrollY - pickerRect.height - 20;
                if (top > maxTop) {
                    top = Math.max(inputRect.top + window.scrollY - pickerRect.height - 5, 20);
                }
            } else {
                // Desktop positioning
                // Adjust if picker would go off screen
                if (left + pickerRect.width > window.innerWidth) {
                    left = window.innerWidth - pickerRect.width - 10;
                }
                
                if (left < 10) {
                    left = 10;
                }
                
                // Check if picker would go below viewport
                if (top + pickerRect.height > window.innerHeight + window.scrollY) {
                    // Show above input instead
                    top = inputRect.top + window.scrollY - pickerRect.height - 5;
                }
            }
            
            this.picker.style.top = top + 'px';
            this.picker.style.left = left + 'px';
        }
        
        show() {
            // Update picker width to match input if needed
            const inputWidth = this.input.offsetWidth;
            if (inputWidth > 200) {
                this.picker.style.minWidth = inputWidth + 'px';
            }
            
            this.picker.style.display = 'block';
            this.positionPicker();
            
            // Scroll to selected values
            setTimeout(() => {
                this.scrollToSelected();
            }, 10);
        }
        
        hide() {
            this.picker.style.display = 'none';
        }
        
        scrollToSelected() {
            const scrollToItem = (scroller, value) => {
                const item = scroller.querySelector(`[data-value="${value}"]`);
                if (item) {
                    const scrollerHeight = scroller.offsetHeight;
                    const itemTop = item.offsetTop;
                    const itemHeight = item.offsetHeight;
                    scroller.scrollTop = itemTop - (scrollerHeight / 2) + (itemHeight / 2);
                }
            };
            
            scrollToItem(this.hourScroller, this.selectedHour);
            scrollToItem(this.minuteScroller, this.selectedMinute);
            scrollToItem(this.periodScroller, this.selectedPeriod);
        }
        
        selectTime() {
            const timeString = `${this.selectedHour.toString().padStart(2, '0')}:${this.selectedMinute.toString().padStart(2, '0')} ${this.selectedPeriod}`;
            this.input.value = timeString;
            
            // Trigger change event
            this.input.dispatchEvent(new Event('change', { bubbles: true }));
            this.input.dispatchEvent(new Event('input', { bubbles: true }));
            
            this.hide();
        }
        
        destroy() {
            if (this.picker && this.picker.parentNode) {
                this.picker.parentNode.removeChild(this.picker);
            }
        }
    }
    
    // Auto-initialize all inputs with data-time-picker attribute
    function initializeTimePickers() {
        const inputs = document.querySelectorAll('input[data-time-picker]');
        inputs.forEach(input => {
            // Skip if already initialized
            if (input.timePicker) return;
            
            // Make input readonly to prevent typing
            input.readOnly = true;
            input.style.cursor = 'pointer';
            
            // Initialize time picker
            input.timePicker = new TimePicker(input);
        });
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeTimePickers);
    } else {
        initializeTimePickers();
    }
    
    // Also watch for dynamically added inputs
    if (window.MutationObserver) {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        if (node.matches && node.matches('input[data-time-picker]')) {
                            if (!node.timePicker) {
                                node.readOnly = true;
                                node.style.cursor = 'pointer';
                                node.timePicker = new TimePicker(node);
                            }
                        }
                        // Check children too
                        const childInputs = node.querySelectorAll && node.querySelectorAll('input[data-time-picker]');
                        if (childInputs) {
                            childInputs.forEach(input => {
                                if (!input.timePicker) {
                                    input.readOnly = true;
                                    input.style.cursor = 'pointer';
                                    input.timePicker = new TimePicker(input);
                                }
                            });
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Expose TimePicker class globally for manual initialization if needed
    window.TimePicker = TimePicker;
    
})();