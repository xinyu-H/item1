import { createApp } from 'vue'
import App from './App.vue'
import router from '@/utils/permission'
import store from './store'
import i18n from '@/language/index'
import NutUI from '@nutui/nutui'
import '@nutui/nutui/dist/styles/themes/default.scss'
import errorPlugin from '@/plugin/errorPlugin'
import VConsole from 'vconsole'
import '@/assets/style/index.scss'
import '@/assets/icon/iconfont.css'
import '@/assets/icon/iconfont'

createApp(App).use(store).use(router).use(i18n).use(NutUI).use(errorPlugin).mount('#app')
/* eslint-disable no-new */
new VConsole()
