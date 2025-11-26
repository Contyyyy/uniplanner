<script>
    import { fly } from 'svelte/transition';
    
    let { name, value = $bindable(), options = [], placeholder = "Select an option", required = false, onchange } = $props();
    
    let isOpen = $state(false);
    let container;

    function toggle() {
        isOpen = !isOpen;
        if (isOpen) {
            window.dispatchEvent(new CustomEvent('uniplanner:dropdown-open', {
                detail: { source: name }
            }));
        }
    }

    function selectOption(optionValue) {
        value = optionValue;
        isOpen = false;
        if (onchange) {
            onchange({ target: { value: optionValue } });
        }
    }

    function handleDropdownOpen(event) {
        if (event.detail.source !== name) {
            isOpen = false;
        }
    }

    function handleClickOutside(event) {
        if (container && !container.contains(event.target)) {
            isOpen = false;
        }
    }

    $effect(() => {
        window.addEventListener('uniplanner:dropdown-open', handleDropdownOpen);
        window.addEventListener('click', handleClickOutside);
        return () => {
            window.removeEventListener('uniplanner:dropdown-open', handleDropdownOpen);
            window.removeEventListener('click', handleClickOutside);
        };
    });

    // Helper to get label from options
    function getLabel(val) {
        if (!val) return '';
        const option = options.find(o => (typeof o === 'object' ? o.value === val : o === val));
        if (!option) return val;
        return typeof option === 'object' ? option.label : option;
    }

    let displayValue = $derived(getLabel(value));
</script>

<div class="relative" bind:this={container}>
    <input type="hidden" {name} bind:value {required} />
    
    <button 
        type="button"
        class="w-full px-4 py-2.5 rounded-xl bg-surface-foreground/5 border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-left flex items-center justify-between group hover:bg-surface-foreground/10"
        onclick={toggle}
    >
        <span class={!value ? "text-muted-foreground" : "text-foreground font-medium"}>
            {displayValue || placeholder}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 text-muted-foreground transition-transform duration-200 {isOpen ? 'rotate-180' : ''}">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
    </button>

    {#if isOpen}
        <div 
            class="absolute top-full left-0 mt-2 w-full max-h-60 overflow-y-auto bg-white dark:bg-slate-900 border border-border rounded-xl shadow-xl z-50 isolate"
            transition:fly={{ y: 10, duration: 200 }}
        >
            <div class="p-1 space-y-0.5">
                {#each options as option}
                    {@const optValue = typeof option === 'object' ? option.value : option}
                    {@const optLabel = typeof option === 'object' ? option.label : option}
                    {@const isSpecial = typeof option === 'object' && option.special}
                    
                    {#if option.href}
                        <a
                            href={option.href}
                            class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between text-primary font-semibold hover:bg-primary/5"
                            onclick={() => isOpen = false}
                        >
                            {optLabel}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </a>
                    {:else}
                        <button
                            type="button"
                            class="w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between
                                {value === optValue 
                                    ? 'bg-primary/10 text-primary font-medium' 
                                    : isSpecial ? 'text-primary font-semibold hover:bg-primary/5' : 'text-foreground hover:bg-surface-foreground/5'}"
                            onclick={() => selectOption(optValue)}
                        >
                            {optLabel}
                            {#if value === optValue}
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            {/if}
                        </button>
                    {/if}
                {/each}
            </div>
        </div>
    {/if}
</div>
