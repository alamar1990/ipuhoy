<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'

// --- State ---
const scrollY = ref(0)
const isMounted = ref(false)
const characterIndices = ref<number[]>([])
const visibleSections = ref<Set<string>>(new Set())

const contactForm = ref({ name: '', email: '', message: '' })

// --- FETCH DATA ---
// Connect to the server route to get the list of files
const { data: rawArtworks } = await useFetch('/api/artworks')

// --- Styling Palette ---
const tones = [
  "shadow-orange-900/50",
  "shadow-teal-900/50",
  "shadow-amber-900/50",
  "shadow-rose-900/50",
  "shadow-purple-900/50",
  "shadow-emerald-900/50"
]

// --- Process Artworks ---
// Transform the server data into UI data (adding styles, rotation, etc.)
const artworks = computed(() => {
  // If no data found, return empty
  if (!rawArtworks.value) return []

  return rawArtworks.value.map((file, index) => {
    // Generate deterministic random values based on index
    // This ensures the layout looks "wild" but stays the same on refresh
    const seed = index * 1337
    const rot = `${((seed % 10) - 5).toFixed(1)}deg`
    const y = `${(seed % 60) - 30}px`

    // Cycle through the color tones
    const tone = tones[index % tones.length]

    return {
      id: index,
      title: file.title,
      image: file.path,
      tone,
      rot,
      y
    }
  })
})

// --- Character Logic (Unchanged) ---
const generateRandomIndices = () => {
  const allIndices = Array.from({ length: 6 }, (_, i) => i + 1)
  for (let i = allIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]]
  }
  return allIndices.slice(0, 3)
}

const handleContact = () => {
  const { name, email, message } = contactForm.value
  const subject = encodeURIComponent(`Portfolio Contact from ${name}`)
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)
  window.location.href = `mailto:ipuhoy@gmail.com?subject=${subject}&body=${body}`
}

const getCharacterPath = (index: number) => {
  return `/character${characterIndices.value[index] || 1}_no_back.png`
}

// --- Animation Loop (Unchanged) ---
const handleScroll = () => {
  const scrollContainer = document.querySelector('.scroll-container')
  if (!scrollContainer) return

  const { scrollTop, scrollHeight, clientHeight } = scrollContainer
  const maxScroll = scrollHeight - clientHeight
  const currentScrollPercent = Math.min(scrollTop / maxScroll, 1)

  const squares = document.querySelectorAll('.square')
  squares.forEach((square) => {
    const startScrollPct = parseFloat(square.getAttribute('data-start') || '0')
    const durationPct = parseFloat(square.getAttribute('data-duration') || '0.4')
    const isLeftStart = square.getAttribute('data-direction') === 'left'
    const speedFactor = parseFloat(square.dataset.speedFactor || '1')

    let charProgress = (currentScrollPercent - startScrollPct) / durationPct

    if (charProgress < -0.2 || charProgress > 1.2) {
      (square as HTMLElement).style.opacity = '0'
      return
    }

    const viewportWidth = window.innerWidth
    const squareWidth = (square as HTMLElement).offsetWidth
    const startX = isLeftStart ? -squareWidth : viewportWidth
    const endX = isLeftStart ? viewportWidth : -squareWidth
    const currentX = startX + (endX - startX) * charProgress

    const steps = 8
    const bounceFrequency = charProgress * Math.PI * steps
    const bounceHeight = Math.abs(Math.sin(bounceFrequency)) * 30 * speedFactor
    const rotationBase = Math.cos(bounceFrequency) * 5 * speedFactor
    const baseScale = parseFloat(square.style.getPropertyValue('--random-scale') || '1')
    const facingScale = isLeftStart ? 1 : -1

    const FADE_DURATION = 0.1
    let opacity = 1
    if (charProgress < FADE_DURATION) {
      opacity = charProgress / FADE_DURATION
    } else if (charProgress > (1 - FADE_DURATION)) {
      opacity = 1 - ((charProgress - (1 - FADE_DURATION)) / FADE_DURATION)
    }

    (square as HTMLElement).style.transform = `
      translate3d(${currentX}px, ${-bounceHeight}px, 0)
      rotate(${rotationBase}deg)
      scale(${baseScale})
      scaleX(${facingScale})
    `
    ;(square as HTMLElement).style.opacity = `${Math.max(0, opacity)}`

    const shadowIntensity = 1 - (bounceHeight / 30)
    ;(square as HTMLElement).style.filter = `drop-shadow(0px ${10 + bounceHeight/2}px ${5 + bounceHeight/3}px rgba(0,0,0,${0.3 * shadowIntensity}))`
  })
}

// --- Content Observer (Unchanged) ---
const setupObserver = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        visibleSections.value.add(entry.target.id)
        entry.target.classList.add('is-visible')
      }
    })
  }, { threshold: 0.15 })

  document.querySelectorAll('section').forEach((el) => {
    observer.observe(el)
  })
}

