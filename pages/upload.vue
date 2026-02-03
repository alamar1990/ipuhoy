<script setup lang="ts">
import { ref } from 'vue'

const uploading = ref(false)
const uploadStatus = ref('')
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const artworkName = ref('')
const deletingId = ref<string | null>(null)

// Use a specific key to avoid hydration mismatches or stale data on this specific page
const { data: existingArtworks, refresh: refreshGallery } = await useFetch('/api/artworks', { key: 'upload-list' })

const handleFileSelect = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    selectedFile.value = file
    previewUrl.value = URL.createObjectURL(file)
    artworkName.value = file.name.replace(/\.[^/.]+$/, "")
    uploadStatus.value = ''
  }
}

const handleUpload = async () => {
  if (!selectedFile.value) return
  if (!artworkName.value.trim()) { uploadStatus.value = '⚠️ Name required!'; return }

  uploading.value = true
  uploadStatus.value = 'Summoning...'
  const formData = new FormData()
  formData.append('file', selectedFile.value)
  formData.append('name', artworkName.value)

  try {
    await $fetch('/api/upload', { method: 'POST', body: formData })
    uploadStatus.value = '✨ Sealed! ✨'
    await refreshGallery()
    setTimeout(() => { selectedFile.value = null; previewUrl.value = null; artworkName.value = ''; uploadStatus.value = '' }, 3000)
  } catch (error) {
    uploadStatus.value = '❌ Failed'
  } finally {
    uploading.value = false
  }
}

const handleDelete = async (filename: string) => {
  if (!confirm('Vanish this artifact?')) return
  deletingId.value = filename
  try {
    await $fetch('/api/artworks', { method: 'DELETE', body: { filename } })
    await refreshGallery()
  } catch (error) { alert('Failed') }
  finally { deletingId.value = null }
}
</script>

<template>
  <div class="min-h-screen flex flex-col items-center pt-32 pb-20 overflow-y-auto">

    <div class="w-full max-w-2xl px-4 animate-fade-in-up mb-20">
      <h2 class="section-title text-5xl md:text-7xl text-center mb-12 text-[#cc5500] drop-shadow-md">SUMMON ART</h2>
      <div class="relative p-[18px] bg-[#8B3A28] rounded-[24px] shadow-2xl tribal-border-texture">
        <div class="absolute inset-[6px] rounded-[18px] border-[4px] border-[#3E2723] z-10 pointer-events-none"></div>
        <div class="absolute top-0 left-0 w-10 h-10 z-20 bg-[#D4A373] clip-triangle-tl"></div>
        <div class="absolute top-0 right-0 w-10 h-10 z-20 bg-[#D4A373] clip-triangle-tr"></div>
        <div class="absolute bottom-0 left-0 w-10 h-10 z-20 bg-[#D4A373] clip-triangle-bl"></div>
        <div class="absolute bottom-0 right-0 w-10 h-10 z-20 bg-[#D4A373] clip-triangle-br"></div>

        <div class="relative z-20 bg-[#1a1614] rounded-[14px] p-8 min-h-[400px] flex flex-col items-center justify-center border-[2px] border-[#5D4037]">
          <div v-if="previewUrl" class="w-full flex flex-col items-center space-y-6">
            <div class="relative w-64 h-64 rounded-xl overflow-hidden border-4 border-[#cc5500] shadow-[0_0_20px_rgba(204,85,0,0.3)]">
              <img :src="previewUrl" class="w-full h-full object-cover">
            </div>
            <div class="w-full max-w-xs space-y-4">
              <div class="space-y-1">
                <label class="text-[#F5DEB3] text-xs font-bold tracking-widest uppercase ml-1">Name</label>
                <input v-model="artworkName" type="text" class="w-full bg-[#3E2723]/80 border-2 border-[#5D4037] text-[#F5DEB3] rounded-lg p-3 outline-none focus:border-[#cc5500] text-center font-sans">
              </div>
              <div class="flex gap-4 justify-center pt-2">
                <button @click="selectedFile = null; previewUrl = null" class="px-6 py-2 bg-[#3E2723] text-[#F5DEB3] rounded-lg text-sm font-bold">CANCEL</button>
                <button @click="handleUpload" :disabled="uploading" class="px-6 py-2 bg-[#cc5500] text-white rounded-lg text-sm font-bold">{{ uploading ? '...' : 'CONFIRM' }}</button>
              </div>
            </div>
          </div>
          <div v-else class="text-center space-y-6">
            <div class="w-32 h-32 mx-auto border-4 border-dashed border-[#5D4037] rounded-full flex items-center justify-center text-4xl relative">
              <input type="file" accept="image/*" @change="handleFileSelect" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30">
              <span class="pointer-events-none">📤</span>
            </div>
            <h3 class="text-2xl text-[#F5DEB3]">Drop Artifact Here</h3>
          </div>
          <div v-if="uploadStatus" class="mt-6 text-xl font-bold animate-pulse text-[#F5DEB3]">{{ uploadStatus }}</div>
        </div>
      </div>
    </div>

    <div class="w-full max-w-5xl px-4 animate-fade-in-up pb-20">
      <h2 class="section-title text-4xl md:text-5xl text-center mb-8 text-[#a53b19] drop-shadow-md">VANISH ARTIFACTS</h2>
      <div v-if="!existingArtworks || existingArtworks.length === 0" class="text-center text-[#F5DEB3]/50">No artifacts found.</div>
      <div v-else class="flex flex-wrap justify-center gap-4">
        <div v-for="art in existingArtworks" :key="art.filename" class="relative group w-20">
          <div class="relative bg-[#3E2723] rounded-lg p-1.5 shadow-md border border-[#5D4037] hover:border-[#cc5500] transition-all hover:scale-105 hover:z-10">
            <div class="relative aspect-square rounded-md overflow-hidden bg-black/40 mb-1.5">
              <NuxtImg :src="art.path" class="w-full h-full object-cover" :alt="art.title" loading="lazy" width="80" height="80" />
              <div class="absolute inset-0 bg-black/70 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[1px]">
                <button @click="handleDelete(art.filename)" :disabled="deletingId === art.filename" class="bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                  <span v-if="deletingId === art.filename" class="animate-spin text-[10px]">↻</span><span v-else class="text-xs font-bold">✕</span>
                </button>
              </div>
            </div>
            <div class="text-center px-0.5"><h3 class="text-[#F5DEB3] text-[10px] font-sans truncate">{{ art.title }}</h3></div>
          </div>
        </div>
      </div>
      <div class="text-center mt-12">
        <NuxtLink to="/" class="text-[#F5DEB3]/50 hover:text-[#F5DEB3] transition-colors text-lg font-sans">❮ Return to Gallery</NuxtLink>
      </div>
    </div>
  </div>
</template>