<script>
    import { fade } from 'svelte/transition';

    let { data } = $props();

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    function getCoursesForDay(day) {
        return data.courses.filter(c => {
            if (c.dayOfWeek === day) return true;
            if (c.specificDate) {
                const d = new Date(c.specificDate);
                return d.toLocaleDateString('en-US', { weekday: 'long' }) === day;
            }
            return false;
        });
    }

    let groupedCourses = $derived(
        days.reduce((acc, day) => {
            acc[day] = getCoursesForDay(day);
            return acc;
        }, {})
    );
</script>

<div class="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
    <header class="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0">
        <div>
            <h1 class="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                {data.sender.username}'s Schedule
            </h1>
            <p class="text-sm md:text-base text-muted-foreground mt-1">
                Viewing shared schedule for {new Date(data.weekStart).toLocaleDateString()} - {new Date(data.weekEnd).toLocaleDateString()}
            </p>
        </div>
        <a href="/schedule" class="self-start md:self-auto px-4 md:px-6 py-2.5 bg-surface-foreground/5 text-foreground font-semibold rounded-xl hover:bg-surface-foreground/10 transition-all flex items-center gap-2 text-sm md:text-base">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Schedule
        </a>
    </header>

    <!-- Timetable Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
        {#each days as day}
            {@const date = new Date(data.weekDates[day])}
            
            <div class="space-y-3 md:space-y-4">
                <div class="sticky top-0 bg-background/95 backdrop-blur-sm py-2 md:py-3 z-10 border-b border-border/50">
                    <h3 class="font-bold text-base md:text-lg text-muted-foreground">{day}</h3>
                    <p class="text-xs md:text-sm font-medium text-muted-foreground/70">{date.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}</p>
                </div>
                
                <div class="space-y-3">
                    {#if groupedCourses[day] && groupedCourses[day].length > 0}
                        {#each groupedCourses[day] as course}
                            {#if !course.isPrivate}
                                <div class="glass-card p-3 md:p-4 rounded-xl relative border-l-4" style="border-left-color: {course.color}">
                                    <div class="flex justify-between items-start">
                                        <div class="flex-1 min-w-0">
                                            <div class="flex items-center gap-2">
                                                <p class="font-bold text-sm md:text-base truncate">{course.name}</p>
                                                {#if !course.isRecurring}
                                                    <span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 bg-surface-foreground/5 px-1.5 py-0.5 rounded">One-off</span>
                                                {/if}
                                            </div>
                                            <div class="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mt-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3 md:w-4 md:h-4 flex-shrink-0">
                                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clip-rule="evenodd" />
                                                </svg>
                                                {course.startTime} - {course.endTime}
                                            </div>
                                            {#if course.location}
                                                <div class="flex items-center gap-2 text-xs md:text-sm text-muted-foreground mt-0.5">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3 md:w-4 md:h-4 flex-shrink-0">
                                                        <path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 18c2.21 0 4-1.79 4-4 0-1.142-.45-2.184-1.19-2.928a4.5 4.5 0 00-2.81-1.07 4.5 4.5 0 00-2.81 1.07A4.001 4.001 0 006 14c0 2.21 1.79 4 4 4 .11 0 .22-.02.31-.067zM10 8a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                                                    </svg>
                                                    {course.location}
                                                </div>
                                            {/if}
                                        </div>
                                    </div>
                                </div>
                            {/if}
                        {/each}
                    {:else}
                        <div class="h-20 md:h-24 rounded-xl border-2 border-dashed border-border/50 flex items-center justify-center text-muted-foreground/50 text-xs md:text-sm">
                            No classes
                        </div>
                    {/if}
                </div>
            </div>
        {/each}
    </div>
</div>
