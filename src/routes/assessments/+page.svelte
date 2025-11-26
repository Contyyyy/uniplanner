<script>
    import { enhance } from '$app/forms';
    import { invalidateAll } from '$app/navigation';
    import DatePicker from '$lib/components/DatePicker.svelte';
    import TimePicker from '$lib/components/TimePicker.svelte';
    import Select from '$lib/components/Select.svelte';
    import { fade, scale, fly } from 'svelte/transition';

    import { onMount, onDestroy } from 'svelte';
    import { pageActions } from '$lib/stores/pageActions';
    import Tour from '$lib/components/Tour.svelte';

    let { data, form } = $props();
    let loading = $state(false);

    let showAddAssessmentModal = $state(false);
    let showCompleteModal = $state(false);
    let selectedAssessmentId = $state('');
    let grade = $state('');
    let selectedCourseId = $state('');
    let date = $state('');
    let time = $state('');
    let timePicker = $state('');
    let currentStep = $state(1);
    let title = $state('');
    let location = $state('');
    let weight = $state('');

    function nextStep() {
        if (currentStep === 1 && !title) return;
        if (currentStep === 2 && !selectedCourseId) return;
        if (currentStep === 3 && !date) return;
        currentStep++;
    }

    function prevStep() {
        if (currentStep > 1) currentStep--;
    }

    function resetForm() {
        currentStep = 1;
        title = '';
        selectedCourseId = '';
        date = '';
        time = '';
        location = '';
        weight = '';
    }

    function incrementWeight() {
        let val = parseInt(weight) || 0;
        if (val < 100) weight = (val + 5).toString();
    }

    function decrementWeight() {
        let val = parseInt(weight) || 0;
        if (val > 0) weight = (val - 5).toString();
    }

    function handleCourseChange(event) {
        selectedCourseId = event.target.value;
    }

    onMount(() => {
        if (data.user) {
            pageActions.set([
                {
                    label: 'Add Assessment',
                    onClick: () => { showAddAssessmentModal = true; resetForm(); },
                    icon: 'M12 4.5v15m7.5-7.5h-15'
                }
            ]);
        }
    });

    onDestroy(() => {
        pageActions.set([]);
    });
</script>

