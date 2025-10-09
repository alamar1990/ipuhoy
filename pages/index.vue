<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const scrollY = ref(0)
const scrollProgress = ref(0)

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
    const isLeft = index % 2 === 0
    const delay = parseFloat(square.getAttribute('data-delay') || '0')
    const progress = Math.max(0, Math.min(1, (scrollProgress.value - delay) / (1 - delay)))

    if (progress >= 0 && progress <= 1) {
      // Calculate the distance to move (full viewport width + square width)
      const squareWidth = square.offsetWidth
      const totalDistance = viewportWidth + squareWidth

      // Calculate base X position (smooth movement)
      const baseX = isLeft
        ? -squareWidth + (progress * totalDistance)
        : viewportWidth - (progress * totalDistance)

      // Create stepping effect (4 steps across the screen)
      const stepCount = 16
      const stepProgress = progress * stepCount
      const currentStep = Math.floor(stepProgress)
      const stepFrac = stepProgress - currentStep

      // Enhanced vertical bounce effect
      const bounceHeight = 60 // Increased from 30 to 60 pixels
      // Use a more pronounced bounce curve
      const bounceProgress = Math.pow(Math.sin(stepFrac * Math.PI), 0.7)
      const translateY = -bounceHeight * bounceProgress

      // More noticeable rotation during movement
      const rotation = isLeft
        ? -8 + (bounceProgress * 16) // Increased from 5/10 to 8/16
        : 8 - (bounceProgress * 16) // for more dramatic tilt

      // Opacity - fade in at start, stay visible, fade out at end
      const opacity = progress < 0.1
        ? progress * 10
        : progress > 0.9 ? (1 - progress) * 10 : 1

      // Apply all transforms
      square.style.transform = `translateX(${baseX}px) translateY(${translateY}px) rotate(${rotation}deg)`
      square.style.opacity = `${1}`

      // Optional: Add a shadow that changes with the bounce
      square.style.filter = `drop-shadow(0 ${5 + (bounceProgress * 10)}px 5px rgba(0,0,0,0.3))`
    }
  })
}

onMounted(() => {
  const scrollContainer = document.querySelector('.scroll-container')
  if (scrollContainer) {
    scrollContainer.addEventListener('scroll', handleScroll)
  }
  // Initial position update
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
    <div class="scroll-container h-screen overflow-y-auto">
      <div class="space-y-0">
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
          <!-- Character 1 - Left to Right -->
          <div
            class="fixed top-1/4 left-0 w-48 h-48 square"
            data-distance="1200"
            data-delay="0"
          >
            <img
              src="/character2_no_back.png"
              alt="Character 1"
              class="w-full h-full object-contain"
            >
          </div>

          <!-- Character 2 - Right to Left -->
          <div
            class="fixed top-2/4 right-0 w-42 h-42 square"
            data-distance="1000"
            data-delay="0.2"
          >
            <img
              src="/character2_no_back.png"
              alt="Character 2"
              class="w-full h-full object-contain"
            >
          </div>

          <!-- Character 3 - Left to Right -->
          <div
            class="fixed top-3/4 left-0 w-48 h-48 square"
            data-distance="800"
            data-delay="0.4"
          >
            <img
              src="/character3_no_back.png"
              alt="Character 3"
              class="w-full h-full object-contain"
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
</style>

<style scoped>
/* Smooth scrolling */
html {
  scroll-behavior: smooth;
  overflow-x: hidden;
}

/* Animation styles */
.square {
  will-change: transform, opacity, filter;
  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.3s ease-out,
              filter 0.15s ease-out;
  opacity: 0;
  position: fixed;
  z-index: 10;
  transform-origin: bottom center;
}

/* Set initial positions for squares */
.square:nth-child(1) {
  transform: translateX(-100%);
  top: 25%;
  left: 0;
}

.square:nth-child(2) {
  transform: translateX(100%);
  top: 50%;
  right: 0;
}

.square:nth-child(3) {
  transform: translateX(-100%);
  top: 75%;
  left: 0;
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
