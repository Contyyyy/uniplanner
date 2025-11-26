<script>
    import { enhance } from '$app/forms';
    import { invalidateAll } from '$app/navigation';
    import TimePicker from '$lib/components/TimePicker.svelte';
    import DatePicker from '$lib/components/DatePicker.svelte';
    import Select from '$lib/components/Select.svelte';
    import { fade, scale, fly } from 'svelte/transition';

    import { onMount, onDestroy } from 'svelte';
    import { pageActions } from '$lib/stores/pageActions';
    import Tour from '$lib/components/Tour.svelte';

    let { data, form } = $props();
    let loading = $state(false);
    let showModal = $state(false);
    let showShareModal = $state(false);
    let showNotifications = $state(false);
    let currentStep = $state(1);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    function getCoursesForDay(day) {
        return data.courses.filter(c => c.dayOfWeek === day);
    }

    let groupedCourses = $derived(
        days.reduce((acc, day) => {
            acc[day] = getCoursesForDay(day);
            return acc;
        }, {})
    );
    
    let startTime = $state('');
    let endTime = $state('');
    let location = $state('');
    let selectedCourseName = $state('');

    let selectedType = $state('class');
    let isRecurring = $state(true);
    let selectedDate = $state('');
    let selectedDay = $derived.by(() => {
        if (!selectedDate) return '';
        const [y, m, d] = selectedDate.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        return date.toLocaleDateString('en-US', { weekday: 'long' });
    });

    // Use subject definitions from server for the dropdown
    let uniqueCourses = $derived(data.subjectDefinitions || []);

    function handleCourseChange(event) {
        const val = event.target.value;
        selectedCourseName = val;
        
        // Auto-fill location if available from existing course definition
        // Note: Subject definitions might not have location, but if they did...
        // Actually, we might want to look at existing schedule items for location?
        // For now, let's just leave location blank or rely on the user.
        // Or we can check if there are any schedule items with this name and take the location from there.
        const existingItem = data.courses.find(c => c.name === val && c.location);
        if (existingItem) {
            location = existingItem.location;
        }
    }

    function openModal(type) {
        selectedType = type;
        showModal = true;
        resetForm();
    }

    function resetForm() {
        currentStep = 1;
        startTime = '';
        endTime = '';
        location = '';
        selectedCourseName = '';

        isRecurring = true;
        selectedDate = '';
        selectedType = 'class';
    }

    function nextStep() {
        if (currentStep === 1 && !selectedType) return;
        if (currentStep === 2 && !selectedCourseName) return;

        if (currentStep === 3 && (!selectedDate || !startTime || !endTime)) return;
        if (currentStep === 4 && !location) return;
        currentStep++;
    }

    function prevStep() {
        if (currentStep > 1) currentStep--;
    }

    let specificDate = $derived(
        selectedDay && data.weekDates[selectedDay] ? data.weekDates[selectedDay] : ''
    );

    onMount(() => {
        if (data.user) {
            pageActions.set([
                {
                    label: 'Add Item',
                    onClick: () => openModal('class'),
                    icon: 'M12 4.5v15m7.5-7.5h-15'
                }
            ]);
        }
    });

    onDestroy(() => {
        pageActions.set([]);
    });
</script>

