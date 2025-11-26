<script>
    import { enhance } from '$app/forms';
    import { invalidateAll } from '$app/navigation';
    import { fade, scale } from 'svelte/transition';

    let { data, form } = $props();
    let loading = $state(false);
    let fileInput;
    let showCourseModal = $state(false);
    let editingCourse = $state(null);
    let courseToDelete = $state(null);
    let showDeleteAccountModal = $state(false);

    function handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                // Submit the form automatically when file is selected
                const formData = new FormData();
                formData.append('profilePicture', e.target.result);
                // We need to trigger the form submission manually or use a hidden input
                // Let's use the hidden input approach
                document.getElementById('profilePictureInput').value = e.target.result;
                document.getElementById('uploadForm').requestSubmit();
            };
            reader.readAsDataURL(file);
        }
    }
</script>

<div class="max-w-2xl mx-auto space-y-8 animate-fade-in-up">
    <header>
        <h1 class="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Profile</h1>
        <p class="text-muted-foreground mt-1">Manage your account settings</p>
    </header>

    <div class="glass-panel p-8 rounded-2xl space-y-8">
        <div class="flex flex-col items-center justify-center space-y-4">
            <div class="relative group">
                <div class="w-32 h-32 rounded-full overflow-hidden border-4 border-surface shadow-xl bg-surface-foreground/5 flex items-center justify-center">
                    {#if data.user.profilePicture && data.user.profilePicture.length > 5}
                         <!-- Legacy support for old image URLs -->
                        <img src={data.user.profilePicture} alt="Profile" class="w-full h-full object-cover" />
                    {:else if data.user.profilePicture}
                        <span class="text-4xl font-bold text-primary">{data.user.profilePicture}</span>
                    {:else}
                        <span class="text-4xl font-bold text-primary">{data.user.username.slice(0, 2).toUpperCase()}</span>
                    {/if}
                </div>
            </div>
            <div class="text-center">
                <h2 class="text-2xl font-bold">{data.user.username}</h2>
            </div>
        </div>




    </div>

    <!-- My Courses Section -->
    <div class="glass-panel p-8 rounded-2xl space-y-6">
        <div class="flex items-center justify-between">
            <h2 class="text-2xl font-bold">My Courses</h2>
            <button 
                onclick={() => {
                    editingCourse = null;
                    showCourseModal = true;
                }}
                class="px-4 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add Course
            </button>
        </div>

        {#if data.courses && data.courses.length > 0}
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {#each data.courses as course}
                    <div class="p-4 rounded-xl border border-border bg-surface-foreground/5 flex items-center justify-between group">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shadow-sm" style="background-color: {course.color}">
                                {course.code.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                                <h3 class="font-bold">{course.name}</h3>
                                <p class="text-xs text-muted-foreground">{course.code}</p>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                            <button 
                                onclick={() => {
                                    editingCourse = course;
                                    showCourseModal = true;
                                }}
                                class="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                                title="Edit"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                </svg>
                            </button>
                            <button 
                                onclick={() => courseToDelete = course}
                                class="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all" 
                                title="Delete"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                                </svg>
                            </button>
                        </div>
                    </div>
                {/each}
            </div>
        {:else}
            <div class="text-center py-8 text-muted-foreground">
                <p>No courses added yet.</p>
            </div>
        {/if}
    </div>

    <div class="glass-panel p-8 rounded-2xl space-y-8 border-rose-500/20">
        <div>
            <h3 class="text-lg font-bold text-rose-500 mb-4">Danger Zone</h3>
            <form action="/logout" method="POST" use:enhance>
                <button 
                    type="submit"
                    class="w-full px-6 py-3 bg-amber-500/10 text-amber-600 font-semibold rounded-xl hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center gap-2 mb-3"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                    Sign Out
                </button>
            </form>

            <button 
                onclick={() => showDeleteAccountModal = true}
                class="w-full px-6 py-3 bg-rose-500/10 text-rose-600 font-semibold rounded-xl hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center gap-2"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
                Delete Account
            </button>
        </div>
    </div>

    <!-- Course Modal -->
    {#if showCourseModal}
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div 
                class="absolute inset-0 bg-black/50 backdrop-blur-sm" 
                transition:fade
                onclick={() => showCourseModal = false}
            ></div>

            <div class="relative z-10 glass-panel p-6 rounded-2xl w-full max-w-md shadow-2xl" transition:scale>
                <h2 class="text-xl font-bold mb-4">{editingCourse ? 'Edit Course' : 'Add Course'}</h2>
                
                <form 
                    method="POST" 
                    action={editingCourse ? '?/updateCourse' : '?/createCourse'}
                    use:enhance={() => {
                        return async ({ update, result }) => {
                            await update();
                            if (result.type === 'success') {
                                showCourseModal = false;
                                editingCourse = null;
                            }
                        };
                    }}
                    class="space-y-4"
                >
                    {#if editingCourse}
                        <input type="hidden" name="id" value={editingCourse.id} />
                    {/if}

                    <div class="space-y-2">
                        <label for="name" class="text-sm font-medium ml-1">Course Name</label>
                        <input 
                            type="text" 
                            name="name" 
                            value={editingCourse?.name || ''}
                            placeholder="e.g. Advanced Calculus" 
                            required 
                            class="w-full px-4 py-2 rounded-xl bg-surface-foreground/5 border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" 
                        />
                    </div>

                    <div class="space-y-2">
                        <label for="code" class="text-sm font-medium ml-1">Course Code</label>
                        <input 
                            type="text" 
                            name="code" 
                            value={editingCourse?.code || ''}
                            placeholder="e.g. MAT301" 
                            required 
                            class="w-full px-4 py-2 rounded-xl bg-surface-foreground/5 border border-border focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none" 
                        />
                    </div>

                    <div class="space-y-2">
                        <label for="color" class="text-sm font-medium ml-1">Color</label>
                        <div class="flex flex-wrap gap-2">
                            {#each ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#f43f5e'] as color}
                                <label class="cursor-pointer relative">
                                    <input 
                                        type="radio" 
                                        name="color" 
                                        value={color} 
                                        class="peer sr-only"
                                        checked={editingCourse ? editingCourse.color === color : color === '#0d9488'}
                                    />
                                    <div class="w-8 h-8 rounded-full transition-transform hover:scale-110 peer-checked:scale-110 peer-checked:ring-2 peer-checked:ring-offset-2 peer-checked:ring-primary" style="background-color: {color}"></div>
                                </label>
                            {/each}
                        </div>
                    </div>

                    <div class="flex justify-end gap-3 mt-6">
                        <button 
                            type="button" 
                            onclick={() => showCourseModal = false}
                            class="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            class="px-6 py-2 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25"
                        >
                            {editingCourse ? 'Save Changes' : 'Add Course'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    {/if}

    <!-- Delete Course Confirmation Modal -->
    {#if courseToDelete}
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4" transition:fade={{ duration: 200 }}>
            <div 
                class="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onclick={() => courseToDelete = null}
                role="button"
                tabindex="0"
                onkeydown={(e) => e.key === 'Escape' && (courseToDelete = null)}
            ></div>
            <div 
                class="relative w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden"
                transition:scale={{ duration: 200, start: 0.95 }}
            >
                <div class="p-6 space-y-4">
                    <div class="flex items-center gap-3 text-rose-500">
                        <div class="p-2 bg-rose-500/10 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <h3 class="text-lg font-bold text-foreground">Delete Course?</h3>
                    </div>
                    
                    <div class="space-y-2">
                        <p class="text-muted-foreground">
                            Are you sure you want to delete <span class="font-semibold text-foreground">{courseToDelete.name}</span>?
                        </p>
                        <div class="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                            <p class="text-sm text-amber-600 dark:text-amber-500 font-medium">
                                Warning: This action will permanently remove this course and all associated schedule items from your calendar.
                            </p>
                        </div>
                    </div>

                    <div class="flex items-center justify-end gap-3 pt-2">
                        <button 
                            class="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            onclick={() => courseToDelete = null}
                        >
                            Cancel
                        </button>
                        <form 
                            method="POST" 
                            action="?/deleteCourse" 
                            use:enhance={() => {
                                return async ({ result }) => {
                                    if (result.type === 'success') {
                                        courseToDelete = null;
                                        await invalidateAll();
                                    }
                                };
                            }}
                        >
                            <input type="hidden" name="id" value={courseToDelete.id} />
                            <button 
                                type="submit"
                                class="px-4 py-2 text-sm font-medium bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20"
                            >
                                Delete Course
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    {/if}
    <!-- Delete Account Confirmation Modal -->
    {#if showDeleteAccountModal}
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4" transition:fade={{ duration: 200 }}>
            <div 
                class="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onclick={() => showDeleteAccountModal = false}
                role="button"
                tabindex="0"
                onkeydown={(e) => e.key === 'Escape' && (showDeleteAccountModal = false)}
            ></div>
            <div 
                class="relative w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden"
                transition:scale={{ duration: 200, start: 0.95 }}
            >
                <div class="p-6 space-y-4">
                    <div class="flex items-center gap-3 text-rose-500">
                        <div class="p-2 bg-rose-500/10 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                            </svg>
                        </div>
                        <h3 class="text-lg font-bold text-foreground">Delete Account?</h3>
                    </div>
                    
                    <div class="space-y-2">
                        <p class="text-muted-foreground">
                            Are you sure you want to delete your account?
                        </p>
                        <div class="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                            <p class="text-sm text-rose-600 dark:text-rose-500 font-medium">
                                Warning: This action is irreversible. All your data, including courses, tasks, and friends, will be permanently deleted.
                            </p>
                        </div>
                    </div>

                    <div class="flex items-center justify-end gap-3 pt-2">
                        <button 
                            class="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                            onclick={() => showDeleteAccountModal = false}
                        >
                            Cancel
                        </button>
                        <form 
                            method="POST" 
                            action="?/deleteAccount" 
                            use:enhance={() => {
                                return async ({ result, update }) => {
                                    if (result.type === 'failure') {
                                        alert(result.data?.message || 'Failed to delete account');
                                    }
                                    await update();
                                };
                            }}
                        >
                            <button 
                                type="submit"
                                class="px-4 py-2 text-sm font-medium bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition-colors shadow-lg shadow-rose-500/20"
                            >
                                Delete Account
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    {/if}
</div>
