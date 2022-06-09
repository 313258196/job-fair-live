import { createApp } from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import { TcPlayer } from './debug/TcPlayer-2.4.1'

import "./TIM"

const app = createApp(App)
app.config.globalProperties.$TcPlayer = TcPlayer
app.use(store).use(router).use(ElementPlus).mount('#app')
