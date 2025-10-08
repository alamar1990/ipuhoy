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

      // Calculate translateX based on progress and screen width
      const translateX = isLeft
        ? -squareWidth + (progress * totalDistance) // Move from left to right
        : viewportWidth - (progress * totalDistance) // Move from right to left

      // Calculate opacity based on progress (fade in as it enters, fade out as it exits)
      const opacity = progress < 0.5
        ? progress * 2 // Fade in during first half
        : 2 - (progress * 2) // Fade out during second half

      square.style.transform = `translateX(${translateX}px)`
      square.style.opacity = `${opacity}`
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
  <div class="min-h-screen bg-gradient-to-b from-blue-950 to-purple-900">
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
          <!-- Square 1 - Left to Right -->
          <div
            class="fixed top-1/4 left-0 w-32 h-32 bg-blue-500 square rounded-lg shadow-lg"
            data-distance="1200"
            data-delay="0"
          >
            <div class="absolute inset-0 flex items-center justify-center text-white font-bold text-lg">
              1
            </div>
          </div>

          <!-- Square 2 - Right to Left -->
          <div
            class="fixed top-2/4 right-0 w-40 h-40 bg-green-500 square rounded-lg shadow-lg"
            data-distance="1000"
            data-delay="0.2"
          >
            <div class="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">
              2
            </div>
          </div>

          <!-- Square 3 - Left to Right -->
          <div
            class="fixed top-3/4 left-0 w-48 h-48 bg-purple-500 square rounded-lg shadow-lg"
            data-distance="800"
            data-delay="0.4"
          >
            <div class="absolute inset-0 flex items-center justify-center text-white font-bold text-2xl">
              3
            </div>
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

/* Animation styles */
.square {
  will-change: transform, opacity;
  transition: transform 0.1s ease-out, opacity 0.1s ease-out;
  opacity: 0;
  position: fixed;
  z-index: 10;
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
