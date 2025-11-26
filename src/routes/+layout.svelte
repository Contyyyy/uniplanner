<script>
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
    import Sidebar from '$lib/components/Sidebar.svelte';
    import MobileNav from '$lib/components/MobileNav.svelte';
    import MobileActionButtons from '$lib/components/MobileActionButtons.svelte';
    import { page } from '$app/stores';

	import { onMount } from 'svelte';

	let { children, data } = $props();

	onMount(() => {
		console.log('App mounted and hydrated');
	});

    let showSidebar = $derived(
        $page.url.pathname !== '/' && 
        !$page.url.pathname.startsWith('/demo/lucia/login') &&
        !$page.url.pathname.startsWith('/demo/lucia/register')
    );
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <title>UniPlanner</title>
</svelte:head>

<div class="flex flex-col md:flex-row min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground {showSidebar ? 'pb-20 md:pb-0' : ''}">
    {#if showSidebar}
        <!-- Mobile Profile Link (Hidden on Schedule and Profile pages) -->
        {#if !$page.url.pathname.startsWith('/schedule') && $page.url.pathname !== '/profile'}
            <a href="/profile" class="md:hidden fixed top-6 right-6 z-50 w-10 h-10 rounded-full bg-surface/90 backdrop-blur-xl border border-white/20 shadow-2xl flex items-center justify-center overflow-hidden transition-all active:scale-95 hover:scale-105 ring-1 ring-black/5">
                {#if data.user && data.user.profilePicture && data.user.profilePicture.length > 5}
                    <img src={data.user.profilePicture} alt="Profile" class="w-full h-full object-cover" />
                {:else if data.user && data.user.profilePicture}
                    <span class="text-base font-bold text-primary">{data.user.profilePicture}</span>
                {:else if data.user}
                    <span class="text-base font-bold text-primary">{data.user.username.slice(0, 2).toUpperCase()}</span>
                {:else}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-muted-foreground">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                {/if}
            </a>
        {/if}

        <Sidebar {data} />
    {/if}

    <main class="flex-1 {showSidebar ? 'p-4 md:p-8' : ''} overflow-y-auto w-full">
        {@render children()}
    </main>

    {#if showSidebar}
        <MobileActionButtons />
        <MobileNav />
    {/if}
</div>
