<script>
    import { pageActions } from '$lib/stores/pageActions';
    import { fade, slide } from 'svelte/transition';
</script>

{#if $pageActions.length > 0}
    <div class="md:hidden fixed bottom-24 right-4 z-40 flex flex-col gap-3 pointer-events-none" transition:fade>
        {#each $pageActions as action}
            <button 
                onclick={action.onClick}
                class="pointer-events-auto w-14 h-14 shadow-lg shadow-primary/25 bg-primary text-white rounded-full flex items-center justify-center active:scale-95 transition-all"
                transition:slide={{ axis: 'y' }}
                aria-label={action.label}
            >
                {#if action.icon}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d={action.icon} />
                    </svg>
                {/if}
            </button>
        {/each}
    </div>
{/if}
