<script>
    import { page } from '$app/stores';
    import { slide, fade, scale } from 'svelte/transition';
    import { enhance } from '$app/forms';


    let { data } = $props();
    let isOpen = $state(false);
    let showLogoutModal = $state(false);

    const links = [
        { href: '/dashboard', label: 'Dashboard', icon: 'M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z' },
        { href: '/tasks', label: 'Tasks', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { href: '/schedule', label: 'Schedule', icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5' },
        { href: '/assessments', label: 'Assessments', icon: 'M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.499 5.24 50.552 50.552 0 00-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5' },

        { href: '/progress', label: 'Progress', icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z' }
    ];
</script>



<!-- Sidebar -->
<aside class="hidden md:block fixed md:sticky md:top-0 inset-y-0 left-0 z-[40] w-64 md:h-screen bg-background/50 backdrop-blur-sm">
    <div class="h-full flex flex-col py-8 px-6">
        <!-- Header -->
        <div class="mb-10 px-2">
            <span class="font-outfit font-bold text-2xl tracking-tight text-foreground">UniPlanner</span>
        </div>

        <!-- Navigation -->
        <div class="flex-1 space-y-6">
            {#each links as link}
                <a 
                    href={link.href} 
                    class="flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-200 group relative {$page.url.pathname === link.href ? 'bg-teal-500/10 text-teal-600 font-semibold' : 'text-muted-foreground hover:text-foreground hover:bg-surface-foreground/5'}"
                    onclick={() => isOpen = false}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5 transition-transform group-hover:scale-110 duration-300">
                        <path stroke-linecap="round" stroke-linejoin="round" d={link.icon} />
                    </svg>
                    <span class="text-sm">{link.label}</span>
                </a>
            {/each}
        </div>

        <!-- Footer (Profile & Logout) -->
        <div class="mt-auto pt-4 flex items-center justify-between gap-2">
            <a href="/profile" class="flex items-center gap-3 p-2 rounded-full hover:bg-surface-foreground/5 transition-colors group flex-1 min-w-0">
                <div class="w-8 h-8 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-600 font-bold text-xs overflow-hidden ring-1 ring-transparent group-hover:ring-teal-500/30 transition-all">
                    {#if data.user && data.user.profilePicture && data.user.profilePicture.length > 5}
                        <img src={data.user.profilePicture} alt="Profile" class="w-full h-full object-cover" />
                    {:else if data.user && data.user.profilePicture}
                        {data.user.profilePicture}
                    {:else if data.user}
                        {data.user.username.slice(0, 2).toUpperCase()}
                    {:else}
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                    {/if}
                </div>
                <div class="flex-1 min-w-0">
                    <p class="font-bold text-sm truncate text-foreground">{data.user ? data.user.username : 'Guest'}</p>
                </div>
            </a>

            <button 
                class="p-2 rounded-full text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all" 
                title="Sign Out"
                onclick={() => showLogoutModal = true}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
            </button>
        </div>
    </div>
</aside>

<!-- Logout Confirmation Modal -->
{#if showLogoutModal}
    <div class="fixed inset-0 z-[100] flex items-center justify-center p-4" transition:fade={{ duration: 200 }}>
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <!-- svelte-ignore a11y_no_static_element_interactions -->
        <div 
            class="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onclick={() => showLogoutModal = false}
        ></div>
        <div 
            class="relative w-full max-w-sm bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden"
            transition:scale={{ duration: 200, start: 0.95 }}
        >
            <div class="p-6 space-y-4">
                <div class="flex items-center gap-3 text-rose-500">
                    <div class="p-2 bg-rose-500/10 rounded-full">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                        </svg>
                    </div>
                    <h3 class="text-lg font-bold text-foreground">Sign Out?</h3>
                </div>
                
                <p class="text-muted-foreground">
                    Are you sure you want to sign out of your account?
                </p>

                <div class="flex items-center justify-end gap-3 pt-2">
                    <button 
                        class="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        onclick={() => showLogoutModal = false}
                    >
                        Cancel
                    </button>
                    <form 
                        method="POST" 
                        action="/profile?/logout" 
                        use:enhance={() => {
                            return async ({ update }) => {
                                await update();
                                showLogoutModal = false;
                            };
                        }}
                    >
                        <button 
                            type="submit"
                            class="px-4 py-2 text-sm font-medium bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20"
                        >
                            Sign Out
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
{/if}


