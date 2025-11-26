<script>
    import { enhance } from '$app/forms';
    let { data, form } = $props();
    let loading = $state(false);
</script>

<div class="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
    <header class="flex items-center justify-between">
        <div>
            <h1 class="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Friends</h1>
            <p class="text-muted-foreground mt-1">Connect and share schedules</p>
        </div>
    </header>

    {#if !data.user}
        <div class="glass-panel p-8 rounded-2xl text-center">
            <p class="text-lg font-medium mb-4">Please log in to manage friends</p>
            <a href="/demo/lucia/login" class="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all">Log In</a>
        </div>
    {:else}
        <!-- Add Friend -->
        <div class="glass-panel p-6 rounded-2xl">
            <h2 class="text-lg font-semibold mb-4">Add Friend</h2>
            <form 
                method="POST" 
                action="?/sendRequest" 
                use:enhance={() => {
                    loading = true;
                    return async ({ update }) => {
                        await update();
                        loading = false;
                    };
                }} 
                class="flex gap-4 items-end"
            >
                <div class="flex-1 space-y-2">
                    <label for="username" class="text-sm font-medium ml-1">Username</label>
                    <input type="text" name="username" placeholder="Enter username" required class="w-full px-4 py-2.5 rounded-xl bg-surface-foreground/5 border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" />
                </div>
                <button 
                    type="submit" 
                    disabled={loading}
                    class="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all hover:scale-105 shadow-lg shadow-primary/25 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                    {#if loading}Adding...{:else}Send Request{/if}
                </button>
            </form>
            {#if form?.message}
                <p class="text-rose-500 text-sm mt-2 font-medium">{form.message}</p>
            {/if}
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <!-- Friend Requests -->
            <div class="space-y-4">
                <h2 class="text-xl font-bold">Requests</h2>
                {#if data.incomingRequests.length === 0 && data.outgoingRequests.length === 0}
                    <div class="glass-card p-6 rounded-xl text-center text-muted-foreground text-sm">
                        No pending requests
                    </div>
                {/if}

                {#each data.incomingRequests as req}
                    <div class="glass-card p-4 rounded-xl flex items-center justify-between">
                        <div>
                            <p class="font-bold">{req.username}</p>
                            <p class="text-xs text-muted-foreground">Incoming request</p>
                        </div>
                        <div class="flex gap-2">
                            <form method="POST" action="?/acceptRequest" use:enhance>
                                <input type="hidden" name="id" value={req.id} />
                                <button class="p-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg transition-colors" title="Accept">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                    </svg>
                                </button>
                            </form>
                            <form method="POST" action="?/rejectRequest" use:enhance>
                                <input type="hidden" name="id" value={req.id} />
                                <button class="p-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-lg transition-colors" title="Reject">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    </div>
                {/each}

                {#each data.outgoingRequests as req}
                    <div class="glass-card p-4 rounded-xl flex items-center justify-between opacity-75">
                        <div>
                            <p class="font-bold">{req.username}</p>
                            <p class="text-xs text-muted-foreground">Outgoing request</p>
                        </div>
                        <form method="POST" action="?/removeFriend" use:enhance>
                            <input type="hidden" name="id" value={req.id} />
                            <button class="text-xs text-muted-foreground hover:text-rose-500 transition-colors">Cancel</button>
                        </form>
                    </div>
                {/each}
            </div>

            <!-- Friends List -->
            <div class="space-y-4">
                <h2 class="text-xl font-bold">Your Friends</h2>
                {#if data.friends.length === 0}
                    <div class="glass-card p-6 rounded-xl text-center text-muted-foreground text-sm">
                        No friends yet. Add someone!
                    </div>
                {:else}
                    {#each data.friends as friend}
                        <div class="glass-card p-4 rounded-xl flex items-center justify-between group">
                            <div class="flex items-center gap-3">
                                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                                    {friend.username[0].toUpperCase()}
                                </div>
                                <div>
                                    <p class="font-bold">{friend.username}</p>
                                    <a href="/friends/{friend.username}" class="text-xs text-primary hover:underline">View Profile</a>
                                </div>
                            </div>
                            <form method="POST" action="?/removeFriend" use:enhance>
                                <input type="hidden" name="id" value={friend.id} />
                                <button class="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100" title="Remove Friend">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M22 10.5h-6m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
                                    </svg>
                                </button>
                            </form>
                        </div>
                    {/each}
                {/if}
            </div>
        </div>
    {/if}
</div>
