<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const scrollY = ref(0)
const isMounted = ref(false)
const characterIndices = ref<number[]>([])

// Generate unique random indices (1-6)
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

const handleScroll = () => {
  const scrollContainer = document.querySelector('.scroll-container')
  if (!scrollContainer) return

  const { scrollTop, scrollHeight, clientHeight } = scrollContainer
  const maxScroll = scrollHeight - clientHeight
  const currentScrollPercent = Math.min(scrollTop / maxScroll, 1) // 0 to 1

  const viewportWidth = window.innerWidth
  const squares = document.querySelectorAll('.square')

  squares.forEach((square) => {
    // Retrieve pre-calculated random values
    const startScrollPct = parseFloat(square.getAttribute('data-start') || '0')
    const durationPct = parseFloat(square.getAttribute('data-duration') || '0.4')
    const isLeftStart = square.getAttribute('data-direction') === 'left'
    const speedFactor = parseFloat(square.dataset.speedFactor || '1')

    // Calculate progress for this specific character's window
    // This ensures consistent speed regardless of when they start
    let charProgress = (currentScrollPercent - startScrollPct) / durationPct

    // Allow them to walk off-screen slightly (extends animation range)
    if (charProgress < -0.2 || charProgress > 1.2) {
      // Optimization: hide element if far out of animation range
      (square as HTMLElement).style.opacity = '0'
      return
    }

    // Clamp for math calculations
    const activeProgress = Math.max(0, Math.min(1, charProgress))

    // 1. HORIZONTAL MOVEMENT (Full Viewport)
    const squareWidth = (square as HTMLElement).offsetWidth
    // Start completely offscreen (-squareWidth) and end completely offscreen (viewportWidth)
    const startX = isLeftStart ? -squareWidth : viewportWidth
    const endX = isLeftStart ? viewportWidth : -squareWidth

    // Linear movement across screen based on progress
    const currentX = startX + (endX - startX) * charProgress

    // 2. WALKING BOUNCE (Sine Wave)
    const steps = 8 // How many steps they take across screen
    const bounceFrequency = charProgress * Math.PI * steps
    // Absolute value of Sin creates the "hop" effect
    const bounceHeight = Math.abs(Math.sin(bounceFrequency)) * 30 * speedFactor

    // 3. WALKING ROTATION (Rocking)
    // Rocks back and forth with the steps
    const rotationBase = Math.cos(bounceFrequency) * 5 * speedFactor

    // 4. SCALE & FACING
    const baseScale = parseFloat(square.style.getPropertyValue('--random-scale') || '1')
    // If starting from right, flip image horizontally to face left
    const facingScale = isLeftStart ? 1 : -1

    const FADE_DURATION = 0.1; // 10% of the animation duration for fade in/out
    let opacity = 1;

    if (charProgress < FADE_DURATION) {
      // Fade in: 0% to 100% opacity in the first 10%
      opacity = charProgress / FADE_DURATION;
    } else if (charProgress > (1 - FADE_DURATION)) {
      // Fade out: 100% to 0% opacity in the last 10%
      opacity = 1 - ((charProgress - (1 - FADE_DURATION)) / FADE_DURATION);
    }

    // Apply Transform
    // Note: We use scaleX for facing direction
    (square as HTMLElement).style.transform = `
      translate3d(${currentX}px, ${-bounceHeight}px, 0)
      rotate(${rotationBase}deg)
      scale(${baseScale})
      scaleX(${facingScale})
    `
    ;(square as HTMLElement).style.opacity = `${Math.max(0, opacity)}`

    // Dynamic Shadow
    const shadowIntensity = 1 - (bounceHeight / 30) // Shadow gets lighter when they jump up
    ;(square as HTMLElement).style.filter = `drop-shadow(0px ${10 + bounceHeight/2}px ${5 + bounceHeight/3}px rgba(0,0,0,${0.3 * shadowIntensity}))`
  })
}

