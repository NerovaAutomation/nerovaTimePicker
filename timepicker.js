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
            padding: 10px 14px;
            cursor: pointer;
            font-size: 18px;
            font-weight: normal;
            color: var(--timepicker-text);
            min-height: 22px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 2px 0;
        }
        
        
        .timepicker-item.selected {
            color: var(--timepicker-selected);
            font-weight: bold;
        }
        
        .timepicker-item.disabled {
            color: #ccc;
            cursor: not-allowed;
            opacity: 0.5;
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
            this.autoDefault = this.input.dataset.autoDefault === 'true';
            this.defaultTime = this.input.dataset.defaultTime;
            this.minOffset = this.input.dataset.minOffset;
            this.minTime = this.input.dataset.minTime;
            this.maxTime = this.input.dataset.maxTime;
            this.disabledTimes = this.input.dataset.disabledTimes ? 
                this.input.dataset.disabledTimes.split(',').map(t => t.trim()) : [];
            this.dateRef = this.input.dataset.dateRef;
            this.datetimeMinOffset = this.input.dataset.datetimeMinOffset;
            
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
            this.setDefaultTime();
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
        
        setDefaultTime() {
            if (this.autoDefault) {
                // Calculate next available time slot based on current time
                const now = new Date();
                const currentHour = now.getHours();
                const currentMinute = now.getMinutes();
                
                // Convert to 12-hour format
                let hour12 = currentHour % 12;
                if (hour12 === 0) hour12 = 12;
                const period = currentHour >= 12 ? 'PM' : 'AM';
                
                // Round up to next interval
                const nextMinute = Math.ceil(currentMinute / this.minuteInterval) * this.minuteInterval;
                
                if (nextMinute >= 60) {
                    // Move to next hour
                    hour12 = hour12 === 12 ? 1 : hour12 + 1;
                    if (hour12 === 12 && period === 'AM') {
                        this.selectedPeriod = 'PM';
                    } else if (hour12 === 12 && period === 'PM') {
                        this.selectedPeriod = 'AM';
                    } else {
                        this.selectedPeriod = period;
                    }
                    this.selectedMinute = 0;
                } else {
                    this.selectedMinute = nextMinute;
                    this.selectedPeriod = period;
                }
                
                this.selectedHour = hour12;
                
                // Set input value immediately
                const timeString = `${this.selectedHour}:${this.selectedMinute.toString().padStart(2, '0')} ${this.selectedPeriod}`;
                this.input.value = timeString;
                
            } else if (this.defaultTime) {
                // Parse specific default time
                const parsed = this.parseTimeString(this.defaultTime);
                if (parsed) {
                    this.selectedHour = parsed.hour;
                    this.selectedMinute = parsed.minute;
                    this.selectedPeriod = parsed.period;
                    this.input.value = this.defaultTime;
                }
            }
        }
        
        parseTimeString(timeStr) {
            const regex = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i;
            const match = timeStr.match(regex);
            if (match) {
                return {
                    hour: parseInt(match[1]),
                    minute: parseInt(match[2]),
                    period: match[3].toUpperCase()
                };
            }
            return null;
        }
        
        populateScrollers() {
            // Hours 1-12 (no padding for single digits)
            for (let i = 1; i <= 12; i++) {
                const item = document.createElement('div');
                item.className = 'timepicker-item';
                item.textContent = i.toString();
                item.dataset.value = i;
                
                if (this.isTimeDisabled(i, 0, 'AM')) {
                    item.classList.add('disabled');
                }
                
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
        
        isTimeDisabled(hour, minute, period) {
            const timeString = `${hour}:${minute.toString().padStart(2, '0')} ${period}`;
            
            // Check if time is in disabled list
            if (this.disabledTimes.includes(timeString)) {
                return true;
            }
            
            // Check min/max time constraints
            if (this.minTime && this.isTimeBefore(hour, minute, period, this.minTime)) {
                return true;
            }
            
            if (this.maxTime && this.isTimeAfter(hour, minute, period, this.maxTime)) {
                return true;
            }
            
            // Check min offset constraint (time-only)
            if (this.minOffset) {
                const [refInputId, minMinutes] = this.minOffset.split(':');
                const refInput = document.getElementById(refInputId);
                if (refInput && refInput.value) {
                    const refTime = this.parseTimeString(refInput.value);
                    if (refTime) {
                        const currentMinutes = this.timeToMinutes(hour, minute, period);
                        const refMinutes = this.timeToMinutes(refTime.hour, refTime.minute, refTime.period);
                        if (currentMinutes - refMinutes < parseInt(minMinutes)) {
                            return true;
                        }
                    }
                }
            }
            
            // Check datetime min offset constraint (date + time aware)
            if (this.datetimeMinOffset) {
                const [refDateId, refTimeId, minMinutes] = this.datetimeMinOffset.split(':');
                const [parsedRefDateId, parsedRefTimeId] = refDateId.split(',');
                
                const refDateInput = document.getElementById(parsedRefDateId);
                const refTimeInput = document.getElementById(parsedRefTimeId);
                const currentDateInput = this.dateRef ? document.getElementById(this.dateRef) : null;
                
                if (refDateInput && refTimeInput && currentDateInput && 
                    refDateInput.value && refTimeInput.value && currentDateInput.value) {
                    
                    const refDateTime = this.combineDateAndTime(refDateInput.value, refTimeInput.value);
                    const currentDateTime = this.combineDateAndTime(currentDateInput.value, `${hour}:${minute.toString().padStart(2, '0')} ${period}`);
                    
                    if (refDateTime && currentDateTime) {
                        const diffMinutes = (currentDateTime.getTime() - refDateTime.getTime()) / (1000 * 60);
                        if (diffMinutes < parseInt(minMinutes)) {
                            return true;
                        }
                    }
                }
            }
            
            return false;
        }
        
        isTimeBefore(hour, minute, period, timeString) {
            const target = this.parseTimeString(timeString);
            if (!target) return false;
            
            const currentMinutes = this.timeToMinutes(hour, minute, period);
            const targetMinutes = this.timeToMinutes(target.hour, target.minute, target.period);
            
            return currentMinutes < targetMinutes;
        }
        
        isTimeAfter(hour, minute, period, timeString) {
            const target = this.parseTimeString(timeString);
            if (!target) return false;
            
            const currentMinutes = this.timeToMinutes(hour, minute, period);
            const targetMinutes = this.timeToMinutes(target.hour, target.minute, target.period);
            
            return currentMinutes > targetMinutes;
        }
        
        timeToMinutes(hour, minute, period) {
            let totalMinutes = minute;
            if (period === 'AM' && hour === 12) {
                totalMinutes += 0; // 12 AM = 0 hours
            } else if (period === 'AM') {
                totalMinutes += hour * 60;
            } else if (period === 'PM' && hour === 12) {
                totalMinutes += 12 * 60; // 12 PM = 12 hours
            } else {
                totalMinutes += (hour + 12) * 60;
            }
            return totalMinutes;
        }
        
        combineDateAndTime(dateStr, timeStr) {
            try {
                const timeObj = this.parseTimeString(timeStr);
                if (!timeObj) return null;
                
                const date = new Date(dateStr);
                if (isNaN(date.getTime())) return null;
                
                // Convert to 24-hour format
                let hour24 = timeObj.hour;
                if (timeObj.period === 'AM' && timeObj.hour === 12) {
                    hour24 = 0;
                } else if (timeObj.period === 'PM' && timeObj.hour !== 12) {
                    hour24 = timeObj.hour + 12;
                }
                
                date.setHours(hour24, timeObj.minute, 0, 0);
                return date;
            } catch (e) {
                return null;
            }
        }
        
        setupEventListeners() {
            this.input.addEventListener('click', (e) => {
                e.stopPropagation();
                this.show();
            });
            
            this.cancelBtn.addEventListener('click', () => this.hide());
            this.okBtn.addEventListener('click', () => this.selectTime());
            
            // Close picker when clicking outside or when other pickers open
            document.addEventListener('click', (e) => {
                if (!this.picker.contains(e.target) && e.target !== this.input) {
                    this.hide();
                }
            });
            
            // Close this picker when other timepickers are opened
            document.addEventListener('timepicker-opening', (e) => {
                if (e.detail.picker !== this.picker) {
                    this.hide();
                }
            });
            
            // Hour selection
            this.hourScroller.addEventListener('click', (e) => {
                if (e.target.classList.contains('timepicker-item') && !e.target.classList.contains('disabled')) {
                    this.selectedHour = parseInt(e.target.dataset.value);
                    this.updateSelection();
                    this.refreshValidation(); // Update other columns based on new selection
                }
            });
            
            // Minute selection
            this.minuteScroller.addEventListener('click', (e) => {
                if (e.target.classList.contains('timepicker-item') && !e.target.classList.contains('disabled')) {
                    this.selectedMinute = parseInt(e.target.dataset.value);
                    this.updateSelection();
                    this.refreshValidation();
                }
            });
            
            // Period selection
            this.periodScroller.addEventListener('click', (e) => {
                if (e.target.classList.contains('timepicker-item') && !e.target.classList.contains('disabled')) {
                    this.selectedPeriod = e.target.dataset.value;
                    this.updateSelection();
                    this.refreshValidation();
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
            
            // Listen for changes in referenced inputs (for min-offset)
            if (this.minOffset) {
                const [refInputId] = this.minOffset.split(':');
                const refInput = document.getElementById(refInputId);
                if (refInput) {
                    refInput.addEventListener('change', () => {
                        this.refreshValidation();
                    });
                }
            }
            
            // Listen for changes in referenced date/time inputs (for datetime-min-offset)
            if (this.datetimeMinOffset) {
                const [refDateId, refTimeId] = this.datetimeMinOffset.split(':')[0].split(',');
                
                const refDateInput = document.getElementById(refDateId);
                const refTimeInput = document.getElementById(refTimeId);
                
                if (refDateInput) {
                    refDateInput.addEventListener('change', () => {
                        this.refreshValidation();
                    });
                }
                
                if (refTimeInput) {
                    refTimeInput.addEventListener('change', () => {
                        this.refreshValidation();
                    });
                }
            }
            
            // Listen for changes in this picker's date reference
            if (this.dateRef) {
                const dateInput = document.getElementById(this.dateRef);
                if (dateInput) {
                    dateInput.addEventListener('change', () => {
                        this.refreshValidation();
                    });
                }
            }
            
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
        
        refreshValidation() {
            // Re-validate all time options after selection change
            this.picker.querySelectorAll('.timepicker-item').forEach(item => {
                item.classList.remove('disabled');
                
                const scroller = item.closest('.timepicker-scroller');
                if (scroller.classList.contains('timepicker-hour-scroller')) {
                    const hour = parseInt(item.dataset.value);
                    if (this.isTimeDisabled(hour, this.selectedMinute, this.selectedPeriod)) {
                        item.classList.add('disabled');
                    }
                } else if (scroller.classList.contains('timepicker-minute-scroller')) {
                    const minute = parseInt(item.dataset.value);
                    if (this.isTimeDisabled(this.selectedHour, minute, this.selectedPeriod)) {
                        item.classList.add('disabled');
                    }
                } else if (scroller.classList.contains('timepicker-period-scroller')) {
                    const period = item.dataset.value;
                    if (this.isTimeDisabled(this.selectedHour, this.selectedMinute, period)) {
                        item.classList.add('disabled');
                    }
                }
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
            
            let top = inputRect.bottom + window.scrollY + 5;
            let left = inputRect.left + window.scrollX;
            
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
            
            this.picker.style.top = top + 'px';
            this.picker.style.left = left + 'px';
        }
        
        show() {
            // Broadcast that this picker is opening (to close others)
            document.dispatchEvent(new CustomEvent('timepicker-opening', {
                detail: { picker: this.picker }
            }));
            
            // Update picker width to match input if needed
            const inputWidth = this.input.offsetWidth;
            if (inputWidth > 200) {
                this.picker.style.minWidth = inputWidth + 'px';
            }
            
            // Refresh validation when picker opens
            this.refreshValidation();
            
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
            const timeString = `${this.selectedHour}:${this.selectedMinute.toString().padStart(2, '0')} ${this.selectedPeriod}`;
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