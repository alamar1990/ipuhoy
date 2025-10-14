<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const scrollY = ref(0)
const scrollProgress = ref(0)
const isMounted = ref(false)
const characterIndices = ref<number[]>([])

// Generate unique random indices on client side only
const generateRandomIndices = () => {
  // Create array of all possible character indices (1-6)
  const allIndices = Array.from({ length: 6 }, (_, i) => i + 1)

  // Shuffle the array using Fisher-Yates algorithm
  for (let i = allIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]]
  }
  
  // Return first 3 unique indices
  return allIndices.slice(0, 3)
}


// Get character path by index
const getCharacterPath = (index: number) => {
  return `/character${characterIndices.value[index] || 1}_no_back.png`
}

const handleScroll = () => {
  const scrollContainer = document.querySelector('.scroll-container')
  if (!scrollContainer) return

  const { scrollTop, scrollHeight, clientHeight } = scrollContainer
  const maxScroll = scrollHeight - clientHeight
  scrollY.value = scrollTop
  scrollProgress.value = Math.min(scrollTop / maxScroll, 1)

  // Get viewport width for responsive movement
  const viewportWidth = window.innerWidth

  // Update square positions based on scroll
  const squares = document.querySelectorAll('.square')
  squares.forEach((square, index) => {
    const squareWidth = square.offsetWidth // Get the actual width of the current square
    const isLeft = index % 2 === 0
    const delay = parseFloat(square.getAttribute('data-delay') || '0')
    const progress = Math.max(0, Math.min(1, (scrollProgress.value - delay) / (1 - delay)))

    if (progress >= 0 && progress <= 1) {
      // Calculate the distance to move (shorter distance for better visibility)
      const squareWidth = square.offsetWidth
      const totalDistance = viewportWidth * 0.6 + squareWidth // Reduced to 60% of viewport width

      // Calculate base X position (smooth movement)
      // const baseX = isLeft
      //   ? -squareWidth + (progress * totalDistance)
      //   : viewportWidth - (progress * totalDistance)

      // Create stepping effect (fewer steps for more fluid movement)
      const stepCount = 6
      const stepProgress = progress * stepCount
      const currentStep = Math.floor(stepProgress)
      const stepFrac = stepProgress - currentStep
      // Get random properties for this square
      const bounceHeight = parseFloat(square.dataset.bounceHeight || '60')
      const rotationFactor = parseFloat(square.dataset.rotationFactor || '1')
      const horizontalOffset = parseFloat(square.dataset.horizontalOffset || '0')
      const speedFactor = parseFloat(square.dataset.speedFactor || '1')

      // Adjust progress based on speed factor and ensure it stays within bounds
      const adjustedProgress = Math.min(1, Math.max(0, progress * speedFactor))

      // Enhanced vertical bounce effect with random height
      const bounceProgress = Math.pow(Math.sin(stepFrac * Math.PI), 0.4 + (Math.random() * 0.3 - 0.15))
      const translateY = -bounceHeight * bounceProgress

      // Dynamic rotation based on bounce and random factor
      const baseRotation = 10 * rotationFactor
      const rotation = isLeft
        ? -baseRotation + (bounceProgress * baseRotation * 2)
        : baseRotation - (bounceProgress * baseRotation * 2)

      // Calculate start and end points with reduced travel distance
      const travelDistance = viewportWidth * 0.7 // Only travel 70% of the viewport width
      const startX = isLeft ? -squareWidth : viewportWidth - travelDistance
      const endX = isLeft ? travelDistance : -squareWidth

      // Calculate base X position with easing for smoother movement
      const easedProgress = easeInOutCubic(adjustedProgress)
      const baseX = startX + (endX - startX) * easedProgress

      // Opacity - fade in at start, stay visible, fade out at end
      const opacity = progress < 0.1
        ? progress * 10
        : progress > 0.9 ? (1 - progress) * 10 : 1

      // Get current scale from CSS variable with fallback to 1
      const currentScale = parseFloat(square.style.getPropertyValue('--random-scale') || '1')

      // Apply all transforms with random scale and horizontal offset
      square.style.transform = `
        translateX(${baseX + horizontalOffset}px)
        translateY(${translateY}px)
        rotate(${rotation}deg)
        scale(${currentScale})
      `
      // Add subtle shadow that changes with bounce
      const shadowY = 5 + (bounceProgress * 15)
      square.style.filter = `drop-shadow(0 ${shadowY}px 8px rgba(0,0,0,${0.2 + bounceProgress * 0.2}))`
      square.style.opacity = `${1}`

      // Optional: Add a shadow that changes with the bounce
      square.style.filter = `drop-shadow(0 ${5 + (bounceProgress * 10)}px 5px rgba(0,0,0,0.3))`
    }
  })
}

