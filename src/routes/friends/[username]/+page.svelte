<script>
    let { data } = $props();
    
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8); // 8 AM to 8 PM

    function getCourseStyle(course) {
        const startHour = parseInt(course.startTime.split(':')[0]);
        const startMinute = parseInt(course.startTime.split(':')[1]);
        const endHour = parseInt(course.endTime.split(':')[0]);
        const endMinute = parseInt(course.endTime.split(':')[1]);

        const startOffset = (startHour - 8) * 60 + startMinute;
        const duration = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);

        return `
            top: ${startOffset}px;
            height: ${duration}px;
            background-color: ${course.color}20;
            border-left: 4px solid ${course.color};
            color: ${course.color};
        `;
    }
</script>

<div class="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
    <header>
        <h1 class="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {data.friend.username}'s Profile
        </h1>
        <p class="text-muted-foreground mt-1">Viewing shared schedule and tasks</p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Schedule -->
        <div class="lg:col-span-2 glass-panel p-6 rounded-2xl overflow-hidden">
            <h2 class="text-xl font-bold mb-4">Weekly Schedule</h2>
            <div class="overflow-x-auto">
                <div class="min-w-[600px] relative">
                    <!-- Header -->
                    <div class="grid grid-cols-8 gap-2 mb-2">
                        <div class="w-12"></div> <!-- Time column -->
                        {#each days as day}
                            <div class="text-center font-semibold text-sm text-muted-foreground">{day.slice(0, 3)}</div>
                        {/each}
                    </div>

                    <!-- Grid -->
                    <div class="relative h-[780px] bg-surface-foreground/5 rounded-xl">
                        <!-- Time labels and grid lines -->
                        {#each timeSlots as hour}
                            <div class="absolute w-full border-t border-border/50 flex items-center" style="top: {(hour - 8) * 60}px">
                                <span class="absolute -left-12 text-xs text-muted-foreground w-10 text-right pr-2">
                                    {hour > 12 ? hour - 12 : hour} {hour >= 12 ? 'PM' : 'AM'}
                                </span>
                            </div>
                        {/each}

                        <!-- Courses -->
                        {#each data.courses as course}
                            {@const dayIndex = days.indexOf(course.dayOfWeek)}
                            {#if dayIndex !== -1}
                                <div 
                                    class="absolute rounded-lg p-2 text-xs font-medium overflow-hidden hover:brightness-95 transition-all cursor-pointer group z-10"
                                    style="{getCourseStyle(course)}; left: calc({(dayIndex + 1) * 100}% / 8 + 4px); width: calc(100% / 8 - 8px);"
                                >
                                    <div class="font-bold truncate">{course.name}</div>
                                    <div class="truncate opacity-75">{course.location}</div>
                                    <div class="truncate opacity-75">{course.startTime} - {course.endTime}</div>
                                </div>
                            {/if}
                        {/each}
                    </div>
                </div>
            </div>
        </div>

        <!-- Sidebar: Tasks & Assessments -->
        <div class="space-y-8">
            <!-- Tasks -->
            <div class="glass-panel p-6 rounded-2xl">
                <h2 class="text-xl font-bold mb-4">Upcoming Tasks</h2>
                <div class="space-y-3">
                    {#if data.tasks.length === 0}
                        <p class="text-muted-foreground text-sm">No public tasks visible.</p>
                    {:else}
                        {#each data.tasks as task}
                            <div class="p-3 rounded-xl bg-surface-foreground/5 border border-border/50">
                                <h3 class="font-semibold {task.completed ? 'line-through text-muted-foreground' : ''}">{task.title}</h3>
                                {#if task.dueDate}
                                    <p class="text-xs text-muted-foreground mt-1">Due: {new Date(task.dueDate).toLocaleDateString()}</p>
                                {/if}
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>

            <!-- Assessments -->
            <div class="glass-panel p-6 rounded-2xl">
                <h2 class="text-xl font-bold mb-4">Upcoming Assessments</h2>
                <div class="space-y-3">
                    {#if data.assessments.length === 0}
                        <p class="text-muted-foreground text-sm">No public assessments visible.</p>
                    {:else}
                        {#each data.assessments as assessment}
                            <div class="p-3 rounded-xl bg-surface-foreground/5 border border-border/50 relative overflow-hidden">
                                <div class="absolute left-0 top-0 bottom-0 w-1" style="background-color: {assessment.courseColor || '#0d9488'}"></div>
                                <div class="pl-3">
                                    <h3 class="font-semibold">{assessment.title}</h3>
                                    <div class="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                        <span>{new Date(assessment.date).toLocaleDateString()}</span>
                                        <span>•</span>
                                        <span>{assessment.type}</span>
                                    </div>
                                </div>
                            </div>
                        {/each}
                    {/if}
                </div>
            </div>
        </div>
    </div>
</div>
