<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  isOpen: boolean
  imageSrc: string | null
  title: string
}>()

const emit = defineEmits(['close'])

const scale = ref(1)
const pan = ref({ x: 0, y: 0 })
const isDragging = ref(false)
const startPos = ref({ x: 0, y: 0 })

// Reset view when modal opens
watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    scale.value = 1
    pan.value = { x: 0, y: 0 }
    document.body.style.overflow = 'hidden' // Lock scroll
  } else {
    document.body.style.overflow = '' // Unlock scroll
  }
})

const close = () => emit('close')

// --- Zoom Logic ---
const handleWheel = (e: WheelEvent) => {
  e.preventDefault()
  const delta = e.deltaY > 0 ? 0.9 : 1.1
  const newScale = Math.min(Math.max(0.5, scale.value * delta), 5) // Min 0.5x, Max 5x
  scale.value = newScale
}

// --- Pan Logic (Mouse & Touch) ---
const startDrag = (clientX: number, clientY: number) => {
  isDragging.value = true
  startPos.value = { x: clientX - pan.value.x, y: clientY - pan.value.y }
}

const onDrag = (clientX: number, clientY: number) => {
  if (!isDragging.value) return
  pan.value = { x: clientX - startPos.value.x, y: clientY - startPos.value.y }
}

const stopDrag = () => {
  isDragging.value = false
}

// Mouse Events
const onMouseDown = (e: MouseEvent) => startDrag(e.clientX, e.clientY)
const onMouseMove = (e: MouseEvent) => onDrag(e.clientX, e.clientY)
const onMouseUp = () => stopDrag()

// Touch Events
const onTouchStart = (e: TouchEvent) => {
  if (e.touches.length === 1) startDrag(e.touches[0].clientX, e.touches[0].clientY)
}
const onTouchMove = (e: TouchEvent) => {
  if (e.touches.length === 1) onDrag(e.touches[0].clientX, e.touches[0].clientY)
}
const onTouchEnd = () => stopDrag()

</script>

<template>
  <Teleport to="body">
    <Transition name="fade">
      <div
          v-if="isOpen"
          class="fixed inset-0 z-[999] bg-black/95 backdrop-blur-md flex items-center justify-center overflow-hidden"
          @wheel="handleWheel"
      >
        <div class="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-50 pointer-events-none">
          <h3 class="text-[#F5DEB3] text-xl font-handwritten drop-shadow-md pl-4">{{ title }}</h3>
          <button
              @click="close"
              class="pointer-events-auto bg-red-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold hover:bg-red-700 transition-transform hover:scale-110 shadow-lg border border-red-400"
          >
            ✕
          </button>
        </div>

        <div
            class="cursor-grab active:cursor-grabbing w-full h-full flex items-center justify-center"
            @mousedown="onMouseDown"
            @mousemove="onMouseMove"
            @mouseup="onMouseUp"
            @mouseleave="onMouseUp"
            @touchstart="onTouchStart"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
        >
          <img
              :src="imageSrc || ''"
              class="max-w-none transition-transform duration-75 ease-linear select-none object-contain max-h-[90vh] max-w-[90vw]"
              :style="{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`
            }"
              draggable="false"
          />
        </div>

        <div class="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/30 text-sm font-sans pointer-events-none animate-pulse">
          Scroll to Zoom • Drag to Pan
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.font-handwritten { font-family: 'Patrick Hand SC', cursive; }
</style>