const setRandomInitialPositions = () => {
  const squares = document.querySelectorAll('.square')
  squares.forEach((square, index) => {
    const el = square as HTMLElement
    const randomTop = 15 + Math.random() * 55
    el.style.top = `${randomTop}%`
    const isLeft = Math.random() > 0.5
    el.setAttribute('data-direction', isLeft ? 'left' : 'right')
    const startPct = (index * 0.2) + (Math.random() * 0.1)
    const durationPct = 0.3 + (Math.random() * 0.1)
    const randomScale = 0.6 + Math.random() * 0.5
    const speedFactor = 0.8 + Math.random() * 0.4
    el.setAttribute('data-start', startPct.toFixed(3))
    el.setAttribute('data-duration', durationPct.toFixed(3))
    el.dataset.speedFactor = speedFactor.toString()
    el.style.setProperty('--random-scale', randomScale.toString())
    el.style.opacity = '0'
  })
}

onMounted(() => {
  characterIndices.value = generateRandomIndices()
  isMounted.value = true
  const scrollContainer = document.querySelector('.scroll-container')
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
  }
  setTimeout(() => {
    setRandomInitialPositions()
    handleScroll()
    setupObserver()
  }, 100)
})

onUnmounted(() => {
  const scrollContainer = document.querySelector('.scroll-container')
  if (scrollContainer) {
    scrollContainer.removeEventListener('scroll', handleScroll)
  }
})
</script>

