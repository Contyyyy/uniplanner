<script>
    import { onMount } from 'svelte';
    import Chart from 'chart.js/auto';
    import Tour from '$lib/components/Tour.svelte';

    let { data } = $props();
    let chartCanvas;
    let chartInstance;

    // Calculate Stats
    let averageGrade = $derived(
        data.gradedAssessments.length > 0
            ? Math.round(data.gradedAssessments.reduce((acc, curr) => acc + curr.grade, 0) / data.gradedAssessments.length)
            : 0
    );

    let bestCourse = $derived.by(() => {
        if (data.gradedAssessments.length === 0) return 'N/A';
        
        const courseGrades = {};
        data.gradedAssessments.forEach(a => {
            const name = a.courseName || 'Unknown';
            if (!courseGrades[name]) courseGrades[name] = [];
            courseGrades[name].push(a.grade);
        });

        let best = { name: 'N/A', avg: -1 };
        for (const [name, grades] of Object.entries(courseGrades)) {
            const avg = grades.reduce((a, b) => a + b, 0) / grades.length;
            if (avg > best.avg) best = { name, avg };
        }
        return best.name;
    });

    onMount(() => {
        if (data.gradedAssessments.length > 0 && chartCanvas) {
            const ctx = chartCanvas.getContext('2d');
            
            // Prepare Data
            const labels = data.gradedAssessments.map(a => a.title);
            const grades = data.gradedAssessments.map(a => a.grade);
            const colors = data.gradedAssessments.map(a => a.courseColor || '#0d9488');

            chartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Grade (%)',
                        data: grades,
                        borderColor: '#8b5cf6', // Primary Purple
                        backgroundColor: 'rgba(139, 92, 246, 0.1)',
                        pointBackgroundColor: colors,
                        pointRadius: 6,
                        pointHoverRadius: 8,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            grid: { color: 'rgba(255, 255, 255, 0.1)' },
                            ticks: { color: '#a1a1aa' }
                        },
                        x: {
                            grid: { display: false },
                            ticks: { color: '#a1a1aa' }
                        }
                    },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            padding: 12,
                            titleFont: { size: 14, weight: 'bold' },
                            bodyFont: { size: 13 },
                            displayColors: false,
                            callbacks: {
                                label: (context) => `Grade: ${context.raw}%`
                            }
                        }
                    }
                }
            });
        }

        return () => {
            if (chartInstance) chartInstance.destroy();
        };
    });
</script>

<div class="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
    <header class="pr-12 md:pr-0">
        <h1 class="text-2xl md:text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Academic Progress</h1>
        <p class="text-muted-foreground mt-1">Visualize your performance and achievements</p>
    </header>

    {#if !data.user}
        <div class="glass-panel p-8 rounded-2xl text-center">
            <p class="text-lg font-medium mb-4">Please log in to view your progress</p>
            <a href="/demo/lucia/login" class="px-6 py-2.5 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all">Log In</a>
        </div>
    {:else}
        <!-- Stats Grid -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div class="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                <p class="text-muted-foreground font-medium mb-2">Average Grade</p>
                <div class="text-4xl font-bold text-primary">{averageGrade}%</div>
            </div>
            <div class="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                <p class="text-muted-foreground font-medium mb-2">Assessments Completed</p>
                <div class="text-4xl font-bold text-accent">{data.gradedAssessments.length}</div>
            </div>
            <div class="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                <p class="text-muted-foreground font-medium mb-2">Best Course</p>
                <div class="text-2xl font-bold text-emerald-500 truncate max-w-full px-4">{bestCourse}</div>
            </div>
            <div class="glass-card p-6 rounded-2xl flex flex-col items-center justify-center text-center">
                <p class="text-muted-foreground font-medium mb-2">Attendance Rate</p>
                <div class="text-4xl font-bold text-amber-500">
                    {#if data.attendanceRecords && data.attendanceRecords.length > 0}
                        {Math.round((data.attendanceRecords.filter(r => r.status === 'present').length / data.attendanceRecords.length) * 100)}%
                    {:else}
                        N/A
                    {/if}
                </div>
            </div>
        </div>

        <!-- Chart Section -->
        <div class="glass-panel p-8 rounded-3xl h-[400px] relative">
            {#if data.gradedAssessments.length === 0}
                <div class="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-16 h-16 mb-4 opacity-50">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                    </svg>
                    <p class="text-lg font-medium">No graded assessments yet</p>
                    <p class="text-sm mt-1">Complete an assessment to see your progress chart!</p>
                </div>
            {:else}
                <canvas bind:this={chartCanvas}></canvas>
            {/if}
        </div>
    {/if}
</div>

{#if data.user && !data.user.hasSeenProgressTour}
    <Tour 
        title="Visualize Your Progress 📈" 
        description="See how you're performing across all your courses. Track your average grade, attendance rate, and see a visual chart of your assessment results over time."
        action="?/dismissTour"
    />
{/if}
