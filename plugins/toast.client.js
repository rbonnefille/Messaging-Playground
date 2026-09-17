// vue-toastification registration (client-only — it touches the DOM).
import Toast from 'vue-toastification'

const options = {
  transition: 'Vue-Toastification__fade',
  maxToasts: 15,
  newestOnTop: true,
}

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(Toast, options)
})