const setRandomInitialPositions = () => {
  const squares = document.querySelectorAll('.square')
  // We divide the scroll height into segments to ensure characters don't all appear at once
  const segmentSize = 0.5 / squares.length

  squares.forEach((square, index) => {
    const el = square as HTMLElement

    // 1. VERTICAL POSITION (Random "Lane")
    // Keep them within middle 60% of screen height so they don't get cut off
    const randomTop = 20 + Math.random() * 50
    el.style.top = `${randomTop}%`

    // 2. DIRECTION (Left to Right OR Right to Left)
    const isLeft = Math.random() > 0.5
    el.setAttribute('data-direction', isLeft ? 'left' : 'right')

    // 3. TIMING (When do they start walking?)
    // We stagger them so they don't overlap too much.
    // data-start is the scroll % where they BEGIN walking.
    // We max it at 0.5 (50% scroll) so they definitely finish before the page ends.
    const randomOffset = Math.random() * 0.1
    const startPct = (index * 0.15) + randomOffset

    // 4. DURATION (How "fast" is the walk?)
    // This represents percentage of total page scroll needed to cross screen.
    // 0.4 means the user has to scroll 40% of the page height for the char to cross.
    // This creates consistent speed.
    const durationPct = 0.35 + (Math.random() * 0.1)

    // 5. SIZE & VARIATION
    const randomScale = 0.7 + Math.random() * 0.5
    const speedFactor = 0.8 + Math.random() * 0.4

    // Store Data
    el.setAttribute('data-start', startPct.toFixed(3))
    el.setAttribute('data-duration', durationPct.toFixed(3))
    el.dataset.speedFactor = speedFactor.toString()
    el.style.setProperty('--random-scale', randomScale.toString())

    // Initial State (Hidden)
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

  // Initialize
  setTimeout(() => {
    setRandomInitialPositions()
    handleScroll() // Trigger once to set initial positions
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
  <div class="app-background">
    <!-- Sticky Header -->
    <header class="sticky top-10 z-50">
      <div class="relative w-48 h-32 mx-auto top-title">
        <img
            v-if="isMounted"
            src="/sun.png"
            class="absolute object-contain z-10 sun"
            style="mix-blend-mode: normal; opacity: 1 !important;"
        >
        <img
            v-if="isMounted"
            src="/title_nosun.png"
            class="relative w-full h-full object-contain z-0 title"
            style="mix-blend-mode: normal; opacity: 1 !important;"
        >
      </div>
    </header>

    <!-- Main Content -->
    <main class="z-10">
      <div class="scroll-container h-screen overflow-y-auto relative">

        <div class="absolute top-0 left-0 w-full h-screen flex items-center justify-center pointer-events-none z-0">
          <div class="text-center animate-bounce text-white/50">
            <p class="mb-2 text-sm uppercase tracking-widest">Scroll to explore</p>
            <svg class="w-6 h-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </div>

        <div class="fixed inset-0 pointer-events-none z-20 overflow-hidden">
          <div class="square w-48 h-48">
            <img v-if="isMounted" :src="getCharacterPath(0)" class="w-full h-full object-contain drop-shadow-lg">
          </div>

          <div class="square w-48 h-48">
            <img v-if="isMounted" :src="getCharacterPath(1)" class="w-full h-full object-contain drop-shadow-lg">
          </div>

          <div class="square w-48 h-48">
            <img v-if="isMounted" :src="getCharacterPath(2)" class="w-full h-full object-contain drop-shadow-lg">
          </div>
        </div>

        <div class="w-full h-[400vh]"></div>

      </div>
    </main>
  </div>
</template>

<style scoped>
/* Smooth scrolling */
html {
  scroll-behavior: smooth;
  overflow-x: hidden;
}

.top-title {
  margin: 0 auto;
  position: relative;
  z-index: 1;
  opacity: 1 !important;

  .sun {
    mix-blend-mode: normal;
    opacity: 1 !important;
    height: 45px;
    top: -12px;
    left: 12px;
    animation: spin 10s linear infinite;
    transform-origin: center;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
}


@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.app-background {
  @apply min-h-screen relative;
  background-color: #1e1b4b;
  overflow: hidden;
}

.app-background::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('/background.png'); /* Ensure this path is correct */
  background-size: 300px;
  background-repeat: repeat;
  opacity: 0.6;
  z-index: 0;
  background-blend-mode: overlay;
  pointer-events: none;
}

/* CRITICAL FIX:
   Removed 'transition: transform'
   When JS updates position on every scroll event, CSS transitions cause
   jitters/lag because they try to interpolate between the rapid updates.
*/
.square {
  position: absolute; /* Changed to absolute within the fixed container */
  will-change: transform;
  /* Only transition opacity for smooth fade in/out */
  transition: opacity 0.2s linear;
  left: 0;
  /* Default transform to hide initially */
  transform: translateX(-100vw);
}

/* Hide scrollbars */
.scroll-container::-webkit-scrollbar { display: none; }
.scroll-container {
  -ms-overflow-style: none;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
</style>