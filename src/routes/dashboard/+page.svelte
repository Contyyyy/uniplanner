<script>
    import { fade, fly } from 'svelte/transition';
    let { data } = $props();

    // Unified Timeline Logic
    let timelineItems = $derived.by(() => {
        if (!data.user) return [];
        
        const tasks = data.tasks.map(t => ({
            type: 'task',
            date: new Date(t.dueDate),
            title: t.title,
            subtitle: 'Task Due',
            id: t.id,
            color: 'bg-accent',
            textColor: 'text-accent',
            icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
            ...t
        }));
        
        const courses = data.courses.map(c => ({
            type: 'class',
            date: c.nextDate,
            title: c.name,
            subtitle: c.location || 'Class',
            id: c.id,
            color: 'bg-primary',
            textColor: 'text-primary',
            icon: 'M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z',
            ...c
        }));
        
        return [...tasks, ...courses].sort((a, b) => a.date - b.date);
    });

    let todayItems = $derived(timelineItems.filter(item => {
        const today = new Date();
        return item.date.getDate() === today.getDate() &&
               item.date.getMonth() === today.getMonth() &&
               item.date.getFullYear() === today.getFullYear();
    }));

    let upcomingItems = $derived(timelineItems.filter(item => {
        const today = new Date();
        const itemDate = new Date(item.date);
        // Reset hours to compare dates only
        const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const itemZero = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
        return itemZero > todayZero;
    }));
</script>