<div class="max-w-6xl mx-auto space-y-8 animate-fade-in-up relative">
    <header class="flex flex-row items-center justify-between gap-4">
        <div>
            <h1 class="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Schedule</h1>
            <p class="hidden md:block text-base text-muted-foreground mt-1">Weekly timetable and classes</p>
        </div>
        {#if data.user}
            <div class="flex items-center gap-2 md:gap-3 relative">
                <!-- Notification Bell -->
                <div class="relative">
                    <button 
                        onclick={() => showNotifications = !showNotifications}
                        class="p-2.5 bg-surface-foreground/5 text-foreground rounded-xl hover:bg-surface-foreground/10 transition-all hover:scale-105 border border-border relative"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 md:w-6 md:h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                        </svg>
                        {#if data.notifications && data.notifications.length > 0}
                            <span class="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-surface"></span>
                        {/if}
                    </button>

                    {#if showNotifications}
                        <div 
                            class="fixed left-4 right-4 top-20 md:absolute md:top-full md:left-auto md:right-0 md:mt-2 md:w-80 bg-white dark:bg-slate-900 border border-border rounded-xl shadow-xl z-50 overflow-hidden"
                            transition:scale={{ start: 0.95, duration: 150 }}
                        >
                            <div class="p-3 border-b border-border bg-surface-foreground/5">
                                <h3 class="font-semibold text-sm">Notifications</h3>
                            </div>
                            <div class="max-h-[300px] overflow-y-auto">
                                {#if data.notifications && data.notifications.length > 0}
                                    {#each data.notifications as notification}
                                        <div class="p-4 border-b border-border/50 last:border-0 hover:bg-surface-foreground/5 transition-colors">
                                            <div class="flex items-start gap-3">
                                                <div class="p-2 bg-primary/10 rounded-full text-primary shrink-0">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                                        <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                                    </svg>
                                                </div>
                                                <div class="flex-1 min-w-0">
                                                    <p class="text-sm font-medium leading-tight">
                                                        {#if notification.data}
                                                            {@const data = JSON.parse(notification.data)}
                                                            <span class="font-bold">{data.senderName}</span> shared a schedule
                                                        {:else}
                                                            New Notification
                                                        {/if}
                                                    </p>
                                                    <p class="text-xs text-muted-foreground mt-1">
                                                        {new Date(notification.createdAt).toLocaleDateString()}
                                                    </p>
                                                    
                                                    {#if notification.type === 'schedule_share' && notification.data}
                                                        {@const notifData = JSON.parse(notification.data)}
                                                        <div class="flex gap-2 mt-3">
                                                            <form action="?/acceptShare" method="POST" use:enhance class="flex-1">
                                                                <input type="hidden" name="notificationId" value={notification.id} />
                                                                <input type="hidden" name="shareId" value={notifData.shareId} />
                                                                <button type="submit" class="w-full px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary/90 transition-colors">
                                                                    Accept
                                                                </button>
                                                            </form>
                                                            <form action="?/declineShare" method="POST" use:enhance class="flex-1">
                                                                <input type="hidden" name="notificationId" value={notification.id} />
                                                                <input type="hidden" name="shareId" value={notifData.shareId} />
                                                                <button type="submit" class="w-full px-3 py-1.5 bg-surface-foreground/10 text-foreground text-xs font-semibold rounded-lg hover:bg-surface-foreground/20 transition-colors">
                                                                    Decline
                                                                </button>
                                                            </form>
                                                        </div>
                                                    {/if}
                                                </div>
                                            </div>
                                        </div>
                                    {/each}
                                {:else}
                                    <div class="p-8 text-center text-muted-foreground">
                                        <p class="text-sm">No new notifications</p>
                                    </div>
                                {/if}
                            </div>
                        </div>
                    {/if}
                </div>

                <button 
                    onclick={() => showShareModal = true}
                    class="p-2.5 md:px-6 md:py-2.5 bg-surface-foreground/5 text-foreground font-semibold rounded-xl hover:bg-surface-foreground/10 transition-all hover:scale-105 flex items-center gap-2 border border-border text-sm md:text-base"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                    </svg>
                    <span class="hidden md:inline">Share</span>
                </button>
                <button 
                    onclick={() => openModal('class')}
                    class="hidden md:flex px-4 md:px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/25 items-center gap-2 text-sm md:text-base"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <span class="hidden md:inline">Add Item</span>
                    <span class="md:hidden">Add</span>
                </button>

                <!-- Mobile Profile Link (Inline) -->
                <a href="/profile" class="md:hidden w-10 h-10 rounded-full bg-surface-foreground/5 border border-border flex items-center justify-center overflow-hidden transition-all active:scale-95 hover:scale-105">
                    {#if data.user && data.user.profilePicture && data.user.profilePicture.length > 5}
                        <img src={data.user.profilePicture} alt="Profile" class="w-full h-full object-cover" />
                    {:else if data.user && data.user.profilePicture}
                        <span class="text-sm font-bold text-primary">{data.user.profilePicture}</span>
                    {:else if data.user}
                        <span class="text-sm font-bold text-primary">{data.user.username.slice(0, 2).toUpperCase()}</span>
                    {:else}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 text-muted-foreground">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                    {/if}
                </a>
            </div>
        {/if}
    </header>

    {#if !data.user}
        <div class="glass-panel p-8 rounded-2xl text-center">
            <p class="text-lg font-medium mb-4">Please log in to manage your schedule</p>
            <a href="/demo/lucia/login" class="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all">Log In</a>
        </div>
    {:else}
        <!-- Week Navigation -->
        <div class="flex items-center justify-between bg-surface/50 backdrop-blur-sm p-4 rounded-2xl border border-border mb-6">
            <a href="?week={data.weekOffset - 1}" class="p-2 hover:bg-surface-foreground/10 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
            </a>
            <div class="text-center">
                <h2 class="text-lg font-bold">
                    {new Date(data.weekStart).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} - {new Date(data.weekEnd).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </h2>
                {#if data.weekOffset === 0}
                    <span class="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">Current Week</span>
                {/if}
            </div>
            <a href="?week={data.weekOffset + 1}" class="p-2 hover:bg-surface-foreground/10 rounded-lg transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
            </a>
        </div>

        <!-- Timetable Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 md:gap-6">
            {#each days as day}
                {@const date = new Date(data.weekDates[day])}
                {@const isToday = new Date().toDateString() === date.toDateString()}
                
                <div class="space-y-3 md:space-y-4">
                    <div class="sticky top-0 bg-background/95 backdrop-blur-sm py-2 md:py-3 z-10 border-b border-border/50 flex items-center justify-between md:block">
                        <div>
                            <h3 class="font-bold text-base md:text-lg {isToday ? 'text-primary' : 'text-muted-foreground'}">{day}</h3>
                            <p class="text-xs md:text-sm font-medium text-muted-foreground/70">{date.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' })}</p>
                        </div>
                        {#if isToday}
                             <span class="md:hidden text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">Today</span>
                        {/if}
                    </div>
                    
                    <div class="space-y-3">
                        {#if groupedCourses[day] && groupedCourses[day].length > 0}
                            {#each groupedCourses[day] as course}
                                {@const attendanceRecord = data.attendance.find(a => a.courseId === course.id && new Date(a.date).toDateString() === date.toDateString())}
                                
                                <div class="glass-card p-4 rounded-xl relative group {course.type === 'activity' ? 'border-l-4 border-l-amber-500 bg-amber-500/5' : ''}">
                                    <div class="flex justify-between items-start">
                                        <div class="flex-1 min-w-0">
                                            <div class="flex items-center gap-2">
                                                <p class="font-bold text-base truncate {course.type === 'activity' ? 'text-amber-500' : ''}">{course.name}</p>
                                                {#if course.isPrivate}
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 text-muted-foreground flex-shrink-0" title="Private">
                                                        <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd" />
                                                    </svg>
                                                {/if}
                                                {#if !course.isRecurring}
                                                    <span class="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70 bg-surface-foreground/5 px-1.5 py-0.5 rounded">One-off</span>
                                                {/if}
                                            </div>
                                            <div class="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 flex-shrink-0">
                                                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clip-rule="evenodd" />
                                                </svg>
                                                {course.startTime}
                                            </div>
                                            <div class="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 flex-shrink-0">
                                                    <path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 18c2.21 0 4-1.79 4-4 0-1.142-.45-2.184-1.19-2.928a4.5 4.5 0 00-2.81-1.07 4.5 4.5 0 00-2.81 1.07A4.001 4.001 0 006 14c0 2.21 1.79 4 4 4 .11 0 .22-.02.31-.067zM10 8a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                                                </svg>
                                                {course.location}
                                            </div>
                                        </div>
                                        <div class="flex flex-col gap-1">
                                            <form method="POST" action="?/delete" use:enhance>
                                                <input type="hidden" name="id" value={course.id} />
                                                <button type="submit" class="text-muted-foreground hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-500/10 transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100" aria-label="Delete course">
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                                    </svg>
                                                </button>
                                            </form>
                                            {#if course.type !== 'activity'}
                                                {#if attendanceRecord}
                                                    <div class="p-1.5 rounded-lg flex items-center justify-center" title={attendanceRecord.status === 'present' ? 'Attended' : 'Absent'}>
                                                        {#if attendanceRecord.status === 'present'}
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-emerald-500">
                                                                <path fill-rule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clip-rule="evenodd" />
                                                            </svg>
                                                        {:else}
                                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-6 h-6 text-rose-500">
                                                                <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clip-rule="evenodd" />
                                                            </svg>
                                                        {/if}
                                                    </div>
                                                {:else}
                                                    <div class="flex flex-col gap-1 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                        <form method="POST" action="?/markAttendance" use:enhance>
                                                            <input type="hidden" name="courseId" value={course.id} />
                                                            <input type="hidden" name="status" value="present" />
                                                            <input type="hidden" name="date" value={data.weekDates[day]} />
                                                            <button type="submit" class="text-muted-foreground hover:text-emerald-500 p-1.5 rounded-lg hover:bg-emerald-500/10 transition-all" title="Mark Present">
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                                </svg>
                                                            </button>
                                                        </form>
                                                        <form method="POST" action="?/markAttendance" use:enhance>
                                                            <input type="hidden" name="courseId" value={course.id} />
                                                            <input type="hidden" name="status" value="absent" />
                                                            <input type="hidden" name="date" value={data.weekDates[day]} />
                                                            <button type="submit" class="text-muted-foreground hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-500/10 transition-all" title="Mark Absent">
                                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                                </svg>
                                                            </button>
                                                        </form>
                                                    </div>
                                                {/if}
                                            {/if}
                                        </div>
                                    </div>

                                </div>
                            {/each}
                        {:else}
                            <div class="h-24 rounded-xl border-2 border-dashed border-border/50 flex items-center justify-center text-muted-foreground/50 text-sm">
                                No classes
                            </div>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    {/if}

    <!-- Add Class Modal -->
    {#if showModal}
        <div class="fixed inset-0 z-50 flex items-start justify-center p-4 pt-24">
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div 
                class="absolute inset-0 bg-black/50 backdrop-blur-sm" 
                transition:fade
                onclick={() => showModal = false}
            ></div>

            <div class="relative z-10 glass-panel p-6 rounded-2xl w-full max-w-md shadow-2xl max-h-[85vh] overflow-y-auto" transition:scale={{ start: 0.95 }}>
                <div class="flex items-center justify-between mb-6">
                    <div>
                        <h2 class="text-2xl font-bold">Add New Item</h2>
                        <div class="flex gap-1 mt-2">
                            {#each [1, 2, 3, 4, 5] as step}
                                <div class="h-1 w-8 rounded-full transition-colors {step <= currentStep ? 'bg-primary' : 'bg-border'}"></div>
                            {/each}
                        </div>
                    </div>
                    <button onclick={() => showModal = false} class="text-muted-foreground hover:text-foreground transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form 
                    method="POST" 
                    action="?/create" 
                    use:enhance={() => {
                        loading = true;
                        return async ({ update, result }) => {
                            await update();
                            await invalidateAll();
                            loading = false;
                            if (result.type === 'success') {
                                showModal = false;
                                resetForm();
                            }
                        };
                    }} 
                    class="flex flex-col"
                >
                    <!-- Hidden Inputs for Wizard State -->
                    <input type="hidden" name="type" value={selectedType} />
                    <input type="hidden" name="name" value={selectedCourseName === 'new' ? customCourseName : selectedCourseName} />
                    <input type="hidden" name="day" value={selectedDay} />
                    <input type="hidden" name="date" value={selectedDate} />
                    <input type="hidden" name="startTime" value={startTime} />
                    <input type="hidden" name="endTime" value={endTime} />
                    <input type="hidden" name="location" value={location} />
                    <input type="hidden" name="isRecurring" value={isRecurring ? 'on' : 'off'} />
                    <input type="hidden" name="specificDate" value={selectedDate} />

                    <div class="flex-1 min-h-[300px] grid grid-cols-1">
                        {#if currentStep === 1}
                            <div class="space-y-6 col-start-1 row-start-1" transition:fade={{ duration: 200 }}>
                                <h3 class="text-xl font-semibold">What are you adding?</h3>
                                <div class="grid grid-cols-2 gap-4">
                                    <button 
                                        type="button"
                                        onclick={() => selectedType = 'class'}
                                        class="p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3 {selectedType === 'class' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}"
                                    >
                                        <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                                            </svg>
                                        </div>
                                        <span class="font-semibold">Class</span>
                                    </button>
                                    <button 
                                        type="button"
                                        onclick={() => selectedType = 'activity'}
                                        class="p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3 {selectedType === 'activity' ? 'border-amber-500 bg-amber-500/5' : 'border-border hover:border-amber-500/50'}"
                                    >
                                        <div class="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                                            </svg>
                                        </div>
                                        <span class="font-semibold">Activity</span>
                                    </button>
                                </div>
                            </div>
                        {:else if currentStep === 2}
                            <div class="space-y-4 col-start-1 row-start-1" transition:fade={{ duration: 200 }}>
                                <h3 class="text-xl font-semibold">What is it called?</h3>
                                <div class="space-y-4">
                                    <div class="space-y-2">
                                        <label for="courseSelect" class="text-sm font-medium ml-1">Name</label>
                                        {#if selectedType === 'class'}
                                            <Select 
                                                name="courseSelect_input" 
                                                bind:value={selectedCourseName}
                                                required 
                                                placeholder="Select a course..."
                                                options={[
                                                    ...uniqueCourses.map(c => ({ value: c.name, label: c.name })),
                                                    { value: 'add-new', label: 'Add more courses', href: '/profile', special: true }
                                                ]}
                                            />
                                        {:else}
                                            <input 
                                                type="text" 
                                                name="courseSelect_input" 
                                                bind:value={selectedCourseName}
                                                required 
                                                placeholder="e.g. Gym, Study, Lunch..."
                                                class="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            />
                                        {/if}
                                    </div>
                                </div>
                            </div>
                        {:else if currentStep === 3}
                            <div class="space-y-4 col-start-1 row-start-1" transition:fade={{ duration: 200 }}>
                                <h3 class="text-xl font-semibold">When does it happen?</h3>
                                <div class="space-y-4">
                                    <div class="space-y-2">
                                        <label for="date" class="text-sm font-medium ml-1 text-primary">Pick a Date</label>
                                        <DatePicker 
                                            name="date_input" 
                                            bind:value={selectedDate}
                                            required 
                                            placeholder="Select date"
                                        />
                                    </div>
                                    <div class="grid grid-cols-2 gap-4">
                                        <div class="space-y-2">
                                            <label for="startTime" class="text-sm font-medium ml-1">Start Time</label>
                                            <TimePicker name="startTime_input" bind:value={startTime} required placeholder="09:00" />
                                        </div>
                                        <div class="space-y-2">
                                            <label for="endTime" class="text-sm font-medium ml-1">End Time</label>
                                            <TimePicker name="endTime_input" bind:value={endTime} required placeholder="10:00" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        {:else if currentStep === 4}
                            <div class="space-y-4 col-start-1 row-start-1" transition:fade={{ duration: 200 }}>
                                <h3 class="text-xl font-semibold">Where is it?</h3>
                                <div class="space-y-2">
                                    <label for="location" class="text-sm font-medium ml-1">Location</label>
                                    <input 
                                        type="text" 
                                        name="location_input" 
                                        bind:value={location} 
                                        placeholder="Room 101" 
                                        required 
                                        class="w-full px-4 py-2.5 rounded-xl bg-surface-foreground/5 border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" 
                                        autofocus
                                    />
                                </div>
                            </div>
                        {:else if currentStep === 5}
                            <div class="space-y-4 col-start-1 row-start-1" transition:fade={{ duration: 200 }}>
                                <h3 class="text-xl font-semibold">Is this recurring?</h3>
                                <div class="flex items-center gap-3 p-4 rounded-xl bg-surface-foreground/5 border border-border">
                                    <input 
                                        type="checkbox" 
                                        id="isRecurring" 
                                        bind:checked={isRecurring}
                                        class="w-5 h-5 rounded border-border text-primary focus:ring-primary"
                                    />
                                    <div class="flex flex-col">
                                        <label for="isRecurring" class="font-medium cursor-pointer">Repeat Weekly</label>
                                        <span class="text-xs text-muted-foreground">
                                            {#if isRecurring}
                                                This item will appear every week on {selectedDay || 'this day'}.
                                            {:else}
                                                This item will ONLY appear for the week of {new Date(data.weekStart).toLocaleDateString()}.
                                            {/if}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        {/if}
                    </div>

                    <div class="flex justify-between gap-3 pt-8 mt-auto">
                        {#if currentStep > 1}
                            <button 
                                type="button" 
                                onclick={prevStep}
                                class="px-6 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                </svg>
                                Back
                            </button>
                        {:else}
                            <div></div> <!-- Spacer -->
                        {/if}

                        {#if currentStep < 5}
                            <button 
                                type="button" 
                                onclick={nextStep}
                                class="px-8 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/25 flex items-center gap-2"
                            >
                                Next
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </button>
                        {:else}
                            <button 
                                type="submit" 
                                disabled={loading}
                                class="px-8 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                            >
                                {#if loading}
                                    <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Create Item
                                {:else}
                                    Finish
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                {/if}
                            </button>
                        {/if}
                    </div>
                </form>
                {#if form?.message}
                    <p class="text-rose-500 text-sm mt-4 font-medium text-center">{form.message}</p>
                {/if}
            </div>
        </div>
    {/if}
</div>

    <!-- Share Modal -->
    {#if showShareModal}
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div 
                class="absolute inset-0 bg-black/50 backdrop-blur-sm" 
                transition:fade
                onclick={() => showShareModal = false}
            ></div>

            <div class="relative z-10 glass-panel p-6 rounded-2xl w-full max-w-md shadow-2xl" transition:scale={{ start: 0.95 }}>
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold">Share Schedule</h2>
                    <button onclick={() => showShareModal = false} class="text-muted-foreground hover:text-foreground transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form 
                    method="POST" 
                    action="?/share" 
                    use:enhance={() => {
                        loading = true;
                        return async ({ update, result }) => {
                            await update();
                            loading = false;
                            if (result.type === 'success') {
                                showShareModal = false;
                            }
                        };
                    }} 
                    class="space-y-4"
                >
                    <div class="space-y-2">
                        <label for="email" class="text-sm font-medium ml-1">Friend's Username</label>
                        <input 
                            type="text" 
                            name="email" 
                            placeholder="Enter username" 
                            required 
                            class="w-full px-4 py-3 rounded-xl bg-surface border border-border focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                        <p class="text-xs text-muted-foreground ml-1">The user must have an account to receive the schedule.</p>
                    </div>

                    <div class="space-y-2">
                        <label for="weekStart" class="text-sm font-medium ml-1">Week to Share</label>
                        <div class="px-4 py-3 rounded-xl bg-surface-foreground/5 border border-border text-muted-foreground">
                            {new Date(data.weekStart).toLocaleDateString()} - {new Date(data.weekEnd).toLocaleDateString()}
                        </div>
                        <input type="hidden" name="weekStart" value={data.weekStart} />
                        <p class="text-xs text-muted-foreground ml-1">Sharing is limited to one week at a time.</p>
                    </div>

                    <div class="pt-4">
                        <button 
                            type="submit" 
                            disabled={loading}
                            class="w-full px-8 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                        >
                            {#if loading}
                                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Sending...
                            {:else}
                                Share Schedule
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                </svg>
                            {/if}
                        </button>
                    </div>
                </form>
                {#if form?.message}
                    <p class="text-rose-500 text-sm mt-4 font-medium text-center">{form.message}</p>
                {/if}
            </div>
        </div>
    {/if}


{#if data.user && !data.user.hasSeenScheduleTour}
    <Tour 
        title="Your Weekly Schedule 📅" 
        description="View your classes for the week, add new items, and mark your attendance. Use the arrows to navigate between weeks. Recurring classes will appear automatically!"
        action="?/dismissTour"
    />
{/if}
