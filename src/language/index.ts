import { createI18n } from 'vue-i18n'
import { config, LanguageType } from '@/config'
import cn from '@/language/dict/cn'
import tw from '@/language/dict/tw'

const messages: { [key: string]: any } = {}
messages[LanguageType.cn] = cn
messages[LanguageType.tw] = tw

const index = createI18n({
  fallbackLocale: 'cn',
  globalInjection: true,
  legacy: false,
  locale: config.language,
  messages
})

export default index
