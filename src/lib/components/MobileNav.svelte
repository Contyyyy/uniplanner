<script>
    import { page } from '$app/stores';
    
    const links = [
        { href: '/dashboard', label: 'Home', icon: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25', isHome: true },
        { href: '/schedule', label: 'Schedule', icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5' },
        { href: '/tasks', label: 'Tasks', icon: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
        { href: '/assessments', label: 'Exams', icon: 'M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.499 5.24 50.552 50.552 0 00-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5' },
        { href: '/progress', label: 'Progress', icon: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z' }
    ];
</script>

<nav class="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-t border-border pb-safe">
    <div class="flex justify-around items-center h-16 px-1">
        {#each links as link}
            {@const isActive = $page.url.pathname === link.href || ($page.url.pathname.startsWith(link.href + '/') && link.href !== '/')}
            
            <a 
                href={link.href} 
                class="flex-1 flex flex-col items-center justify-center gap-1 h-full transition-colors duration-200 group relative"
            >
                {#if isActive}
                    <span class="absolute -top-[1px] w-8 h-[3px] bg-primary rounded-b-full shadow-[0_1px_8px] shadow-primary/50"></span>
                {/if}
                
                <div class="p-1 rounded-xl transition-colors {isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width={isActive ? "2.5" : "1.5"} stroke="currentColor" class="w-6 h-6">
                        <path stroke-linecap="round" stroke-linejoin="round" d={link.icon} />
                    </svg>
                </div>
                <span class="text-[10px] font-medium {isActive ? 'text-primary font-bold' : 'text-muted-foreground group-hover:text-foreground'}">
                    {link.label}
                </span>
            </a>
        {/each}
    </div>
</nav>

<style>
    /* Safe area padding for iPhone home indicator */
    .pb-safe {
        padding-bottom: env(safe-area-inset-bottom, 20px);
    }
</style>
