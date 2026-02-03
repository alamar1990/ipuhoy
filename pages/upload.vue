<script setup lang="ts">
import { onMounted, ref } from 'vue'

// --- State ---
const isMounted = ref(false)
const characterIndices = ref<number[]>([])
const uploading = ref(false)
const uploadStatus = ref('')
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
// NEW: State for the custom name
const artworkName = ref('')

// --- FETCH EXISTING ARTWORKS ---
const { data: existingArtworks, refresh: refreshGallery } = await useFetch('/api/artworks', {
  key: 'gallery-list'
})

// --- File Handling ---
const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file)
    // Auto-fill name based on filename (removing extension)
    artworkName.value = file.name.replace(/\.[^/.]+$/, "")
    uploadStatus.value = ''
  }
}

const handleUpload = async () => {
  if (!selectedFile.value) return

  if (!artworkName.value.trim()) {
    uploadStatus.value = '⚠️ The artifact requires a name!'
    return
  }

  uploading.value = true
  uploadStatus.value = 'Summoning artifact...'

  const formData = new FormData()
  formData.append('file', selectedFile.value)
  // NEW: Append the custom name
  formData.append('name', artworkName.value)

  try {
    await $fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    uploadStatus.value = '✨ Artifact successfully sealed in the gallery! ✨'
    await refreshGallery()

    setTimeout(() => {
      selectedFile.value = null
      previewUrl.value = null
      artworkName.value = '' // Reset name
      uploadStatus.value = ''
    }, 3000)
  } catch (error) {
    uploadStatus.value = '❌ The summoning failed. Check the console.'
  } finally {
    uploading.value = false
  }
}

// --- DELETE LOGIC ---
const deletingId = ref<string | null>(null)

const handleDelete = async (filename: string) => {
  if (!confirm('Are you sure you want to vanish this artifact forever?')) return

  deletingId.value = filename

  try {
    await $fetch('/api/artworks', {
      method: 'DELETE',
      body: { filename }
    })
    await refreshGallery()
  } catch (error) {
    alert('Failed to banish artifact')
  } finally {
    deletingId.value = null
  }
}

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

onMounted(() => {
  characterIndices.value = generateRandomIndices()
  isMounted.value = true
})
</script>

