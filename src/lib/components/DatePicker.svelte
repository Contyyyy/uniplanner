<script>
    import { onMount } from 'svelte';
    import { fade, fly } from 'svelte/transition';
    import { portal } from '$lib/actions/portal';
    
    let { name, value = $bindable(), required = false, placeholder = "Select date" } = $props();
    
    let isOpen = $state(false);
    let viewDate = $state(new Date());
    let selectedDate = $state(value ? new Date(value) : null);
    let buttonRef = $state(null);
    let dropdownStyle = $state('');
    
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    function getDaysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }

    function getFirstDayOfMonth(year, month) {
        return new Date(year, month, 1).getDay();
    }

    function handlePrevMonth() {
        viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1);
    }

    function handleNextMonth() {
        viewDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
    }

    function handleSelectDate(day) {
        selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
        // Format as YYYY-MM-DD for the input value
        const yyyy = selectedDate.getFullYear();
        const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const dd = String(selectedDate.getDate()).padStart(2, '0');
        value = `${yyyy}-${mm}-${dd}`;
        isOpen = false;
    }

    function formatDate(date) {
        if (!date) return '';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    // Exclusive dropdown logic
    function handleDropdownOpen(event) {
        if (event.detail.source !== name) {
            isOpen = false;
        }
    }

    function updatePosition() {
        if (buttonRef && isOpen) {
            const rect = buttonRef.getBoundingClientRect();
            // Check if we should open upwards (if close to bottom)
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            const dropdownHeight = 320; // Approx height
            const width = Math.min(rect.width, 300); // Cap width at 300px

            if (spaceBelow < dropdownHeight && spaceAbove > spaceBelow) {
                 // Open upwards
                 dropdownStyle = `position: fixed; left: ${rect.left}px; bottom: ${window.innerHeight - rect.top + 8}px; width: ${width}px; z-index: 9999;`;
            } else {
                // Open downwards
                dropdownStyle = `position: fixed; left: ${rect.left}px; top: ${rect.bottom + 8}px; width: ${width}px; z-index: 9999;`;
            }
        }
    }

    function handleScrollOrResize() {
        if (isOpen) {
            updatePosition();
        }
    }

    $effect(() => {
        if (isOpen) {
            updatePosition();
            window.dispatchEvent(new CustomEvent('uniplanner:dropdown-open', {
                detail: { source: name }
            }));
            
            // Update position on scroll or resize
            window.addEventListener('scroll', handleScrollOrResize, true);
            window.addEventListener('resize', handleScrollOrResize);
        }
        return () => {
            window.removeEventListener('scroll', handleScrollOrResize, true);
            window.removeEventListener('resize', handleScrollOrResize);
        };
    });

    $effect(() => {
        window.addEventListener('uniplanner:dropdown-open', handleDropdownOpen);
        return () => {
            window.removeEventListener('uniplanner:dropdown-open', handleDropdownOpen);
        };
    });

    let calendarDays = $derived.by(() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        
        let daysArr = [];
        for (let i = 0; i < firstDay; i++) {
            daysArr.push(null);
        }
        for (let i = 1; i <= daysInMonth; i++) {
            daysArr.push(i);
        }
        return daysArr;
    });
</script>

<div class="relative w-full">
    <input type="hidden" {name} {value} {required} />
    
    <button 
        bind:this={buttonRef}
        type="button"
        class="w-full px-4 py-3 rounded-xl bg-surface/50 backdrop-blur-sm border border-border hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none text-left flex items-center justify-between group shadow-sm"
        onclick={() => isOpen = !isOpen}
    >
        <span class={selectedDate ? "text-foreground font-medium" : "text-muted-foreground"}>
            {selectedDate ? formatDate(selectedDate) : placeholder}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
    </button>

    {#if isOpen}
        <div 
            use:portal
            class="bg-surface backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-3 overflow-hidden"
            style={dropdownStyle}
            transition:fly={{ y: 10, duration: 200 }}
        >
            <div class="flex items-center justify-between mb-2 px-1">
                <button type="button" onclick={handlePrevMonth} class="p-1.5 hover:bg-surface-foreground/5 rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
                <span class="font-bold text-base text-foreground">{months[viewDate.getMonth()]} {viewDate.getFullYear()}</span>
                <button type="button" onclick={handleNextMonth} class="p-1.5 hover:bg-surface-foreground/5 rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                </button>
            </div>
            
            <div class="grid grid-cols-7 gap-0.5 mb-1">
                {#each days as day}
                    <div class="text-center text-[10px] font-bold text-muted-foreground py-1 uppercase tracking-wider">{day}</div>
                {/each}
            </div>
            
            <div class="grid grid-cols-7 gap-1">
                {#each calendarDays as day}
                    {#if day === null}
                        <div></div>
                    {:else}
                        <button 
                            type="button"
                            class="w-full aspect-square flex items-center justify-center rounded-xl text-sm transition-all duration-200
                                {selectedDate && selectedDate.getDate() === day && selectedDate.getMonth() === viewDate.getMonth() && selectedDate.getFullYear() === viewDate.getFullYear()
                                    ? 'bg-gradient-to-br from-primary to-accent text-white font-bold shadow-lg shadow-primary/25 scale-105' 
                                    : 'hover:bg-surface-foreground/5 text-foreground hover:scale-105'}"
                            onclick={() => handleSelectDate(day)}
                        >
                            {day}
                        </button>
                    {/if}
                {/each}
            </div>
        </div>
    {/if}
</div>