<div class="max-w-4xl mx-auto space-y-8 animate-fade-in-up relative">
    <header class="flex items-center justify-between">
        <div class="pr-12 md:pr-0">
            <h1 class="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Assessments</h1>
            <p class="text-muted-foreground mt-1">Track your exams and coursework</p>
        </div>
        {#if data.user}
            <button 
                onclick={() => showAddAssessmentModal = true}
                class="hidden md:flex px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/25 items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Assessment
            </button>
        {/if}
    </header>

    {#if !data.user}
        <div class="glass-panel p-8 rounded-2xl text-center">
            <p class="text-lg font-medium mb-4">Please log in to manage your assessments</p>
            <a href="/demo/lucia/login" class="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all">Log In</a>
        </div>
    {:else}
        <!-- Assessments List -->
        <div class="space-y-4">
            {#if data.assessments.length === 0}
                <div class="glass-card p-12 rounded-2xl text-center flex flex-col items-center justify-center text-muted-foreground">
                    <div class="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 3.75V16.5L12 14.25 7.5 16.5V3.75m9 0H18A2.25 2.25 0 0120.25 6v12A2.25 2.25 0 0118 20.25H6A2.25 2.25 0 013.75 18V6A2.25 2.25 0 016 3.75h1.5m9 0h-9" />
                        </svg>
                    </div>
                    <p class="text-lg font-medium">You're all caught up!</p>
                    <p>Relax and recharge! 🧠</p>
                </div>
            {:else}
                {#each data.assessments as assessment}
                    <div class="glass-card p-4 rounded-xl flex items-center justify-between group">
                        <div class="flex items-center gap-4">
                            <div class="flex flex-col items-center justify-center w-14 h-14 rounded-xl bg-surface-foreground/5 border border-border">
                                <span class="text-xs font-bold text-primary uppercase">{new Date(assessment.date).toLocaleDateString(undefined, { month: 'short' })}</span>
                                <span class="text-xl font-bold">{new Date(assessment.date).getDate()}</span>
                            </div>
                            <div>
                                <div class="flex items-center gap-2">
                                    <h3 class="font-bold text-lg">{assessment.title}</h3>
                                    {#if assessment.isPrivate}
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 text-muted-foreground" title="Private">
                                            <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd" />
                                        </svg>
                                    {/if}
                                </div>
                                <div class="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                                    <span class="flex items-center gap-1.5">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {new Date(assessment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {#if assessment.location}
                                        <span class="flex items-center gap-1.5">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                            </svg>
                                            {assessment.location}
                                        </span>
                                    {/if}
                                    {#if assessment.courseName}
                                        <span class="flex items-center gap-1.5">
                                            <div class="w-2 h-2 rounded-full" style="background-color: {assessment.courseColor || '#0d9488'}"></div>
                                            {assessment.courseName}
                                        </span>
                                    {/if}
                                </div>
                            </div>
                        </div>

                        <div class="flex items-center gap-2">
                            <button 
                                onclick={() => {
                                    selectedAssessmentId = assessment.id;
                                    showCompleteModal = true;
                                }}
                                class="p-2 text-muted-foreground hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                title="Mark as Complete"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                </svg>
                            </button>
                            <form method="POST" action="?/delete" use:enhance>
                                <input type="hidden" name="id" value={assessment.id} />
                                <button class="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100" title="Delete">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </div>
                {/each}
            {/if}
        </div>
    {/if}

    <!-- Complete Assessment Modal -->
    {#if showCompleteModal}
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div 
                class="absolute inset-0 bg-black/50 backdrop-blur-sm" 
                transition:fade
                onclick={() => showCompleteModal = false}
            ></div>

            <div class="relative z-10 glass-panel w-full max-w-md p-6 rounded-2xl shadow-2xl" transition:scale>
                <h2 class="text-2xl font-bold mb-2">Assessment Complete! 🎉</h2>
                <p class="text-muted-foreground mb-6">Enter your grade to track your progress.</p>
                
                <form 
                    method="POST" 
                    action="?/complete" 
                    use:enhance={() => {
                        return async ({ update, result }) => {
                            await update();
                            await invalidateAll();
                            if (result.type === 'success') {
                                showCompleteModal = false;
                                grade = '';
                            }
                        };
                    }}
                    class="space-y-6"
                >
                    <input type="hidden" name="id" value={selectedAssessmentId} />
                    
                    <div class="space-y-2">
                        <label for="grade" class="text-sm font-medium ml-1">Grade Achieved (%)</label>
                        <div class="relative">
                            <input 
                                type="number" 
                                name="grade" 
                                bind:value={grade}
                                placeholder="85" 
                                min="0" 
                                max="100" 
                                required 
                                class="w-full px-4 py-3 rounded-xl bg-surface-foreground/5 border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-lg font-bold text-center" 
                            />
                            <span class="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">%</span>
                        </div>
                    </div>

                    <div class="flex justify-end gap-3">
                        <button 
                            type="button" 
                            onclick={() => showCompleteModal = false}
                            class="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            class="px-6 py-2.5 bg-emerald-500 text-white font-semibold rounded-xl hover:bg-emerald-600 transition-all hover:scale-105 shadow-lg shadow-emerald-500/25"
                        >
                            Save Grade
                        </button>
                    </div>
                </form>
            </div>
        </div>
    {/if}

    <!-- Add Assessment Modal -->
    {#if showAddAssessmentModal}
        <div class="fixed inset-0 z-50 flex items-start justify-center p-4 pt-24">
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div 
                class="absolute inset-0 bg-black/50 backdrop-blur-sm" 
                transition:fade
                onclick={() => showAddAssessmentModal = false}
            ></div>

            <div class="relative z-10 glass-panel p-6 rounded-2xl w-full max-w-md shadow-2xl max-h-[85vh] overflow-y-auto" transition:scale={{ start: 0.95 }}>
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-xl font-bold">Add Assessment</h2>
                    <button onclick={() => showAddAssessmentModal = false} class="p-2 hover:bg-surface-foreground/10 rounded-full transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <!-- Progress Bar -->
                <div class="w-full h-1.5 bg-surface-foreground/10 rounded-full mb-6 overflow-hidden">
                    <div 
                        class="h-full bg-primary transition-all duration-300 ease-out"
                        style="width: {(currentStep / 4) * 100}%"
                    ></div>
                </div>

                <form 
                    method="POST" 
                    action="?/create" 
                    use:enhance={() => {
                        return async ({ update, result }) => {
                            await update();
                            if (result.type === 'success') {
                                showAddAssessmentModal = false;
                                resetForm();
                            }
                        };
                    }}
                    class="flex flex-col min-h-[300px]"
                >
                    <!-- Hidden Inputs for Wizard State -->
                    <input type="hidden" name="title" value={title} />
                    <input type="hidden" name="courseId" value={selectedCourseId} />
                    <input type="hidden" name="date" value={date} />
                    <input type="hidden" name="time" value={time} />
                    <input type="hidden" name="location" value={location} />
                    <input type="hidden" name="weight" value={weight} />
                    <input type="hidden" name="type" value="Assessment" />

                    <div class="flex-1 grid grid-cols-1">
                        {#if currentStep === 1}
                            <div class="space-y-4 col-start-1 row-start-1 w-full" transition:fade={{ duration: 200 }}>
                                <h3 class="text-xl font-semibold">What are you adding?</h3>
                                <div class="space-y-2">
                                    <label for="title" class="text-sm font-medium ml-1">Assessment Title</label>
                                    <input 
                                        type="text" 
                                        name="title_input" 
                                        bind:value={title}
                                        placeholder="e.g. Midterm Exam" 
                                        required 
                                        class="w-full px-4 py-3 rounded-xl bg-surface-foreground/5 border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-lg" 
                                        autofocus
                                    />
                                </div>
                            </div>
                        {:else if currentStep === 2}
                            <div class="space-y-4 col-start-1 row-start-1 w-full" transition:fade={{ duration: 200 }}>
                                <h3 class="text-xl font-semibold">Which course is this for?</h3>
                                <div class="space-y-2">
                                    <label for="courseId" class="text-sm font-medium ml-1">Course</label>
                                    <Select 
                                        name="courseId_input" 
                                        bind:value={selectedCourseId}
                                        required 
                                        placeholder="Select a course"
                                        options={[
                                            ...data.courses.map(c => ({ value: c.id, label: c.name }))
                                        ]}
                                        onchange={handleCourseChange}
                                    />
                                </div>
                            </div>
                        {:else if currentStep === 3}
                            <div class="space-y-4 col-start-1 row-start-1 w-full" transition:fade={{ duration: 200 }}>
                                <h3 class="text-xl font-semibold">When is it due?</h3>
                                <div class="space-y-4">
                                    <div class="space-y-2">
                                        <label for="date" class="text-sm font-medium ml-1">Date</label>
                                        <DatePicker name="date_input" bind:value={date} required placeholder="Select date" />
                                    </div>
                                    <div class="space-y-2">
                                        <label for="time" class="text-sm font-medium ml-1">Time (Optional)</label>
                                        <TimePicker name="time_input" bind:value={time} placeholder="Select time" />
                                    </div>
                                </div>
                            </div>
                        {:else if currentStep === 4}
                            <div class="space-y-4 col-start-1 row-start-1 w-full" transition:fade={{ duration: 200 }}>
                                <h3 class="text-xl font-semibold">Any extra details?</h3>
                                <div class="space-y-4">
                                    <div class="space-y-2">
                                        <label for="location" class="text-sm font-medium ml-1">Location (Optional)</label>
                                        <input type="text" name="location_input" bind:value={location} placeholder="e.g. Room 304" class="w-full px-4 py-2.5 rounded-xl bg-surface-foreground/5 border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" />
                                    </div>
                                    <div class="space-y-2">
                                        <label for="weight" class="text-sm font-medium ml-1">Weight (%) (Optional)</label>
                                        <div class="relative group/weight">
                                            <input 
                                                type="number" 
                                                name="weight_input" 
                                                bind:value={weight} 
                                                placeholder="20" 
                                                min="0" 
                                                max="100" 
                                                class="w-full px-4 py-2.5 rounded-xl bg-surface-foreground/5 border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none [&::-webkit-inner-spin-button]:appearance-none" 
                                            />
                                            <div class="absolute right-1 top-1 bottom-1 flex flex-col gap-0.5">
                                                <button 
                                                    type="button"
                                                    onclick={incrementWeight}
                                                    class="flex-1 px-2 flex items-center justify-center bg-surface-foreground/5 hover:bg-primary hover:text-white rounded-md transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3 h-3">
                                                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                                                    </svg>
                                                </button>
                                                <button 
                                                    type="button"
                                                    onclick={decrementWeight}
                                                    class="flex-1 px-2 flex items-center justify-center bg-surface-foreground/5 hover:bg-primary hover:text-white rounded-md transition-colors"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-3 h-3">
                                                        <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        {/if}
                    </div>

                    <div class="flex justify-between gap-3 mt-8 pt-4 border-t border-border/50">
                        <button 
                            type="button" 
                            class="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                            onclick={prevStep}
                            disabled={currentStep === 1}
                        >
                            Back
                        </button>
                        
                        {#if currentStep < 4}
                            <button 
                                type="button" 
                                class="px-6 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/25 flex items-center gap-2"
                                onclick={nextStep}
                            >
                                Next
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </button>
                        {:else}
                            <button 
                                type="submit" 
                                class="px-8 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/25 flex items-center gap-2"
                            >
                                {#if loading}
                                    <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Adding...
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

{#if data.user && !data.user.hasSeenAssessmentsTour}
    <Tour 
        title="Track Your Assessments 📝" 
        description="Keep track of all your upcoming exams, assignments, and quizzes. Add new assessments, see what's coming up, and record your grades when you're done!"
        action="?/dismissTour"
    />
{/if}
