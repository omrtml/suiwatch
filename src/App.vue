<template>
  <div class="min-h-screen bg-gray-900 text-white relative">
    <!-- Landing: Big centered search -->
    <div v-if="mode === 'landing'" class="min-h-screen flex items-center justify-center">
      <div class="w-full max-w-6xl px-6">
        <div class="relative">
          <!-- Left icon -->
          <div class="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
            <svg class="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <!-- Big input -->
          <input
            v-model="landingQuery"
            @keyup.enter="submitLanding"
            type="text"
            placeholder="Search for any Token, Wallet or Feature"
            class="w-full bg-gray-800 border border-gray-700 rounded-full pl-16 pr-24 py-6 text-2xl placeholder-gray-400 focus:outline-none focus:border-gray-600 transition-colors"
          />
          <!-- Slash badge -->
          <div class="absolute inset-y-0 right-0 pr-6 flex items-center pointer-events-none">
            <div class="bg-gray-700 rounded-md px-3 py-1.5">
              <span class="text-gray-300 text-xl font-medium">/</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Top: Smaller search near the top -->
    <div v-else class="pt-10">
      <div class="max-w-3xl mx-auto px-4">
        <div class="relative">
          <!-- Left icon -->
          <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          <!-- Small input -->
          <input
            ref="topInput"
            v-model="topQuery"
            @keyup.enter="submitTop"
            type="text"
            placeholder="Search for any Token, Wallet or Feature"
            class="w-full bg-gray-800 border border-gray-700 rounded-full pl-12 pr-14 py-3 text-lg placeholder-gray-400 focus:outline-none focus:border-gray-600 transition-colors"
          />
          <!-- Slash badge -->
          <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <div class="bg-gray-700 rounded px-2 py-0.5">
              <span class="text-gray-300 text-sm font-medium">/</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Middle content placeholders -->
      <div class="max-w-7xl mx-auto px-4 mt-10">
        <!-- Top grid: left card + right card -->
        <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <!-- Left large card: Net Worth -->
          <div class="lg:col-span-3 relative overflow-hidden rounded-3xl bg-gray-800/60 border border-gray-700/60 shadow-xl h-[420px]">
            <!-- Gradient wash for depth -->
            <div class="pointer-events-none absolute inset-0 bg-gradient-to-br from-transparent via-emerald-700/10 to-emerald-500/20"></div>
            
            <!-- Content -->
            <div class="relative h-full p-6 pr-56">
              <div class="flex items-center">
                <h3 class="text-gray-200 text-xl font-semibold">Net Worth</h3>
              </div>

              <!-- Big amount -->
              <div class="mt-6">
                <div class="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white">
                  {{ formattedUSD }}
                </div>
              </div>

              <!-- Stats grid -->
              <!-- Reserved space for future metrics -->
              <div class="mt-8"></div>

              <!-- Error -->
              <p v-if="errorMsg" class="mt-4 text-sm text-red-400">{{ errorMsg }}</p>
              <div v-if="loading" class="absolute inset-0 bg-gray-900/20 backdrop-blur-[1px]"></div>
            </div>

            <!-- Mascot -->
            <img
              src="/img/walrus.png"
              alt="Walrus mascot"
              class="pointer-events-none select-none absolute -bottom-4 -right-4 h-56 sm:h-64 md:h-72 lg:h-80 opacity-95"
              loading="lazy"
              decoding="async"
            />
          </div>
          <!-- Right large card placeholder -->
          <div class="lg:col-span-2 rounded-2xl bg-gray-800/50 border border-gray-700/60 shadow-xl h-[420px]"></div>
        </div>

        <!-- Coins list (table style) -->
        <div class="rounded-2xl bg-gray-800/50 border border-gray-700/60 shadow-xl mt-8">
          <div class="p-4 sm:p-6">
            <!-- Card header -->
            <div class="flex items-center justify-between">
              <h3 class="text-gray-200 text-base sm:text-lg font-semibold">Token Portfolio</h3>
              <div class="text-gray-400 text-orange-400 text-sm font-bold">Total tokens: {{ tokensCount }} </div>
            </div>

            <!-- Table header -->
            <div class="mt-4 hidden md:flex items-center px-2 py-2 rounded-lg bg-gray-900/40 border border-gray-700/60 text-xs uppercase tracking-wide text-gray-400">
              <div class="w-10 text-center">#</div>
              <div class="flex-1 pl-2">Name</div>
              <div class="w-32 text-right">Price</div>
              <div class="w-44 text-right">Balance</div>
              <div class="w-36 text-right">USD Value</div>
            </div>

            <!-- Rows -->
            <div class="mt-1 max-h-[26rem] overflow-y-auto">
              <div
                v-for="(t, idx) in pagedTokens"
                :key="t.coinType + '-' + idx"
                class="flex items-center px-2 py-3 border-b border-gray-800/60 last:border-0"
              >
                <div class="w-10 text-center text-gray-400">{{ (currentPage - 1) * 10 + idx + 1 }}</div>
                <div class="flex-1 pl-2 min-w-0 flex items-center gap-3">
                  <div class="h-9 w-9 rounded-full bg-gray-700/60 flex items-center justify-center overflow-hidden shrink-0">
                    <img v-if="t.iconUrl" :src="t.iconUrl" alt="" class="h-full w-full object-cover" />
                    <span v-else class="text-sm font-semibold text-gray-300">{{ t.symbolFirst }}</span>
                  </div>
                  <div class="min-w-0">
                    <div class="text-white font-medium leading-tight truncate">{{ t.symbol }}</div>
                    <div class="text-gray-400 text-[11px] leading-tight truncate">{{ t.name }}</div>
                  </div>
                </div>
                <div class="w-32 text-right text-gray-200">{{ t.priceDisplay }}</div>
                <div class="w-44 text-right text-white">{{ t.amountDisplay }} <span class="text-gray-400">{{ t.symbol }}</span></div>
                <div class="w-36 text-right text-white">{{ t.valueUSDDisplay }}</div>
              </div>
            </div>

            <!-- Mobile list -->
            <div class="md:hidden mt-3 divide-y divide-gray-700/60">
              <div v-for="(t, idx) in pagedTokens" :key="t.coinType + '-m-' + idx" class="py-3">
                <div class="flex items-center gap-3">
                  <div class="text-gray-400 w-6">{{ (currentPage - 1) * 10 + idx + 1 }}</div>
                  <div class="h-8 w-8 rounded-full bg-gray-700/60 flex items-center justify-center overflow-hidden">
                    <img v-if="t.iconUrl" :src="t.iconUrl" alt="" class="h-full w-full object-cover" />
                    <span v-else class="text-xs font-semibold text-gray-300">{{ t.symbolFirst }}</span>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="text-white font-medium truncate">{{ t.symbol }}</div>
                    <div class="text-gray-400 text-[11px] truncate">{{ t.name }}</div>
                  </div>
                  <div class="text-right">
                    <div class="text-white">{{ t.valueUSDDisplay }}</div>
                    <div class="text-gray-400 text-xs">{{ t.amountDisplay }} {{ t.symbol }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pagination controls -->
            <div class="mt-4 flex items-center justify-between">
              <div class="text-gray-400 text-sm">
                Page {{ currentPage }} of {{ totalPages }}
              </div>
              <div class="flex items-center gap-2">
                <button
                  class="px-3 py-1.5 rounded-md bg-gray-700/70 border border-gray-600/60 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                  :disabled="currentPage <= 1"
                  @click="prevPage"
                >
                  Prev
                </button>
                <button
                  class="px-3 py-1.5 rounded-md bg-gray-700/70 border border-gray-600/60 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700"
                  :disabled="currentPage >= totalPages"
                  @click="nextPage"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, computed, watch } from 'vue'

