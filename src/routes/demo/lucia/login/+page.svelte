<script>
	import { enhance } from '$app/forms';

	let { form } = $props();
</script>

<div class="min-h-screen flex items-center justify-center p-4 bg-background text-foreground transition-colors duration-300">
    <div class="w-full max-w-md p-8 rounded-3xl glass-panel shadow-2xl animate-fade-in-up">
        <div class="text-left mb-10">
            <h1 class="text-3xl font-bold text-foreground mb-3">Welcome Back</h1>
            <p class="text-muted-foreground leading-relaxed">
                Sign in to organize your academic life with UniPlanner.
            </p>
        </div>

        <div class="space-y-8">
            <a href="/login/google" class="w-full py-4 bg-surface text-foreground font-bold rounded-xl hover:bg-surface-foreground/10 border border-border transition-all hover:scale-[1.02] flex items-center justify-center gap-4 group tracking-wide uppercase">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" class="w-6 h-6">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
            </a>

            <div class="relative flex items-center py-2">
                <div class="flex-grow border-t border-border"></div>
                <span class="flex-shrink-0 mx-4 text-muted-foreground text-xs font-bold tracking-widest uppercase bg-background px-2">Why Google?</span>
                <div class="flex-grow border-t border-border"></div>
            </div>

            <div class="space-y-5">
                <div class="flex items-center gap-4 text-muted-foreground">
                    <div class="p-2 rounded-full border border-primary/20 text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                        </svg>
                    </div>
                    <span class="text-sm font-medium">No password to remember</span>
                </div>
                <div class="flex items-center gap-4 text-muted-foreground">
                    <div class="p-2 rounded-full border border-primary/20 text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                    </div>
                    <span class="text-sm font-medium">Secure OAuth 2.0 authentication</span>
                </div>
                <div class="flex items-center gap-4 text-muted-foreground">
                    <div class="p-2 rounded-full border border-primary/20 text-primary">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                        </svg>
                    </div>
                    <span class="text-sm font-medium">We never see your Google password</span>
                </div>
            </div>
        </div>

        {#if form?.message}
            <div class="mt-8 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm text-center font-medium animate-pulse">
                {form.message}
            </div>
        {/if}
    </div>
</div>
