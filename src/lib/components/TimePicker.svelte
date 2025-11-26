<script>
    import { slide, fly } from 'svelte/transition';
    import { onMount } from 'svelte';
    import { portal } from '$lib/actions/portal';

    let { name, value = $bindable(), placeholder = "Select time", required = false } = $props();

    let isOpen = $state(false);
    let buttonRef = $state(null);
    let dropdownStyle = $state('');

    // Generate 15-minute intervals
    const times = [];
    for (let h = 6; h < 24; h++) {
        for (let m = 0; m < 60; m += 15) {
            const hour = h.toString().padStart(2, '0');
            const minute = m.toString().padStart(2, '0');
            
            // Format for display (12-hour)
            const period = h >= 12 ? 'PM' : 'AM';
            const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
            const displayTime = `${displayHour}:${minute} ${period}`;
            
            times.push({
                value: `${hour}:${minute}`,
                label: displayTime
            });
        }
    }

    function toggle() {
        isOpen = !isOpen;
    }

    function selectTime(timeValue) {
        value = timeValue;
        isOpen = false;
    }

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
            const dropdownHeight = 240; // Approx height (max-h-60 is 15rem = 240px)
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

    // Find display label for current value
    let displayValue = $derived(times.find(t => t.value === value)?.label || value || '');
</script>

<div class="relative w-full">
    <input type="hidden" {name} bind:value />
    
    <button 
        bind:this={buttonRef}
        type="button"
        class="w-full px-4 py-2.5 rounded-xl bg-surface-foreground/5 border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-left flex items-center justify-between group hover:bg-surface-foreground/10"
        onclick={toggle}
    >
        <span class={!value ? "text-muted-foreground" : "text-foreground font-medium"}>
            {displayValue || placeholder}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-muted-foreground transition-transform duration-200 {isOpen ? 'rotate-180' : ''}">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    </button>

    {#if isOpen}
        <div 
            use:portal
            class="bg-white dark:bg-slate-900 border border-border rounded-xl shadow-xl overflow-y-auto isolate"
            style="{dropdownStyle} max-height: 240px;"
            transition:fly={{ y: 10, duration: 200 }}
        >
            <div class="p-1 space-y-0.5">
                {#each times as time}
                    <button
                        type="button"
                        data-value={time.value}
                        class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between
                            {value === time.value 
                                ? 'bg-primary/10 text-primary font-medium' 
                                : 'text-foreground hover:bg-surface-foreground/5'}"
                        onclick={() => selectTime(time.value)}
                    >
                        {time.label}
                        {#if value === time.value}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                            </svg>
                        {/if}
                    </button>
                {/each}
            </div>
        </div>
    {/if}
</div>
