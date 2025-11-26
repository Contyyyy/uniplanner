<script>
    import { enhance } from '$app/forms';
    import { fade } from 'svelte/transition';

    let { data } = $props();
    let loading = $state(false);
    let showAddResource = $state(false);
</script>

<div class="max-w-4xl mx-auto space-y-8 animate-fade-in-up pb-12">
    {#if !data.course}
        <div class="text-center py-20">
            <h1 class="text-2xl font-bold text-muted-foreground">Course not found</h1>
            <a href="/schedule" class="text-primary hover:underline mt-4 block">Back to Schedule</a>
        </div>
    {:else}
        <!-- Header -->
        <header class="relative overflow-hidden rounded-[2.5rem] p-10 text-white shadow-xl" style="background-color: {data.course.color}">
            <div class="relative z-10">
                <div class="flex items-center gap-4 mb-4">
                    <a href="/schedule" class="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors backdrop-blur-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                        </svg>
                    </a>
                    <span class="px-3 py-1 bg-white/20 rounded-lg text-sm font-medium backdrop-blur-sm">{data.course.code || 'Class'}</span>
                </div>
                <h1 class="text-4xl md:text-5xl font-bold mb-2 tracking-tight">{data.course.name}</h1>
                <div class="flex flex-wrap gap-6 text-white/90 text-lg">
                    <div class="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 opacity-80">
                            <path fill-rule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.62.829.799 1.654 1.38 2.274 1.766a11.121 11.121 0 00.757.432l.282.14.018.009.006.002zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                        </svg>
                        {data.course.location || 'No location'}
                    </div>
                    <div class="flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 opacity-80">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clip-rule="evenodd" />
                        </svg>
                        {data.course.dayOfWeek || 'Flexible'} • {data.course.startTime} - {data.course.endTime}
                    </div>
                </div>
            </div>
            <!-- Abstract Pattern -->
            <div class="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </header>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Resources Section -->
            <div class="lg:col-span-3 space-y-6">

                <div class="glass-card p-6 rounded-3xl">
                    <div class="flex items-center justify-between mb-6">
                        <h2 class="text-xl font-bold flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-accent">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                            </svg>
                            Resources
                        </h2>
                        <button 
                            onclick={() => showAddResource = !showAddResource}
                            class="p-2 hover:bg-surface-foreground/10 rounded-lg transition-colors text-primary"
                            title="Add Resource"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                        </button>
                    </div>

                    {#if showAddResource}
                        <form 
                            method="POST" 
                            action="?/addResource" 
                            use:enhance={() => {
                                return async ({ update }) => {
                                    await update();
                                    showAddResource = false;
                                };
                            }}
                            class="mb-6 p-4 bg-surface-foreground/5 rounded-xl space-y-3"
                            transition:fade
                        >
                            <input type="text" name="title" placeholder="Title (e.g. Syllabus)" required class="w-full px-3 py-2 rounded-lg bg-surface border border-border focus:border-primary outline-none text-sm" />
                            <input type="url" name="url" placeholder="URL (https://...)" required class="w-full px-3 py-2 rounded-lg bg-surface border border-border focus:border-primary outline-none text-sm" />
                            <div class="flex justify-end gap-2">
                                <button type="button" onclick={() => showAddResource = false} class="text-xs font-medium text-muted-foreground hover:text-foreground px-2 py-1">Cancel</button>
                                <button type="submit" class="text-xs font-bold text-primary hover:text-primary/80 px-2 py-1">Add</button>
                            </div>
                        </form>
                    {/if}

                    <div class="space-y-3">
                        {#if data.resources.length === 0}
                            <p class="text-sm text-muted-foreground text-center py-4">No resources added yet.</p>
                        {:else}
                            {#each data.resources as resource}
                                <div class="flex items-center justify-between group p-3 rounded-xl hover:bg-surface-foreground/5 transition-colors border border-transparent hover:border-border">
                                    <a href={resource.url} target="_blank" rel="noopener noreferrer" class="flex items-center gap-3 flex-1 min-w-0">
                                        <div class="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                                            </svg>
                                        </div>
                                        <span class="font-medium truncate text-sm">{resource.title}</span>
                                    </a>
                                    <form method="POST" action="?/deleteResource" use:enhance>
                                        <input type="hidden" name="id" value={resource.id} />
                                        <button type="submit" class="p-1.5 text-muted-foreground hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all" title="Delete">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                            </svg>
                                        </button>
                                    </form>
                                </div>
                            {/each}
                        {/if}
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>
