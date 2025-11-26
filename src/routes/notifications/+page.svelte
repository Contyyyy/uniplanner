<script>
    import { enhance } from '$app/forms';
    import { fade } from 'svelte/transition';

    let { data } = $props();
</script>

<div class="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
    <header class="pr-12 md:pr-0">
        <h1 class="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Notifications</h1>
        <p class="text-muted-foreground mt-1">Stay updated with your shared schedules</p>
    </header>

    <div class="space-y-4">
        {#if data.notifications.length === 0}
            <div class="glass-panel p-12 rounded-2xl text-center text-muted-foreground">
                <div class="w-16 h-16 bg-surface-foreground/5 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 opacity-50">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                    </svg>
                </div>
                <p class="text-lg font-medium">No notifications yet</p>
                <p class="text-sm opacity-70">When someone shares their schedule, it will appear here.</p>
            </div>
        {:else}
            {#each data.notifications as notification (notification.id)}
                <div 
                    class="glass-card p-6 rounded-xl flex items-start gap-4 transition-all hover:scale-[1.01] {notification.read ? 'opacity-70' : 'border-l-4 border-l-primary'}"
                    transition:fade
                >
                    <div class="p-3 rounded-full {notification.type === 'schedule_share' ? 'bg-primary/10 text-primary' : 'bg-surface-foreground/5'}">
                        {#if notification.type === 'schedule_share'}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                            </svg>
                        {:else}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                            </svg>
                        {/if}
                    </div>
                    
                    <div class="flex-1 min-w-0">
                        <div class="flex items-start justify-between gap-4">
                            <div>
                                <h3 class="font-bold text-lg">
                                    {#if notification.type === 'schedule_share'}
                                        Schedule Shared
                                    {:else}
                                        New Notification
                                    {/if}
                                </h3>
                                <p class="text-muted-foreground mt-1">
                                    {#if notification.type === 'schedule_share' && notification.data}
                                        {@const data = JSON.parse(notification.data)}
                                        <span class="font-medium text-foreground">{data.senderName}</span> shared their schedule for the week of <span class="font-medium text-foreground">{new Date(data.weekStart).toLocaleDateString()}</span>.
                                    {:else}
                                        You have a new notification.
                                    {/if}
                                </p>
                                <p class="text-xs text-muted-foreground/60 mt-2">
                                    {new Date(notification.createdAt).toLocaleDateString()} at {new Date(notification.createdAt).toLocaleTimeString()}
                                </p>
                            </div>
                            
                            {#if !notification.read}
                                <form method="POST" action="?/markRead" use:enhance>
                                    <input type="hidden" name="id" value={notification.id} />
                                    <button 
                                        type="submit"
                                        class="p-2 text-muted-foreground hover:text-primary transition-colors"
                                        title="Mark as read"
                                    >
                                        <div class="w-2.5 h-2.5 bg-primary rounded-full"></div>
                                    </button>
                                </form>
                            {/if}
                        </div>

                        {#if notification.type === 'schedule_share' && notification.data}
                            {@const data = JSON.parse(notification.data)}
                            <div class="mt-4 flex gap-3">
                                <a 
                                    href="/schedule/shared/{data.shareId}" 
                                    class="px-4 py-2 bg-primary text-white text-sm font-semibold rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center gap-2"
                                >
                                    View Schedule
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </a>
                            </div>
                        {/if}
                    </div>
                </div>
            {/each}
        {/if}
    </div>
</div>
