<script>
    import { enhance } from '$app/forms';
    import { fade } from 'svelte/transition';

    let { form } = $props();
    let loading = $state(false);
</script>

<div class="min-h-screen flex items-center justify-center p-4 animate-fade-in-up">
    <div class="glass-panel w-full max-w-md p-8 rounded-3xl">
        <div class="text-center mb-8">
            <h1 class="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">Create Account</h1>
            <p class="text-muted-foreground">Join UniPlanner today</p>
        </div>

        <form 
            method="POST" 
            action="?/register" 
            enctype="multipart/form-data"
            use:enhance={() => {
                loading = true;
                return async ({ update }) => {
                    await update();
                    loading = false;
                };
            }}
            class="space-y-6"
        >


            <div class="space-y-2">
                <label for="username" class="text-sm font-medium ml-1">Username</label>
                <input
                    name="username"
                    id="username"
                    required
                    class="w-full px-4 py-3 rounded-xl bg-surface-foreground/5 border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-foreground placeholder:text-muted-foreground"
                    placeholder="Choose a username"
                />
            </div>
            
            <div class="space-y-2">
                <label for="password" class="text-sm font-medium ml-1">Password</label>
                <input
                    type="password"
                    name="password"
                    id="password"
                    required
                    class="w-full px-4 py-3 rounded-xl bg-surface-foreground/5 border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-foreground placeholder:text-muted-foreground"
                    placeholder="Choose a password"
                />
            </div>

            <div class="pt-2">
                <button 
                    type="submit" 
                    disabled={loading}
                    class="w-full py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all hover:scale-[1.02] shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {#if loading}
                        <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating Account...
                    {:else}
                        Register
                    {/if}
                </button>
            </div>

            <div class="text-center text-sm text-muted-foreground">
                Already have an account? 
                <a href="/demo/lucia/login" class="text-primary hover:underline font-medium">Log in</a>
            </div>
        </form>

        {#if form?.message}
            <div class="mt-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-sm text-center font-medium animate-pulse">
                {form.message}
            </div>
        {/if}
    </div>
</div>