type Mode = 'landing' | 'top'
const mode = ref<Mode>('landing')
const landingQuery = ref('')
const topQuery = ref('')
const topInput = ref<HTMLInputElement | null>(null)

const loading = ref(false)
const errorMsg = ref('')
const lastUrl = ref('')
const result = ref<unknown | null>(null)

const BASE_URL = '/api/wallet'

async function fetchWallet(address: string) {
  const addr = address.trim()
  if (!addr) return
  if (loading.value) return
  const url = `${BASE_URL}/${encodeURIComponent(addr)}`
  loading.value = true
  errorMsg.value = ''
  lastUrl.value = url
  try {
    const res = await fetch(url, { method: 'GET' })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    result.value = json
  } catch (err: any) {
    errorMsg.value = err?.message ?? 'Request failed'
    result.value = null
  } finally {
    loading.value = false
  }
}

function submitLanding() {
  const q = landingQuery.value.trim()
  if (!q) return
  topQuery.value = q
  mode.value = 'top'
  nextTick(() => topInput.value?.focus())
  fetchWallet(q)
}

function submitTop() {
  const q = topQuery.value.trim()
  if (!q) return
  fetchWallet(q)
}

const totalValueUSD = computed<number | null>(() => {
  const r: any = result.value
  const v = r?.data?.totalValueUSD
  return typeof v === 'number' ? v : null
})

