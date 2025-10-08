<script setup lang="ts">
import { onMounted } from 'vue'

import { animate, createTimer, createTimeline, utils, onScroll } from 'animejs'

onMounted(() => {
  const [container] = utils.$('.scroll-container')
  const debug = true

  // Animation

  animate('.square', {
    x: '15rem',
    rotate: '1turn',
    duration: 2000,
    alternate: true,
    loop: true,
    autoplay: onScroll({ container, debug }),
  })

  // Timer

  const [$timer] = utils.$('.timer')

  createTimer({
    duration: 2000,
    alternate: true,
    loop: true,
    onUpdate: (self) => {
      $timer.innerHTML = self.iterationCurrentTime
    },
    autoplay: onScroll({
      target: $timer.parentNode,
      container,
      debug,
    }),
  })

  // Timeline

  const circles = utils.$('.circle')

  createTimeline({
    alternate: true,
    loop: true,
    autoplay: onScroll({
      target: circles[0],
      container,
      debug,
    }),
  })
    .add(circles[2], { x: '9rem' })
    .add(circles[1], { x: '9rem' })
    .add(circles[0], { x: '9rem' })
})
</script>

<template>
  <div class="min-h-screen bg-blue-950">
    <div class="scroll-container h-screen overflow-y-auto">
      <div class="space-y-20">
        <!-- Scroll down indicator -->
        <div class="min-h-[80vh] flex items-center justify-center">
          <div class="text-center">
            <div class="text-2xl font-semibold text-gray-700 mb-4">
              Scroll down to see animations
            </div>
            <div class="animate-bounce text-gray-500">
              <svg
                class="w-8 h-8 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
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

        <!-- Square animation -->
        <div class="min-h-[100vh] flex items-center justify-center">
          <div class="w-20 h-20 bg-blue-500 square" />
        </div>

        <!-- Timer -->
        <div class="min-h-[100vh] flex items-center justify-center">
          <div class="text-center">
            <div class="text-lg font-medium text-gray-700 mb-2">
              Timer
            </div>
            <div class="text-4xl font-mono bg-gray-100 p-4 rounded-lg inline-block min-w-[120px]">
              <span class="timer">0.00</span>
            </div>
          </div>
        </div>

        <!-- Circles timeline -->
        <div class="min-h-[100vh] flex items-center justify-center">
          <div class="flex space-x-8">
            <div
              v-for="i in 3"
              :key="i"
              class="w-16 h-16 bg-green-500 rounded-full circle"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Smooth scrolling */
html {
  scroll-behavior: smooth;
}

/* Animation styles */
.square {
  transition: transform 0.3s ease;
}

/* Ensure the scroll container takes full height */
.scroll-container {
  -webkit-overflow-scrolling: touch;
}
</style>