<template>
  <div class="app-background font-handwritten text-slate-100 min-h-screen">

    <header class="fixed top-0 left-0 w-full z-50 pointer-events-none">
      <div class="relative w-48 h-32 mx-auto top-title filter drop-shadow-xl mt-4">
        <img v-if="isMounted" src="/sun.png" class="absolute object-contain z-10 sun">
        <img v-if="isMounted" src="/title_nosun.png" class="relative w-full h-full object-contain z-20 title">
      </div>
    </header>

    <main class="z-10 w-full min-h-screen flex flex-col items-center pt-32 pb-20 overflow-y-auto">

      <div class="w-full max-w-2xl px-4 animate-fade-in-up mb-20">
        <h2 class="section-title text-5xl md:text-7xl text-center mb-12 text-[#cc5500] drop-shadow-md">
          SUMMON ART
        </h2>

        <div class="relative p-[18px] bg-[#8B3A28] rounded-[24px] shadow-2xl tribal-border-texture">
          <div class="absolute inset-[6px] rounded-[18px] border-[4px] border-[#3E2723] z-10 pointer-events-none"></div>
          <div class="absolute top-0 left-0 w-10 h-10 z-20 bg-[#D4A373] clip-triangle-tl"></div>
          <div class="absolute top-0 right-0 w-10 h-10 z-20 bg-[#D4A373] clip-triangle-tr"></div>
          <div class="absolute bottom-0 left-0 w-10 h-10 z-20 bg-[#D4A373] clip-triangle-bl"></div>
          <div class="absolute bottom-0 right-0 w-10 h-10 z-20 bg-[#D4A373] clip-triangle-br"></div>

          <div class="relative z-20 bg-[#1a1614] rounded-[14px] p-8 min-h-[400px] flex flex-col items-center justify-center border-[2px] border-[#5D4037]">

            <div v-if="previewUrl" class="w-full h-full flex flex-col items-center space-y-6">
              <div class="relative w-64 h-64 rounded-xl overflow-hidden border-4 border-[#cc5500] shadow-[0_0_20px_rgba(204,85,0,0.3)]">
                <img :src="previewUrl" class="w-full h-full object-cover">
              </div>

              <div class="w-full max-w-xs space-y-4">
                <div class="space-y-1">
                  <label class="text-[#F5DEB3] text-xs font-bold tracking-widest uppercase ml-1">Name of Artifact</label>
                  <input
                      v-model="artworkName"
                      type="text"
                      placeholder="e.g. The Ancient One"
                      class="w-full bg-[#3E2723]/80 border-2 border-[#5D4037] text-[#F5DEB3] rounded-lg p-3 outline-none focus:border-[#cc5500] transition-colors text-center font-sans placeholder-[#F5DEB3]/30"
                  >
                </div>

                <div class="flex gap-4 justify-center pt-2">
                  <button @click="selectedFile = null; previewUrl = null" class="px-6 py-2 bg-[#3E2723] text-[#F5DEB3] rounded-lg hover:bg-[#5D4037] transition-colors text-sm font-bold tracking-wider">CANCEL</button>
                  <button @click="handleUpload" :disabled="uploading" class="px-6 py-2 bg-[#cc5500] text-white rounded-lg hover:bg-[#ff6b00] transition-colors shadow-lg disabled:opacity-50 text-sm font-bold tracking-wider">
                    {{ uploading ? 'SUMMONING...' : 'CONFIRM' }}
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="text-center space-y-6">
              <div class="w-32 h-32 mx-auto border-4 border-dashed border-[#5D4037] rounded-full flex items-center justify-center text-4xl text-[#5D4037] group-hover:border-[#cc5500] group-hover:text-[#cc5500] transition-colors relative">
                <input type="file" accept="image/*" @change="handleFileSelect" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30">
                <span class="pointer-events-none">📤</span>
              </div>
              <div>
                <h3 class="text-2xl text-[#F5DEB3] mb-2">Drop Artifact Here</h3>
                <p class="text-[#F5DEB3]/60 font-sans">or click to browse your inventory</p>
              </div>
            </div>

            <div v-if="uploadStatus" class="mt-6 text-xl font-bold animate-pulse" :class="uploadStatus.includes('failed') || uploadStatus.includes('requires') ? 'text-red-400' : 'text-green-400'">
              {{ uploadStatus }}
            </div>
          </div>
        </div>
      </div>

      <div class="w-full max-w-5xl px-4 animate-fade-in-up pb-20">
        <h2 class="section-title text-4xl md:text-5xl text-center mb-8 text-[#a53b19] drop-shadow-md">
          VANISH ARTIFACTS
        </h2>

        <div v-if="!existingArtworks || existingArtworks.length === 0" class="text-center text-[#F5DEB3]/50">
          No artifacts found in the gallery.
        </div>

        <div v-else class="flex flex-wrap justify-center gap-4">
          <div
              v-for="art in existingArtworks"
              :key="art.filename"
              class="relative group w-20"
          >
            <div class="relative bg-[#3E2723] rounded-lg p-1.5 shadow-md border border-[#5D4037] hover:border-[#cc5500] transition-all hover:scale-105 hover:z-10">
              <div class="relative aspect-square rounded-md overflow-hidden bg-black/40 mb-1.5">
                <NuxtImg
                    :src="art.path"
                    class="w-full h-full object-cover"
                    :alt="art.title"
                    loading="lazy"
                    width="80"
                    height="80"
                />

                <div class="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
                  <button
                      @click="handleDelete(art.filename)"
                      :disabled="deletingId === art.filename"
                      class="bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center hover:bg-red-700 transition-colors shadow-lg border border-red-400"
                      title="Banish Artifact"
                  >
                    <span v-if="deletingId === art.filename" class="animate-spin text-[10px]">↻</span>
                    <span v-else class="text-xs font-bold">✕</span>
                  </button>
                </div>
              </div>
              <div class="text-center px-0.5">
                <h3 class="text-[#F5DEB3] text-[10px] font-sans truncate leading-tight">{{ art.title }}</h3>
              </div>
            </div>
          </div>
        </div>

        <div class="text-center mt-12">
          <NuxtLink to="/" class="text-[#F5DEB3]/50 hover:text-[#F5DEB3] transition-colors text-lg font-sans flex items-center justify-center gap-2">
            <span>❮</span> Return to Gallery
          </NuxtLink>
        </div>
      </div>

    </main>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Patrick+Hand+SC&family=Fredoka:wght@400;600&display=swap');

.font-handwritten { font-family: 'Patrick Hand SC', cursive; }
.font-sans { font-family: 'Fredoka', sans-serif; }

.app-background {
  @apply min-h-screen relative;
  background-color: #1e1b4b;
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

.section-title {
  -webkit-text-stroke: 1px #4a2c10;
  text-shadow: 2px 2px 0px rgba(0,0,0,0.5);
}

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