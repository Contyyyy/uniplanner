<script>
    import { fade } from 'svelte/transition';
</script>

<div class="min-h-screen flex items-center justify-center p-4 animate-fade-in-up">
    <div class="glass-panel w-full max-w-2xl p-12 rounded-[2.5rem] relative overflow-hidden text-center">
        <!-- Decorative background elements -->
        <div class="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl"></div>

        <div class="relative z-10 space-y-8">
            <div class="inline-flex p-6 rounded-full bg-primary/10 text-primary ring-1 ring-primary/20 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>

            <h1 class="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                You're All Set!
            </h1>
            
            <p class="text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
                Your courses have been added and your dashboard is ready. Let's start organizing your academic life.
            </p>

            <div class="pt-8">
                <a 
                    href="/" 
                    class="inline-flex items-center justify-center px-10 py-4 bg-primary text-white font-bold text-lg rounded-2xl hover:bg-primary/90 transition-all hover:scale-105 shadow-xl shadow-primary/25 ring-4 ring-primary/10"
                >
                    Let's Get Started 🚀
                </a>
            </div>
        </div>
    </div>
</div>
