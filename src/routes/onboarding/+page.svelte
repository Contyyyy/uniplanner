<script>
    import { enhance } from '$app/forms';
    import { fade, fly } from 'svelte/transition';

    let { form } = $props();
    let courses = $state([{ id: 1, color: '#0d9488' }]);
    let loading = $state(false);

    function addCourse() {
        courses = [...courses, { id: Date.now(), color: '#0d9488' }];
    }

    function removeCourse(id) {
        if (courses.length > 1) {
            courses = courses.filter(c => c.id !== id);
        }
    }
</script>

<div class="min-h-screen flex items-center justify-center p-4 animate-fade-in-up">
    <div class="glass-panel w-full max-w-2xl p-8 rounded-[2.5rem] relative overflow-hidden">
        <!-- Decorative background elements -->
        <div class="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-accent/10 rounded-full blur-3xl"></div>

        <div class="relative z-10">
            <div class="text-center mb-10">
                <h1 class="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-3">Let's get you set up!</h1>
                <p class="text-muted-foreground text-lg">Add your courses so we can personalize your experience.</p>
            </div>

            <form 
                method="POST" 
                action="?/submitCourses" 
                use:enhance={() => {
                    loading = true;
                    return async ({ update }) => {
                        await update();
                        loading = false;
                    };
                }}
                class="space-y-6"
            >
                <div class="space-y-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                    {#each courses as course, i (course.id)}
                        <div class="flex gap-4 items-start p-4 rounded-2xl bg-surface-foreground/5 border border-border group" in:fly={{ y: 20, duration: 300, delay: i * 50 }} out:fade>
                            <div class="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="space-y-2">
                                    <label for="name-{course.id}" class="text-sm font-medium ml-1">Course Name</label>
                                    <input 
                                        type="text" 
                                        name="name" 
                                        id="name-{course.id}"
                                        placeholder="e.g. Calculus I" 
                                        required 
                                        class="w-full px-4 py-2.5 rounded-xl bg-white/50 border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" 
                                    />
                                </div>
                                <div class="space-y-2">
                                    <label for="code-{course.id}" class="text-sm font-medium ml-1">Course Code</label>
                                    <input 
                                        type="text" 
                                        name="code" 
                                        id="code-{course.id}"
                                        placeholder="e.g. MATH 101" 
                                        required 
                                        class="w-full px-4 py-2.5 rounded-xl bg-white/50 border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" 
                                    />
                                </div>
                            </div>
                            
                            <div class="space-y-2">
                                <label for="color-{course.id}" class="text-sm font-medium ml-1">Color</label>
                                <div class="flex items-center gap-2">
                                    <input 
                                        type="color" 
                                        name="color" 
                                        id="color-{course.id}"
                                        value={course.color} 
                                        class="w-[46px] h-[46px] rounded-xl cursor-pointer bg-transparent border-0 p-0 overflow-hidden" 
                                    />
                                    {#if courses.length > 1}
                                        <button 
                                            type="button" 
                                            onclick={() => removeCourse(course.id)}
                                            class="w-[46px] h-[46px] flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                                            title="Remove course"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                            </svg>
                                        </button>
                                    {/if}
                                </div>
                            </div>
                        </div>
                    {/each}
                </div>

                <div class="flex justify-center">
                    <button 
                        type="button" 
                        onclick={addCourse}
                        class="px-6 py-2 rounded-xl bg-surface-foreground/5 hover:bg-surface-foreground/10 text-sm font-semibold transition-colors flex items-center gap-2 border border-dashed border-border hover:border-primary/50 hover:text-primary"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        Add Another Course
                    </button>
                </div>

                <div class="pt-6 border-t border-border">
                    <button 
                        type="submit" 
                        disabled={loading}
                        class="w-full py-4 bg-primary text-white font-bold text-lg rounded-2xl hover:bg-primary/90 transition-all hover:scale-[1.02] shadow-xl shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {#if loading}
                            <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Saving...
                        {:else}
                            Finish Setup 🚀
                        {/if}
                    </button>
                </div>
            </form>
            
            {#if form?.message}
                <p class="text-rose-500 text-center mt-4 font-medium">{form.message}</p>
            {/if}
        </div>
    </div>
</div>
