<script>
    import { enhance } from '$app/forms';
    import DatePicker from '$lib/components/DatePicker.svelte';
    import { fade, scale } from 'svelte/transition';
    import { onMount, onDestroy } from 'svelte';
    import { pageActions } from '$lib/stores/pageActions';
    import Tour from '$lib/components/Tour.svelte';
    
    let { data, form } = $props();
    let loading = $state(false);
    let dueDate = $state('');
    let showModal = $state(false);

    onMount(() => {
        if (data.user) {
            pageActions.set([
                {
                    label: 'Add Task',
                    onClick: () => showModal = true,
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
            <h1 class="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Tasks</h1>
            <p class="text-muted-foreground">Manage your to-dos and assignments.</p>
        </div>
        {#if data.user}
            <button 
                onclick={() => showModal = true}
                class="hidden md:flex px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/25 items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Task
            </button>
        {/if}
    </header>

    {#if !data.user}
        <div class="glass-panel p-8 rounded-2xl text-center">
            <p class="text-lg font-medium mb-4">Please log in to manage your tasks</p>
            <a href="/demo/lucia/login" class="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all">Log In</a>
        </div>
    {:else}
        <!-- Task List -->
        <div class="space-y-4">
            {#if data.tasks.length === 0}
                <div class="glass-card p-12 rounded-2xl text-center flex flex-col items-center justify-center text-muted-foreground">
                    <div class="w-16 h-16 bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 rounded-full flex items-center justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <p class="text-lg font-medium">All caught up!</p>
                    <p>No pending tasks found.</p>
                </div>
            {:else}
                {#each data.tasks as task}
                    <div class="glass-card p-4 rounded-xl flex items-center justify-between group">
                        <div class="flex items-center gap-4">
                            <form method="POST" action="?/toggle" use:enhance>
                                <input type="hidden" name="id" value={task.id} />
                                <input type="hidden" name="completed" value={!task.completed} />
                                <button type="submit" class={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${task.completed ? 'bg-teal-500 border-teal-500 text-white' : 'border-muted-foreground hover:border-primary'}`}>
                                    {#if task.completed}
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                                            <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                                        </svg>
                                    {/if}
                                </button>
                            </form>
                            <div class="flex-1 min-w-0">
                                <div class="flex items-center gap-2">
                                    <h3 class="font-semibold text-lg truncate {task.completed ? 'line-through text-muted-foreground' : ''}">{task.title}</h3>
                                    {#if task.isPrivate}
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 text-muted-foreground" title="Private">
                                            <path fill-rule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clip-rule="evenodd" />
                                        </svg>
                                    {/if}
                                </div>
                                {#if task.description}
                                    <p class="text-muted-foreground text-sm truncate">{task.description}</p>
                                {/if}
                                {#if task.dueDate}
                                    <p class="text-xs text-muted-foreground flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3">
                                            <path fill-rule="evenodd" d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z" clip-rule="evenodd" />
                                        </svg>
                                        {new Date(task.dueDate).toLocaleDateString()}
                                    </p>
                                {/if}
                            </div>
                        </div>
                        <form method="POST" action="?/delete" use:enhance>
                            <input type="hidden" name="id" value={task.id} />
                            <button type="submit" class="text-muted-foreground hover:text-rose-500 p-2 rounded-lg hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100" aria-label="Delete task">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                            </button>
                        </form>
                    </div>
                {/each}
            {/if}
        </div>
    {/if}

    <!-- Add Task Modal -->
    {#if showModal}
        <div class="fixed inset-0 z-50 flex items-start justify-center p-4 pt-24">
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div 
                class="absolute inset-0 bg-black/50 backdrop-blur-sm" 
                transition:fade
                onclick={() => showModal = false}
            ></div>
            
            <div class="relative z-10 glass-panel w-full max-w-lg p-6 rounded-2xl shadow-2xl max-h-[85vh] overflow-y-auto" transition:scale>
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold">Add New Task</h2>
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
                            loading = false;
                            if (result.type === 'success') {
                                showModal = false;
                                dueDate = '';
                            }
                        };
                    }} 
                    class="space-y-6"
                >
                    <div class="space-y-2">
                        <label for="title" class="text-sm font-medium ml-1">Task Title</label>
                        <input type="text" name="title" placeholder="e.g. Read Chapter 4" required class="w-full px-4 py-2.5 rounded-xl bg-surface-foreground/5 border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" />
                    </div>
                    <div class="space-y-2">
                        <label for="dueDate" class="text-sm font-medium ml-1">Due Date</label>
                        <DatePicker name="dueDate" bind:value={dueDate} placeholder="Select date" />
                    </div>
                    
                    <div class="flex justify-end gap-3 pt-2">
                        <button 
                            type="button" 
                            onclick={() => showModal = false}
                            class="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            class="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
                        >
                            {#if loading}
                                <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Adding...
                            {:else}
                                Add Task
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
</div>

{#if data.user && !data.user.hasSeenTour}
    <Tour 
        title="Welcome to Tasks! 📝" 
        description="This is where you can manage all your assignments, readings, and to-dos. Add a new task using the button above, set due dates, and mark them as complete when you're done. Keep your academic life organized!"
    />
{/if}
