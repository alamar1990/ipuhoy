<script setup lang="ts">
import { ref, computed } from 'vue'

const isModalOpen = ref(false)
const selectedImage = ref<string | null>(null)
const selectedTitle = ref('')

const { data: rawArtworks } = await useFetch('/api/artworks')

const tones = [
  "shadow-orange-900/50", "shadow-teal-900/50", "shadow-amber-900/50",
  "shadow-rose-900/50", "shadow-purple-900/50", "shadow-emerald-900/50"
]

const artworks = computed(() => {
  if (!rawArtworks.value) return []
  return rawArtworks.value.map((file, index) => {
    const seed = index * 1337
    const rot = `${((seed % 10) - 5).toFixed(1)}deg`
    const y = `${(seed % 60) - 30}px`
    const tone = tones[index % tones.length]
    return { ...file, id: index, image: file.path, tone, rot, y }
  })
})

const openModal = (image: string, title: string) => {
  selectedImage.value = image
  selectedTitle.value = title
  isModalOpen.value = true
}
</script>

<template>
  <div class="min-h-screen pt-32 pb-20">
    <div class="max-w-7xl mx-auto px-4">
      <div class="text-center mb-16">
        <h1 class="text-5xl md:text-7xl text-[#cc5500] drop-shadow-md mb-4 section-title">FULL GALLERY</h1>
        <NuxtLink to="/" class="text-[#F5DEB3]/50 hover:text-[#F5DEB3] transition-colors text-lg font-sans">❮ Return Home </NuxtLink>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 md:gap-12 px-4">
        <div v-for="(art, index) in artworks" :key="art.id"
             class="group cursor-pointer hover:z-50 transition-all duration-500"
             :style="{ transform: `rotate(${art.rot})` }"
             @click="openModal(art.image, art.title)">

          <div class="relative p-[14px] bg-[#8B3A28] rounded-[24px] shadow-2xl overflow-hidden tribal-border-texture transition-transform duration-300 hover:scale-105">
            <div class="absolute inset-[6px] rounded-[18px] border-[4px] border-[#3E2723] z-10 pointer-events-none"></div>
            <div class="absolute top-0 left-0 w-8 h-8 z-20 bg-[#D4A373] clip-triangle-tl"></div>
            <div class="absolute top-0 right-0 w-8 h-8 z-20 bg-[#D4A373] clip-triangle-tr"></div>
            <div class="absolute bottom-0 left-0 w-8 h-8 z-20 bg-[#D4A373] clip-triangle-bl"></div>
            <div class="absolute bottom-0 right-0 w-8 h-8 z-20 bg-[#D4A373] clip-triangle-br"></div>

            <div class="relative z-10 bg-[#1a1614] rounded-[14px] aspect-[3/4] overflow-hidden shadow-inner border-[2px] border-[#5D4037]">
              <NuxtImg :src="art.image" loading="lazy" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
              <div class="absolute bottom-0 w-full p-3 bg-gradient-to-t from-black/90 to-transparent text-center">
                <h3 class="text-xl text-[#F5DEB3] tracking-wider font-bold">{{ art.title }}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <ImageModal
        :isOpen="isModalOpen"
        :imageSrc="selectedImage"
        :title="selectedTitle"
        @close="isModalOpen = false"
    />
  </div>
</template>