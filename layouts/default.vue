<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const scrollY = ref(0)
const isMounted = ref(false)
const characterIndices = ref<number[]>([])

// --- Character Logic ---
const generateRandomIndices = () => {
  const allIndices = Array.from({ length: 6 }, (_, i) => i + 1)
  for (let i = allIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]]
  }
  return allIndices.slice(0, 3)
}

const getCharacterPath = (index: number) => {
  return `/character${characterIndices.value[index] || 1}_no_back.png`
}

// --- Animation Loop ---
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

    // Optimization: Hide if off-screen to prevent painting
    if (charProgress < -0.2 || charProgress > 1.2) {
      (square as HTMLElement).style.opacity = '0'
      return
    }

    const viewportWidth = window.innerWidth
    const squareWidth = (square as HTMLElement).offsetWidth
    const startX = isLeftStart ? -squareWidth : viewportWidth
    const endX = isLeftStart ? viewportWidth : -squareWidth
    const currentX = startX + (endX - startX) * charProgress

    // Bouncing Logic
    const steps = 8
    const bounceFrequency = charProgress * Math.PI * steps
    const bounceHeight = Math.abs(Math.sin(bounceFrequency)) * 30 * speedFactor
    const rotationBase = Math.cos(bounceFrequency) * 5 * speedFactor
    const baseScale = parseFloat(square.style.getPropertyValue('--random-scale') || '1')
    const facingScale = isLeftStart ? 1 : -1

    // Fade In/Out
    const FADE_DURATION = 0.1
    let opacity = 1
    if (charProgress < FADE_DURATION) {
      opacity = charProgress / FADE_DURATION
    } else if (charProgress > (1 - FADE_DURATION)) {
      opacity = 1 - ((charProgress - (1 - FADE_DURATION)) / FADE_DURATION)
    }

    // Apply Transforms
    (square as HTMLElement).style.transform = `
      translate3d(${currentX}px, ${-bounceHeight}px, 0)
      rotate(${rotationBase}deg)
      scale(${baseScale})
      scaleX(${facingScale})
    `
    ;(square as HTMLElement).style.opacity = `${Math.max(0, opacity)}`

    // Dynamic Shadow
    const shadowIntensity = 1 - (bounceHeight / 30)
    ;(square as HTMLElement).style.filter = `drop-shadow(0px ${10 + bounceHeight/2}px ${5 + bounceHeight/3}px rgba(0,0,0,${0.3 * shadowIntensity}))`
  })
}

// --- Setup Positions ---
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
    handleScroll() // Initial calculation
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
      <div class="relative w-full max-w-6xl mx-auto px-4 mt-4 filter drop-shadow-xl">
        <div class="flex items-center justify-center gap-4">
          <div class="relative w-48 h-32">
            <NuxtImg
                v-if="isMounted"
                src="/sun.png"
                loading="lazy"
                class="absolute object-contain z-10 sun"
                alt="Tribal Sun"
            />
            <NuxtImg
                v-if="isMounted"
                loading="lazy"
                src="/title_nosun.png"
                class="relative w-full h-full object-contain z-20 title"
                alt="Puhoy Title"
            />
          </div>

          <a
              href="https://www.instagram.com/ipuhoy"
              target="_blank"
              class="z-50 pointer-events-auto group pt-4"
          >
            <div class="w-8 h-8 sm:w-16 sm:h-12 relative tribal-icon-container">
              <NuxtImg
                  src="/instagram.svg"
                  loading="lazy"
                  class="w-8 h-8 object-contain filter drop-shadow-md group-hover:brightness-110 animate-float-pulse"
                  alt="Instagram"
              />
            </div>
          </a>
        </div>
      </div>
    </header>

    <main class="z-10 h-screen w-full">
      <div class="scroll-container h-full w-full overflow-y-auto overflow-x-hidden relative">

        <slot />

        <div class="h-24 w-full flex items-center justify-center text-[#f0e6d2]/30 text-sm font-sans mt-20">
          © 2024 iPuhoy Portfolio
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

<style>
/* Global Fonts & Styles */
@import url('https://fonts.googleapis.com/css2?family=Patrick+Hand+SC&family=Fredoka:wght@400;600&display=swap');

.font-handwritten { font-family: 'Patrick Hand SC', cursive; }
.font-sans { font-family: 'Fredoka', sans-serif; }

/* Background */
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

/* Animations */
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

/* Global Utility Classes for Pages */
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

/* Scrollbar Hiding */
.scroll-container::-webkit-scrollbar { display: none; }
.scroll-container { -ms-overflow-style: none; scrollbar-width: none; -webkit-overflow-scrolling: touch; }

/* Tribal Frame Styles (Made Global for Reuse) */
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

/* NEW: Floating Pulse Animation */
@keyframes floatPulse {
  0% {
    transform: scale(1) translate(0, 0) rotate(0deg);
  }
  25% {
    transform: scale(1.05) translate(2px, -2px) rotate(2deg);
  }
  50% {
    transform: scale(1) translate(0, -4px) rotate(0deg);
  }
  75% {
    transform: scale(1.05) translate(-2px, -2px) rotate(-2deg);
  }
  100% {
    transform: scale(1) translate(0, 0) rotate(0deg);
  }
}

.animate-float-pulse {
  animation: floatPulse 4s ease-in-out infinite;
  /* Will-change optimizes browser rendering for these properties */
  will-change: transform;
}

/* Optional: Make it slightly faster on hover for feedback */
.group:hover .animate-float-pulse {
  animation-duration: 2s;
}
</style>