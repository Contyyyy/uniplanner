<div class="h-screen bg-background text-foreground flex flex-col overflow-hidden transition-colors duration-300">
    <!-- Navigation -->
    <nav class="w-full px-8 py-6 flex justify-between items-center border-b border-border shrink-0 z-20 bg-surface/80 backdrop-blur-sm">
        <div class="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            UniPlanner
        </div>
        <a href="/demo/lucia/login" class="px-6 py-2 bg-primary text-primary-foreground font-bold rounded-full hover:bg-primary/90 transition-all transform hover:scale-105 shadow-lg">
            Sign In
        </a>
    </nav>

    <!-- Hero Section -->
    <main class="flex-grow flex flex-col items-center justify-center text-center px-8 relative overflow-hidden">
        <!-- Background Elements -->
        <div class="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px] pointer-events-none animate-pulse"></div>
        <div class="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[128px] pointer-events-none animate-pulse delay-1000"></div>

        <div class="relative z-10 max-w-5xl w-full flex flex-col h-full justify-center">
            <div class="space-y-6 animate-fade-in-up mb-12">
                <h1 class="text-5xl md:text-7xl font-bold tracking-tight">
                    Master Your <br />
                    <span class="bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">Academic Journey</span>
                </h1>
                
                <p class="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                    The all-in-one platform to organize your schedule, track your grades, and stay ahead of your coursework.
                </p>

                <div class="pt-4 flex flex-wrap justify-center gap-4">
                    <a href="/demo/lucia/login" class="px-8 py-4 bg-primary text-primary-foreground text-lg font-bold rounded-full hover:bg-primary/90 transition-all transform hover:scale-105 shadow-xl flex items-center gap-2">
                        Get Started
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                        </svg>
                    </a>
                </div>
            </div>

            <!-- Features Grid -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
                <div class="p-6 rounded-3xl glass-panel hover:bg-surface/50 transition-all group border border-border">
                    <div class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                        </svg>
                    </div>
                    <h3 class="text-lg font-bold mb-2">Smart Scheduling</h3>
                    <p class="text-sm text-muted-foreground">Visualize your week with an intuitive calendar that adapts to your recurring classes.</p>
                </div>

                <div class="p-6 rounded-3xl glass-panel hover:bg-surface/50 transition-all group border border-border">
                    <div class="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center mb-4 text-accent group-hover:scale-110 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                        </svg>
                    </div>
                    <h3 class="text-lg font-bold mb-2">Task Tracking</h3>
                    <p class="text-sm text-muted-foreground">Never miss a deadline. Manage assignments and exams in one centralized hub.</p>
                </div>

                <div class="p-6 rounded-3xl glass-panel hover:bg-surface/50 transition-all group border border-border">
                    <div class="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                        </svg>
                    </div>
                    <h3 class="text-lg font-bold mb-2">Grade Analytics</h3>
                    <p class="text-sm text-muted-foreground">Track your academic performance with real-time GPA calculations.</p>
                </div>
            </div>
        </div>
    </main>

    <footer class="w-full py-4 text-center text-muted-foreground text-xs border-t border-border shrink-0 z-20 bg-surface/80 backdrop-blur-sm">
        &copy; {new Date().getFullYear()} UniPlanner. All rights reserved.
    </footer>
</div>