const setRandomInitialPositions = () => {
  const squares = document.querySelectorAll('.square')
  squares.forEach((square) => {
    // Random position between 10% and 70% of viewport height
    const randomTop = 10 + Math.random() * 60
    // Random side (0 for left, 1 for right)
    const isLeft = Math.random() > 0.5
    // Random delay between 0 and 1 second for staggered start
    const randomDelay = (Math.random() * 1).toFixed(2)
    // Random scale between 0.6 and 1.2 for depth effect
    const randomScale = 0.6 + Math.random() * 0.6
    // Random bounce height between 40 and 100
    const bounceHeight = 40 + Math.random() * 60
    // Random rotation factor for more dynamic movement
    const rotationFactor = 0.5 + Math.random() * 2
    // Random horizontal offset (-20 to 20px)
    const horizontalOffset = (Math.random() * 40 - 20).toFixed(1)
    // Random animation speed factor (0.8x to 1.5x)
    const speedFactor = 0.8 + Math.random() * 0.7

    // Store custom properties for animation
    square.dataset.bounceHeight = bounceHeight
    square.dataset.rotationFactor = rotationFactor
    square.dataset.horizontalOffset = horizontalOffset
    square.dataset.speedFactor = speedFactor

    // Apply random values
    square.style.top = `${randomTop}%`
    square.style.left = isLeft ? '0' : 'auto'
    square.style.right = isLeft ? 'auto' : '0'
    square.style.setProperty('--random-scale', randomScale)
    square.style.setProperty('--speed-factor', speedFactor)
    square.setAttribute('data-delay', randomDelay)

    // Calculate initial position completely off-screen
    const startX = isLeft ? -square.offsetWidth : window.innerWidth
    const transform = `translateX(${startX + parseFloat(horizontalOffset)}px) scale(${randomScale})`
    square.style.transform = transform
  })
}

// Easing function for smoother animation
const easeInOutCubic = (t) => {
  return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
}

onMounted(() => {
  // Generate random indices on client side only
  characterIndices.value = generateRandomIndices()
  isMounted.value = true
  
  const scrollContainer = document.querySelector('.scroll-container')
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', handleScroll, { passive: true })
  }
  
  // Set random positions first, then handle initial scroll
  setRandomInitialPositions()
  handleScroll()
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
    <div class="relative w-48 h-48 top-title">
      <img
          v-if="isMounted"
          :src="`/sun.png`"
          class="absolute object-contain z-10 sun"
          style="mix-blend-mode: normal; opacity: 1 !important;"
      >
      <img
          v-if="isMounted"
          :src="`/title_nosun.png`"
          class="relative w-full h-full object-contain z-0"
          style="mix-blend-mode: normal; opacity: 1 !important;"
      >
    </div>
    <div class="relative w-full flex justify-center">

    <div class="scroll-container h-screen overflow-y-auto">

        <!-- Hero Section -->
        <div class="min-h-screen flex items-center justify-center relative overflow-hidden">
          <div class="text-center z-10">
            <div class="animate-bounce text-white">
              <svg
                class="w-10 h-10 mx-auto"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            </div>
          </div>
        </div>

        <!-- Parallax Squares -->
        <div class="min-h-[150vh] relative">
          <!-- Character 1 - Random position -->
          <div
            class="w-48 h-48 square"
            data-distance="1200"
          >
            <img
              v-if="isMounted"
              :src="getCharacterPath(0)"
              alt="Character 1"
              class="w-full h-full object-contain"
              key="char-1"
            >
          </div>

          <!-- Character 2 - Random position -->
          <div
            class="w-48 h-48 square"
            data-distance="1000"
          >
            <img
              v-if="isMounted"
              :src="getCharacterPath(1)"
              alt="Character 2"
              class="w-full h-full object-contain"
              key="char-2"
            >
          </div>

          <!-- Character 3 - Random position -->
          <div
            class="w-48 h-48 square"
            data-distance="800"
          >
            <img
              v-if="isMounted"
              :src="getCharacterPath(2)"
              alt="Character 3"
              class="w-full h-full object-contain"
              key="char-3"
            >
          </div>

          <!-- Content to create scroll space -->
          <div class="h-[300vh] w-full" />
        </div>
      </div>
    </div>
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
    top: 14px;
    left: 10px;
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



.app-background {
  @apply min-h-screen relative;
  background-color: #1e1b4b;
}

.app-background::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('/background.png');
  background-size: 300px; /* Adjust this value to control the size of each repeated tile */
  background-repeat: repeat;
  background-position: center center;
  opacity: 0.6; /* Adjust this value to control the visibility of the pattern */
  z-index: 0;
  background-blend-mode: overlay;
}

/* Animation styles */
.square {
  will-change: transform, opacity, filter;
  transition:
    transform calc(0.25s * var(--speed-factor, 1)) cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity calc(0.4s * var(--speed-factor, 1)) ease-out,
    filter calc(0.2s * var(--speed-factor, 1)) ease-out;
  opacity: 0;
  position: fixed;
  z-index: 10;
  pointer-events: none;
  transform-origin: bottom center;
  backface-visibility: hidden;
}

/* Initial positions will be set by JavaScript */
.square {
  position: fixed;
  opacity: 0;
}

/* Parallax effect */
.fixed {
  transition: transform 0.1s ease-out, opacity 0.1s ease-out;
}

/* Hide scrollbar for Chrome, Safari and Opera */
.scroll-container::-webkit-scrollbar {
  display: none;
}

/* Hide scrollbar for IE, Edge and Firefox */
.scroll-container {
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
}

/* Ensure the scroll container takes full height */
.scroll-container {
  -webkit-overflow-scrolling: touch;
}
</style>