<div class="min-h-screen pb-12 max-w-7xl mx-auto">
    {#if !data.user}
        <!-- Logged Out State -->
        <div class="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-fade-in-up">
            <h1 class="text-6xl font-bold font-outfit tracking-tight">
                Welcome to <span class="text-primary">UniPlanner</span>
            </h1>
            <p class="text-2xl text-muted-foreground max-w-2xl">
                The ultimate command center for your academic life.
            </p>
            <a href="/demo/lucia/login" class="px-10 py-4 bg-foreground text-background rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl">
                Get Started
            </a>
        </div>
    {:else}
        <!-- Command Center Layout -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <!-- Left Column: Unified Timeline (Main Focus) -->
            <div class="lg:col-span-8 space-y-10">
                
                <!-- Header -->
                <!-- Header -->
                <!-- Header -->
                <header class="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-surface border border-border/50 p-6 md:p-8 mb-6 md:mb-8">
                    <div class="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
                    <div class="absolute bottom-0 left-0 -mb-16 -ml-16 w-64 h-64 bg-accent/10 rounded-full blur-3xl"></div>
                    
                    <div class="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div class="flex items-center gap-2 text-muted-foreground mb-2">
                                <span class="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                                <span class="text-xs md:text-sm font-medium uppercase tracking-wider">Dashboard</span>
                            </div>
                            <h1 class="text-3xl md:text-5xl font-bold font-outfit tracking-tight text-foreground">
                                Hello, <span class="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">{data.user.username}</span>
                            </h1>
                            <p class="text-base md:text-lg text-muted-foreground mt-2 max-w-lg">
                                You have <span class="font-bold text-foreground">{todayItems.length}</span> items on your agenda today. Let's make it a productive one.
                            </p>
                        </div>
                        
                        <div class="flex items-center gap-4 bg-surface-foreground/5 p-3 md:p-4 rounded-2xl backdrop-blur-sm border border-white/10 self-start md:self-auto">
                            <div class="text-center px-2">
                                <p class="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">
                                    {new Date().toLocaleDateString('en-US', { month: 'short' })}
                                </p>
                                <p class="text-xl md:text-2xl font-bold text-foreground leading-none">
                                    {new Date().getDate()}
                                </p>
                            </div>
                            <div class="w-px h-8 bg-border"></div>
                            <div class="text-left">
                                <p class="text-xs md:text-sm font-medium text-foreground">
                                    {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
                                </p>
                                <p class="text-[10px] md:text-xs text-muted-foreground">
                                    {new Date().getFullYear()}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                <!-- Today's Timeline -->
                <section class="animate-fade-in-up" style="animation-delay: 0.1s">
                    <h2 class="text-xl font-bold mb-6 flex items-center gap-2 uppercase tracking-wider text-sm text-muted-foreground">
                        <span class="w-2 h-2 rounded-full bg-primary"></span>
                        Today's Schedule
                    </h2>

                    {#if todayItems.length === 0}
                        <div class="p-8 md:p-12 rounded-3xl bg-surface/30 border border-dashed border-border text-center">
                            <p class="text-lg md:text-xl text-muted-foreground">Nothing scheduled for today. Enjoy your free time! ☕️</p>
                        </div>
                    {:else}
                        <div class="relative space-y-0">
                            <!-- Vertical Line -->
                            <div class="absolute left-6 md:left-24 top-4 bottom-4 w-px bg-border/50"></div>

                            {#each todayItems as item, i}
                                <div class="relative pl-16 md:pl-32 py-4 group rounded-2xl transition-colors -ml-2 md:-ml-4 pr-2 md:pr-4">
                                    <!-- Time -->
                                    <div class="absolute left-0 top-6 w-20 text-right text-sm font-bold text-muted-foreground group-hover:text-foreground transition-colors hidden md:block">
                                        {item.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                    </div>
                                    
                                    <!-- Dot -->
                                    <div class="absolute left-6 md:left-24 top-7 -translate-x-1/2 w-3 h-3 md:w-4 md:h-4 rounded-full border-2 md:border-4 border-background {item.color} z-10 shadow-sm group-hover:scale-125 transition-transform"></div>

                                    <!-- Card -->
                                    <div class="p-4 md:p-5 rounded-2xl bg-surface border border-border/50 shadow-sm group-hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div class="flex items-center gap-4">
                                            <div class="w-10 h-10 md:w-12 md:h-12 rounded-xl {item.color}/10 flex items-center justify-center {item.textColor} flex-shrink-0">
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 md:w-6 md:h-6">
                                                    <path stroke-linecap="round" stroke-linejoin="round" d={item.icon} />
                                                </svg>
                                            </div>
                                            <div class="min-w-0">
                                                <div class="flex items-center gap-2 md:hidden mb-1">
                                                    <span class="text-xs font-bold text-muted-foreground">
                                                        {item.date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <h3 class="text-base md:text-lg font-bold text-foreground truncate">{item.title}</h3>
                                                <p class="text-xs md:text-sm text-muted-foreground truncate">{item.subtitle}</p>
                                            </div>
                                        </div>
                                        {#if item.type === 'task'}
                                            <a href="/tasks" class="w-full md:w-auto text-center px-4 py-2 rounded-lg bg-surface-foreground/5 hover:bg-surface-foreground/10 text-sm font-medium transition-colors text-foreground">Complete</a>
                                        {/if}
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </section>


            </div>

            <!-- Right Column: Widgets -->
            <div class="lg:col-span-4 space-y-6 md:space-y-8">
                
                <!-- Focus Widget (Next Up) -->
                {#if data.nextUp}
                    <div class="relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem] bg-surface border border-border/50 p-6 md:p-8 shadow-xl shadow-primary/5 animate-fade-in-up group">
                        <!-- Background decoration -->
                        <div class="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-primary/10 rounded-full blur-2xl transition-transform group-hover:scale-150"></div>
                        
                        <div class="relative z-10">
                            <div class="flex items-center justify-between mb-4 md:mb-6">
                                <p class="text-xs md:text-sm font-bold text-primary uppercase tracking-wider flex items-center gap-2">
                                    <span class="relative flex h-2.5 w-2.5">
                                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/75 opacity-75"></span>
                                      <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
                                    </span>
                                    Up Next
                                </p>
                                <span class="text-[10px] md:text-xs font-medium text-muted-foreground bg-surface-foreground/5 px-2 py-1 rounded-lg">
                                    {data.nextUp.type === 'class' ? 'Class' : 'Task'}
                                </span>
                            </div>
                            
                            <h2 class="text-2xl md:text-3xl font-bold mb-3 leading-tight text-foreground">{data.nextUp.title}</h2>
                            
                            <div class="flex flex-wrap items-center gap-2 md:gap-3 text-muted-foreground mb-6 md:mb-8">
                                <div class="flex items-center gap-1.5 bg-surface-foreground/5 px-3 py-1.5 rounded-full text-xs md:text-sm">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3 md:w-4 md:h-4">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {data.nextUp.time.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                                </div>
                                {#if data.nextUp.location}
                                    <div class="flex items-center gap-1.5 bg-surface-foreground/5 px-3 py-1.5 rounded-full text-xs md:text-sm">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-3 h-3 md:w-4 md:h-4">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                        </svg>
                                        {data.nextUp.location}
                                    </div>
                                {/if}
                            </div>

                            {#if data.nextUp.type !== 'class'}
                                <a href="/tasks" class="block w-full py-3 md:py-3.5 bg-foreground text-background font-bold rounded-xl text-center hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg text-sm md:text-base">
                                    View Task
                                </a>
                            {/if}
                        </div>
                    </div>
                {/if}

                <!-- Exam Radar -->
                <div class="p-6 md:p-6 rounded-[2rem] md:rounded-[2.5rem] animate-fade-in-up bg-surface border border-border/50 shadow-sm" style="animation-delay: 0.1s">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="font-bold text-base md:text-lg flex items-center gap-2 text-foreground">
                            <span class="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008h-.008v-.008z" />
                                </svg>
                            </span>
                            Exam Radar
                        </h3>
                        <a href="/assessments" class="text-[10px] md:text-xs font-bold text-muted-foreground hover:text-foreground transition-colors bg-surface-foreground/5 px-3 py-1.5 rounded-full">View All</a>
                    </div>

                    {#if data.assessments.length === 0}
                        <div class="text-center py-8">
                            <p class="text-4xl mb-2">🎉</p>
                            <p class="text-sm text-muted-foreground">No upcoming exams.</p>
                        </div>
                    {:else}
                        <div class="space-y-5">
                            {#each data.assessments.slice(0, 3) as exam}
                                <div>
                                    <div class="flex justify-between items-end mb-2">
                                        <div>
                                            <p class="font-bold text-foreground text-sm">{exam.title}</p>
                                            <p class="text-xs text-muted-foreground">{new Date(exam.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                        </div>
                                        <span class="text-[10px] md:text-xs font-bold text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-md">
                                            {Math.ceil((new Date(exam.date) - new Date()) / (1000 * 60 * 60 * 24))} days
                                        </span>
                                    </div>
                                    <div class="h-2 w-full bg-surface-foreground/5 rounded-full overflow-hidden">
                                        <div class="h-full bg-rose-500 rounded-full transition-all duration-1000" style="width: {Math.max(5, 100 - (new Date(exam.date) - new Date()) / (1000 * 60 * 60 * 24 * 30) * 100)}%"></div>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>

                <!-- Quick Stats -->
                <div class="grid grid-cols-2 gap-3 md:gap-4 animate-fade-in-up" style="animation-delay: 0.2s">
                    <a href="/tasks" class="p-5 md:p-6 rounded-[2rem] bg-surface border border-border/50 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10 transition-all group">
                        <div class="w-8 h-8 md:w-10 md:h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 md:w-5 md:h-5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p class="text-2xl md:text-3xl font-bold text-foreground mb-1">{data.tasks.length}</p>
                        <p class="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">Pending Tasks</p>
                    </a>
                    
                    <a href="/schedule" class="p-5 md:p-6 rounded-[2rem] bg-surface border border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all group">
                        <div class="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3 md:mb-4 group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 md:w-5 md:h-5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p class="text-2xl md:text-3xl font-bold text-foreground mb-1">{data.courses.length}</p>
                        <p class="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-wider">Next Classes</p>
                    </a>
                </div>

            </div>
        </div>
    {/if}
</div>
