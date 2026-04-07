import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router/index.js'
import App from './App.vue'
import './style.css'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)

const { useAuthStore } = await import('./stores/auth.js')
const auth = useAuthStore()

if (auth.token) await auth.fetchMe()
else auth.isInitialized = true

app.use(router)
app.mount('#app')