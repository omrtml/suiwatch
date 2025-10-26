<template>
    <div class="h-full flex flex-col overflow-hidden">
        <div class="mt-4 flex-1 flex flex-col gap-4">
            <!-- initial fancy button shown until activated: centered in the panel -->
            <div v-if="!active" class="flex-1 flex items-center justify-center">
                            <button @click="activate"
                                            class="fancy-btn relative overflow-hidden px-6 py-3 rounded-full text-white font-semibold shadow-2xl transform transition"
                                            type="button">
                                <span class="absolute -left-6 -top-6 w-20 h-20 rounded-full bg-white/10 blur-lg animate-pulse"></span>
                                <svg class="inline-block mr-2" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                    <path d="M12 2l1.176 3.618L17 6.5l-3 2.182L14.352 12 12 10.118 9.648 12 10 8.682 7 6.5l3.824-.882L12 2z" fill="rgba(255,255,255,0.95)"/>
                                </svg>
                                <span class="inline-flex items-center gap-2">Get AI Advice</span>
                            </button>
            </div>

            <div v-if="active" class="">
                <div class="flex items-start justify-between">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-100">
                            Portfolio AI Advice
                        </h3>
                    </div>
                    <div>
                        <button @click="regenerate" :disabled="loading"
                            class="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white">
                            Regenerate
                        </button>
                    </div>
                </div>

                <div class="rounded-lg p-6 flex-1 overflow-y-auto mt-3">
                    <h4 class="text-sm text-gray-300 mb-4">Advice</h4>

                    <!-- Loading state: spinner + skeleton lines -->
                    <div v-if="loading" class="flex flex-col gap-3 items-start">
                        <div class="flex items-center gap-3">
                            <svg class="w-5 h-5 text-indigo-400 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.15" stroke-width="4"></circle>
                                <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" stroke-width="4" stroke-linecap="round"></path>
                            </svg>
                            <div class="text-sm text-gray-300">Generating concise portfolio advice…</div>
                        </div>

                        <div class="w-full mt-2">
                            <div class="h-3 bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
                            <div class="h-3 bg-gray-700 rounded w-5/6 mb-2 animate-pulse"></div>
                            <div class="h-3 bg-gray-700 rounded w-2/3 mb-2 animate-pulse"></div>
                            <div class="h-3 bg-gray-700 rounded w-1/2 mb-2 animate-pulse"></div>
                        </div>
                    </div>

                    <!-- Advice content -->
                    <div v-else class="text-sm text-gray-200 whitespace-pre-wrap break-words">
                        {{ advice || 'No advice available.' }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// Accept null for totalUsd to match computed<number | null> passed from App.vue
const props = defineProps<{ tokens?: any[]; totalUsd?: number | null; walletAddress?: string }>();

const active = ref(false);
const loading = ref(false);
// Start empty and show a loader while fetching
const advice = ref<string>("");

async function fetchAdvice(prompt?: string, maxChars = 600, walletAddress?: string) {
    loading.value = true;
    // clear previous advice while loading
    advice.value = "";
    try {
        // Build a clear instruction prompt for portfolio-specific advice.
        const instruction = prompt || (walletAddress
            ? `You are a concise and practical crypto portfolio analyst. Analyze the portfolio for wallet ${walletAddress} and produce: (1) a 1-2 sentence summary of the portfolio composition, and (2) three prioritized, actionable recommendations. Return plain text only. Keep the entire response under ${maxChars} characters.`
            : `You are a concise and practical crypto portfolio analyst. Analyze the provided portfolio data and produce: (1) a 1-2 sentence summary of the portfolio composition, and (2) three prioritized, actionable recommendations. Return plain text only. Keep the entire response under ${maxChars} characters.`);

        const res = await fetch('/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: instruction }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            advice.value = `Error: ${err?.error || res.statusText}`;
            return;
        }

        const json = await res.json();

        // Prefer normalized `text` if backend sent it
        let extracted = json?.text || json?.result?.response || json?.raw?.result?.response;
        // fallback to common OpenAI/Cloudflare nested shapes
        extracted = extracted || json?.choices?.[0]?.message?.content || json?.choices?.[0]?.text;
        extracted = extracted || json?.result?.[0]?.content?.[0]?.text || json?.result?.[0]?.output?.[0]?.content?.[0]?.text;
        // final fallback: pretty-print the raw JSON (useful for debugging)
        advice.value = extracted || JSON.stringify(json, null, 2) || 'No response from AI.';
    } catch (err) {
        advice.value = `Network error: ${String(err)}`;
    } finally {
        loading.value = false;
    }
}

function activate() {
    active.value = true;
    // Immediately request AI advice when opened; include wallet address if provided
    void fetchAdvice(undefined, 600, props.walletAddress);
}

function regenerate() {
    // regenerate uses same prompt; include wallet address when available
    void fetchAdvice(undefined, 600, props.walletAddress);
}
</script>

<style scoped>
.placeholder-box {
    min-height: 120px;
}
</style>
<style scoped>
.placeholder-box {
    min-height: 120px;
}

.fancy-btn {
    background: linear-gradient(90deg,#065f46,#10b981);
    background-size: 200% 200%;
    color: white;
    box-shadow: 0 6px 18px rgba(16,185,129,0.12), 0 2px 6px rgba(6,95,70,0.08);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    position: relative;
    overflow: hidden;
    transition: transform .22s cubic-bezier(.2,.9,.2,1), box-shadow .22s;
}
.fancy-btn:hover {
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 10px 30px rgba(16,185,129,0.18), 0 4px 10px rgba(6,95,70,0.12);
}
.fancy-btn:active {
    transform: translateY(-1px) scale(.995);
}

/* soft moving gradient */
@keyframes gradientShift {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}
.fancy-btn {
    animation: gradientShift 6s ease-in-out infinite;
}

/* glossy sheen */
.fancy-btn::before {
    content: "";
    position: absolute;
    top: -120%;
    left: -40%;
    width: 40%;
    height: 260%;
    background: linear-gradient(120deg, rgba(255,255,255,0.12), rgba(255,255,255,0.02));
    transform: rotate(-25deg);
    transition: transform .6s ease;
    opacity: 0.85;
}
.fancy-btn:hover::before {
    transform: translateX(220%) rotate(-25deg);
}

.fancy-btn svg {
    filter: drop-shadow(0 2px 6px rgba(0,0,0,0.2));
}

</style>
