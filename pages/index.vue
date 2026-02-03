<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'

const visibleSections = ref<Set<string>>(new Set())
const contactForm = ref({ name: '', email: '', message: '' })

// Modal State
const isModalOpen = ref(false)
const selectedImage = ref<string | null>(null)
const selectedTitle = ref('')

// Data Fetching
const { data: rawArtworks } = await useFetch('/api/artworks')

const tones = [
  "shadow-orange-900/50", "shadow-teal-900/50", "shadow-amber-900/50",
  "shadow-rose-900/50", "shadow-purple-900/50", "shadow-emerald-900/50"
]

const artworks = computed(() => {
  if (!rawArtworks.value) return []
  // Slice to first 4
  return rawArtworks.value.slice(0, 4).map((file, index) => {
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

const handleContact = () => {
  const { name, email, message } = contactForm.value
  const subject = encodeURIComponent(`Portfolio Contact from ${name}`)
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)
  window.location.href = `mailto:ipuhoy@gmail.com?subject=${subject}&body=${body}`
}

// Simple Intersection Observer for 'reveal' animations
const setupObserver = () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) visibleSections.value.add(entry.target.id)
    })
  }, { threshold: 0.15 })
  document.querySelectorAll('section').forEach((el) => observer.observe(el))
}

onMounted(() => {
  setTimeout(setupObserver, 100)
})
</script>

<template>
  <div>
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
        <h2 class="section-title text-5xl md:text-7xl text-center mb-24 text-[#cc5500] drop-shadow-md opacity-0 translate-y-10 transition-all duration-1000" :class="{ '!translate-y-0 !opacity-100': visibleSections.has('artworks') }">
          ARTWORKS
        </h2>

        <div v-if="artworks.length === 0" class="text-center text-white/50 text-xl font-sans">
          No artworks found in /public/artworks
        </div>

        <div v-else>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 md:gap-10 mb-16">
            <div v-for="(art, index) in artworks" :key="art.id"
                 class="group cursor-pointer hover:z-50"
                 :style="{ transitionDelay: `${index * 150}ms` }"
                 @click="openModal(art.image, art.title)">

              <div class="relative p-[14px] bg-[#8B3A28] rounded-[24px] shadow-2xl overflow-hidden tribal-border-texture transition-transform duration-300 hover:scale-105"
                   :style="{ transform: `rotate(${art.rot}) translateY(${art.y})` }">

                <div class="absolute inset-[6px] rounded-[18px] border-[4px] border-[#3E2723] z-10 pointer-events-none"></div>
                <div class="absolute top-0 left-0 w-8 h-8 z-20 bg-[#D4A373] clip-triangle-tl"></div>
                <div class="absolute top-0 right-0 w-8 h-8 z-20 bg-[#D4A373] clip-triangle-tr"></div>
                <div class="absolute bottom-0 left-0 w-8 h-8 z-20 bg-[#D4A373] clip-triangle-bl"></div>
                <div class="absolute bottom-0 right-0 w-8 h-8 z-20 bg-[#D4A373] clip-triangle-br"></div>

                <div class="relative z-10 bg-[#1a1614] rounded-[14px] aspect-[3/4] overflow-hidden shadow-inner border-[2px] border-[#5D4037]">
                  <NuxtImg :src="art.image" :alt="art.title" loading="lazy" format="webp" class="w-full h-full object-cover opacity-70 mix-blend-luminosity group-hover:opacity-100 group-hover:mix-blend-normal transition-all duration-500" />
                  <div class="absolute bottom-0 w-full p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent text-center">
                    <h3 class="text-xl text-[#F5DEB3] tracking-wider font-bold drop-shadow-md">{{ art.title }}</h3>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="text-center opacity-0 translate-y-10 transition-all duration-1000 delay-500" :class="{ '!translate-y-0 !opacity-100': visibleSections.has('artworks') }">
            <NuxtLink to="/gallery" class="inline-block px-12 py-4 bg-[#a53b19] text-[#f0e6d2] text-2xl tracking-widest hover:bg-[#c2410c] hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg border-y-2 border-[#f0e6d2]/30 rounded-lg group relative">
              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">✦</span>
              ENTER GALLERY
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 text-sm">✦</span>
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <section id="contact" class="min-h-[80vh] flex flex-col items-center justify-center relative z-30 px-4 pb-32">
      <h2 class="section-title text-5xl md:text-7xl text-center mb-12 text-[#cc5500] drop-shadow-md opacity-0 translate-y-10 transition-all duration-1000" :class="{ '!translate-y-0 !opacity-100': visibleSections.has('contact') }">
        CONTACT
      </h2>

      <div class="w-full max-w-xl opacity-0 translate-y-10 transition-all duration-1000 delay-300 contact-form-container" :class="{ '!translate-y-0 !opacity-100': visibleSections.has('contact') }">
        <form class="space-y-6" @submit.prevent="handleContact">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div class="space-y-1"><input v-model="contactForm.name" type="text" placeholder="Name" class="puhoy-input" required></div>
            <div class="space-y-1"><input v-model="contactForm.email" type="email" placeholder="Email" class="puhoy-input" required></div>
          </div>
          <div class="space-y-1"><textarea v-model="contactForm.message" rows="4" placeholder="Message" class="puhoy-input resize-none" required></textarea></div>
          <div class="pt-4 flex justify-center"><button type="submit" class="group relative px-12 py-3 bg-[#a53b19] text-[#f0e6d2] text-2xl tracking-widest hover:bg-[#c2410c] hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg border-y-2 border-[#f0e6d2]/30 rounded-lg"><span>SEND</span></button></div>
        </form>
      </div>
    </section>

    <ImageModal
        :isOpen="isModalOpen"
        :imageSrc="selectedImage"
        :title="selectedTitle"
        @close="isModalOpen = false"
    />
  </div>
</template>