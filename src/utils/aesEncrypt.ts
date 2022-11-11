import { AES, enc, mode, pad } from 'crypto-ts'

const keyStr = 'weds123456789012'

// 加密
export function aesEncrypt (word: string) {
  const encrypted = AES.encrypt(enc.Utf8.parse(word), enc.Utf8.parse(keyStr), {
    iv: enc.Utf8.parse(keyStr),
    mode: mode.CBC,
    padding: pad.PKCS7
  })
  return encrypted.toString()
}

// 解密
export function aesDecrypt (word: string) {
  const decrypt = AES.decrypt(word, enc.Utf8.parse(keyStr), {
    iv: enc.Utf8.parse(keyStr),
    mode: mode.CBC,
    padding: pad.PKCS7
  })
  return enc.Utf8.stringify(decrypt).toString()
}
