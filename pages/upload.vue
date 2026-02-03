<script setup lang="ts">
import { ref } from 'vue'

// --- Auth State ---
const { loggedIn, user, clear } = useUserSession()

// --- Upload Logic State ---
const uploading = ref(false)
const uploadStatus = ref('')
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const artworkName = ref('')
const deletingId = ref<string | null>(null)

// --- Data Fetching ---
// Only fetch artwork list if logged in
const { data: existingArtworks, refresh: refreshGallery } = await useFetch('/api/artworks', {
  key: 'upload-list',
  immediate: loggedIn.value
})

// --- Actions ---
const logout = async () => {
  await clear()
  navigateTo('/')
}

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
  if (!confirm('Banish this artifact?')) return
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

    <div v-if="!loggedIn" class="flex flex-col items-center justify-center min-h-[50vh] space-y-8 animate-fade-in-up">
      <h2 class="section-title text-5xl text-[#cc5500] drop-shadow-md">RESTRICTED AREA</h2>
      <div class="p-8 bg-[#8B3A28] rounded-2xl shadow-2xl border-4 border-[#3E2723] text-center max-w-md">
        <p class="text-[#F5DEB3] mb-6 text-xl font-handwritten">Only chosen guardians may summon artifacts.</p>

        <a href="/api/auth/google" class="px-8 py-3 bg-white text-gray-800 rounded-lg font-bold shadow-lg hover:bg-gray-100 transition-colors flex items-center gap-3 mx-auto justify-center">
          <svg class="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </a>
      </div>
    </div>

    <div v-else class="w-full flex flex-col items-center">

      <div class="absolute top-24 right-4 z-50 flex items-center gap-4">
        <span class="text-[#F5DEB3]/50 text-xs hidden sm:inline">{{ user?.email }}</span>
        <button @click="logout" class="text-[#F5DEB3] hover:text-white text-sm border border-[#F5DEB3]/30 px-3 py-1 rounded bg-[#3E2723]">
          Logout
        </button>
      </div>

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
        <h2 class="section-title text-4xl md:text-5xl text-center mb-8 text-[#a53b19] drop-shadow-md">BANISH ARTIFACTS</h2>
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
      </div>

    </div>
  </div>
</template>