function formatUSD(n: number | null | undefined) {
  if (typeof n !== 'number' || !isFinite(n)) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(n)
}

const formattedUSD = computed(() => formatUSD(totalValueUSD.value))

// -------- Tokens list helpers --------
const tokensRaw = computed<any[]>(() => {
  const r: any = result.value
  return Array.isArray(r?.data?.tokens) ? r.data.tokens : []
})

// Merge duplicates strictly by coinType; if coinType is missing, keep entries separate
const tokensMerged = computed<any[]>(() => {
  const map = new Map<string, any>()
  const others: any[] = []
  for (const t of tokensRaw.value) {
    const key = (t && t.coinType) ? String(t.coinType) : null
    const bal = (() => {
      try { return BigInt(String(t?.balance ?? '0')) } catch { return BigInt(0) }
    })()
    const val = typeof t?.valueUSD === 'number' ? t.valueUSD : 0

    if (key) {
      const cur = map.get(key)
      if (!cur) {
        map.set(key, { ...t, balanceBig: bal, valueUSD: val })
      } else {
        cur.balanceBig = cur.balanceBig + bal
        cur.valueUSD = (cur.valueUSD || 0) + val
      }
    } else {
      // No coinType — don't merge to avoid accidental collisions
      others.push({ ...t, balanceBig: bal, valueUSD: val })
    }
  }
  const merged = Array.from(map.values()).map((e) => ({ ...e, balance: e.balanceBig.toString() }))
  const tail = others.map((e) => ({ ...e, balance: e.balanceBig.toString() }))
  return [...merged, ...tail]
})

function toHumanAmount(balanceStr: any, decimals: any) {
  const bal = Number(balanceStr)
  const dec = Number(decimals)
  if (!isFinite(bal) || !isFinite(dec)) return 0
  return bal / Math.pow(10, dec)
}

function formatTokenAmount(amount: number) {
  if (!isFinite(amount)) return '0'
  if (amount >= 1000) return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 }).format(amount)
  if (amount >= 1) return amount.toLocaleString('en-US', { maximumFractionDigits: 4 })
  if (amount === 0) return '0'
  return amount.toLocaleString('en-US', { maximumFractionDigits: 6 })
}

function formatPriceUSD(n: number | null | undefined) {
  if (typeof n !== 'number' || !isFinite(n) || n <= 0) return '—'
  const decimals = n < 1 ? 6 : 4
  return `$${n.toLocaleString('en-US', { maximumFractionDigits: decimals })}`
}

const tokensEnriched = computed(() =>
  tokensMerged.value.map((t: any) => {
    const symbol = t?.metadata?.symbol ?? ''
    const name = t?.metadata?.name ?? ''
    const iconUrl = t?.metadata?.iconUrl || ''
    const amount = toHumanAmount(t?.balance, t?.metadata?.decimals)
    const valueUSDRaw = typeof t?.valueUSD === 'number' ? t.valueUSD : 0
    const priceUSD = amount > 0 && valueUSDRaw > 0 ? valueUSDRaw / amount : undefined
    const valueUSDFinal = valueUSDRaw > 0 ? valueUSDRaw : (priceUSD ? priceUSD * amount : 0)
    return {
      coinType: t?.coinType ?? symbol,
      symbol,
      name,
      iconUrl,
      amount,
      valueUSD: valueUSDFinal,
      amountDisplay: formatTokenAmount(amount),
      valueUSDDisplay: valueUSDFinal > 0 ? formatUSD(valueUSDFinal) : '—',
      priceDisplay: formatPriceUSD(priceUSD),
      symbolFirst: (symbol || '?').slice(0, 1).toUpperCase(),
    }
  })
)

const tokensSorted = computed(() =>
  [...tokensEnriched.value].sort((a, b) => (b.valueUSD - a.valueUSD) || (b.amount - a.amount))
)

const tokensCount = computed(() => tokensSorted.value.length)

// -------- Pagination (10 per page) --------
const pageSize = 10
const currentPage = ref(1)
const totalPages = computed(() => Math.max(1, Math.ceil(tokensSorted.value.length / pageSize)))

watch(tokensSorted, () => {
  // Reset to first page when data changes
  currentPage.value = 1
})

const pagedTokens = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return tokensSorted.value.slice(start, end)
})

function prevPage() {
  if (currentPage.value > 1) currentPage.value -= 1
}
function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value += 1
}


</script>
