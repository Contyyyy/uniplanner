<script>
    import { fade, fly } from 'svelte/transition';
    import { enhance } from '$app/forms';

    let { title, description, action = '?/dismissTour' } = $props();
    let visible = $state(true);

    function dismiss() {
        visible = false;
    }
</script>

{#if visible}
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" transition:fade>
        <div 
            class="glass-panel w-full max-w-md p-8 rounded-[2rem] relative overflow-hidden shadow-2xl"
            in:fly={{ y: 20, duration: 300 }}
        >
            <!-- Decorative background -->
            <div class="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
            
            <div class="relative z-10">
                <div class="mb-6 inline-flex p-4 rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                    </svg>
                </div>

                <h3 class="text-2xl font-bold mb-3">{title}</h3>
                <p class="text-muted-foreground leading-relaxed mb-8">
                    {description}
                </p>

                <form 
                    method="POST" 
                    {action} 
                    use:enhance={() => {
                        dismiss();
                        return async ({ update }) => {
                            await update();
                        };
                    }}
                >
                    <button 
                        type="submit"
                        class="w-full py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-all hover:scale-[1.02] shadow-lg shadow-primary/20"
                    >
                        Got it, thanks!
                    </button>
                </form>
            </div>
        </div>
    </div>
{/if}