<template>
  <div class="app-background font-handwritten text-slate-100">

    <header class="fixed top-0 left-0 w-full z-50 pointer-events-none">
      <div class="relative w-48 h-32 mx-auto top-title filter drop-shadow-xl mt-4">
        <img v-if="isMounted" src="/sun.png" class="absolute object-contain z-10 sun">
        <img v-if="isMounted" src="/title_nosun.png" class="relative w-full h-full object-contain z-20 title">
      </div>
    </header>

    <main class="z-10 h-screen w-full">
      <div class="scroll-container h-full w-full overflow-y-auto overflow-x-hidden relative">

        <section id="hero" class="min-h-[90vh] flex items-center justify-center relative">
          <div class="text-center z-10 animate-fade-in-up">
            <div class="animate-bounce text-amber-200/70 mt-32">
              <p class="uppercase tracking-[0.3em] text-sm mb-2 font-sans font-bold">Scroll to Explore</p>
              <svg class="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </div>
          </div>
        </section>

        <section id="artworks" class="min-h-screen relative z-30 px-4 py-20 flex flex-col items-center justify-center">
          <div class="max-w-6xl w-full mx-auto">
            <h2 class="section-title text-5xl md:text-7xl text-center mb-24 text-[#cc5500] drop-shadow-md opacity-0 translate-y-10 transition-all duration-1000">
              ARTWORKS
            </h2>

            <div v-if="artworks.length === 0" class="text-center text-white/50 text-xl font-sans">
              No artworks found in /public/artworks
            </div>

            <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-10">
              <div
                  v-for="(art, index) in artworks"
                  :key="art.id"
                  class="group opacity-0 translate-y-10 transition-all duration-700 hover:z-50"
                  :style="{ transitionDelay: `${index * 150}ms` }"
              >
                <div
                    class="relative p-[14px] bg-[#8B3A28] rounded-[24px] shadow-2xl overflow-hidden tribal-border-texture transition-transform duration-300 hover:scale-105"
                    :style="{ transform: `rotate(${art.rot}) translateY(${art.y})` }"
                >
                  <div class="absolute inset-0 z-0 opacity-80"
                       style="background:
                         conic-gradient(from 45deg at 20px 20px, #2C5158 90deg, transparent 0deg) 0 0 / 40px 40px,
                         conic-gradient(from 225deg at 20px 20px, #D4A373 90deg, transparent 0deg) 0 0 / 40px 40px;
                         margin: 8px;">
                  </div>

                  <div class="absolute inset-[6px] rounded-[18px] border-[4px] border-[#3E2723] z-10 pointer-events-none"></div>

                  <div class="absolute top-0 left-0 w-8 h-8 z-20 bg-[#D4A373] clip-triangle-tl"></div>
                  <div class="absolute top-0 right-0 w-8 h-8 z-20 bg-[#D4A373] clip-triangle-tr"></div>
                  <div class="absolute bottom-0 left-0 w-8 h-8 z-20 bg-[#D4A373] clip-triangle-bl"></div>
                  <div class="absolute bottom-0 right-0 w-8 h-8 z-20 bg-[#D4A373] clip-triangle-br"></div>

                  <div class="relative z-10 bg-[#1a1614] rounded-[14px] aspect-[3/4] overflow-hidden shadow-inner border-[2px] border-[#5D4037]">
                    <div class="w-full h-full relative group-hover:scale-110 transition-transform duration-700 ease-in-out">
                      <img
                          :src="art.image"
                          :alt="art.title"
                          class="w-full h-full object-cover opacity-70 mix-blend-luminosity group-hover:opacity-100 group-hover:mix-blend-normal transition-all duration-500"
                      >
                      <div class="absolute inset-0 pointer-events-none transition-all duration-500"
                           :class="art.tone"
                           style="box-shadow: inset 0 0 20px currentColor;">
                      </div>
                    </div>

                    <div class="absolute bottom-0 w-full p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-center">
                      <h3 class="text-xl text-[#F5DEB3] tracking-wider font-bold drop-shadow-md">{{ art.title }}</h3>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </section>

        <section id="contact" class="min-h-[80vh] flex flex-col items-center justify-center relative z-30 px-4 pb-32">
          <h2 class="section-title text-5xl md:text-7xl text-center mb-12 text-[#cc5500] drop-shadow-md opacity-0 translate-y-10 transition-all duration-1000">
            CONTACT
          </h2>

          <div class="w-full max-w-xl opacity-0 translate-y-10 transition-all duration-1000 delay-300 contact-form-container">
            <form class="space-y-6" @submit.prevent="handleContact">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="space-y-1">
                  <input
                      v-model="contactForm.name"
                      type="text"
                      placeholder="Name"
                      class="puhoy-input"
                      required
                  >
                </div>
                <div class="space-y-1">
                  <input
                      v-model="contactForm.email"
                      type="email"
                      placeholder="Email"
                      class="puhoy-input"
                      required
                  >
                </div>
              </div>
              <div class="space-y-1">
                <textarea
                    v-model="contactForm.message"
                    rows="4"
                    placeholder="Message"
                    class="puhoy-input resize-none"
                    required
                ></textarea>
              </div>
              <div class="pt-4 flex justify-center">
                <button type="submit" class="group relative px-12 py-3 bg-[#a53b19] text-[#f0e6d2] text-2xl tracking-widest hover:bg-[#c2410c] hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg border-y-2 border-[#f0e6d2]/30 rounded-lg">
                  <span class="absolute left-2 top-1/2 -translate-y-1/2 text-white/40 text-sm">❮❮</span>
                  <span>SEND</span>
                  <span class="absolute right-2 top-1/2 -translate-y-1/2 text-white/40 text-sm">❯❯</span>
                </button>
              </div>
            </form>
          </div>
        </section>

        <div class="h-24 w-full flex items-center justify-center text-[#f0e6d2]/30 text-sm font-sans">
          © 2024 Puhoy Portfolio
        </div>

        <div class="fixed inset-0 pointer-events-none z-20 overflow-hidden">
          <div class="square w-48 h-48" v-for="n in 3" :key="n">
            <img v-if="isMounted" :src="getCharacterPath(n-1)" class="w-full h-full object-contain">
          </div>
        </div>

      </div>
    </main>
  </div>
</template>

<style scoped>
/* All existing styles remain exactly the same */
@import url('https://fonts.googleapis.com/css2?family=Patrick+Hand+SC&family=Fredoka:wght@400;600&display=swap');

.font-handwritten { font-family: 'Patrick Hand SC', cursive; }
.font-sans { font-family: 'Fredoka', sans-serif; }

.app-background {
  @apply min-h-screen relative;
  background-color: #1e1b4b;
  overflow: hidden;
}

.app-background::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/background.png');
  background-size: 300px;
  background-repeat: repeat;
  opacity: 0.6;
  z-index: 0;
  background-blend-mode: overlay;
  pointer-events: none;
}

.sun {
  mix-blend-mode: normal;
  height: 45px;
  top: -12px;
  left: 12px;
  animation: spin 20s linear infinite;
  transform-origin: center;
}

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.square {
  position: absolute;
  will-change: transform;
  transition: opacity 0.2s linear;
  left: 0;
  transform: translateX(-100vw);
}

.section-title {
  -webkit-text-stroke: 1px #4a2c10;
  text-shadow: 2px 2px 0px rgba(0,0,0,0.5);
}

.puhoy-input {
  @apply w-full bg-[#3d2817]/60 border-2 border-[#5c3d24] rounded-xl p-4 text-[#f0e6d2] placeholder-[#f0e6d2]/40 outline-none transition-all duration-300 shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)];
}

.puhoy-input:focus {
  @apply border-[#cc5500] bg-[#3d2817]/80;
  box-shadow: 0 0 15px rgba(204, 85, 0, 0.2);
}

section.is-visible .section-title,
section.is-visible .contact-form-container { opacity: 1; transform: translateY(0); }
section.is-visible .group { opacity: 1; transform: translateY(0); }

.scroll-container::-webkit-scrollbar { display: none; }
.scroll-container { -ms-overflow-style: none; scrollbar-width: none; -webkit-overflow-scrolling: touch; }

/* --- TRIBAL FRAME SPECIFIC STYLES --- */
.clip-triangle-tl { clip-path: polygon(0 0, 100% 0, 0 100%); border-top-left-radius: 20px; }
.clip-triangle-tr { clip-path: polygon(0 0, 100% 0, 100% 100%); border-top-right-radius: 20px; }
.clip-triangle-bl { clip-path: polygon(0 100%, 0 0, 100% 100%); border-bottom-left-radius: 20px; }
.clip-triangle-br { clip-path: polygon(100% 0, 100% 100%, 0 100%); border-bottom-right-radius: 20px; }

.tribal-border-texture::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.15'/%3E%3C/svg%3E");
  z-index: 5;
  pointer-events: none;
  mix-blend-mode: overlay;
}
</style>