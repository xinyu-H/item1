import JSEncrypt from 'jsencrypt'

// 密钥对生成 http://web.chacuo.net/netrsakeypair

const publicKey = 'MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAKUHKlfgRX5uJOT6a6QxRKY1suF7pFRv\n' +
  'VQ99dQTNwwpgiXkb/nx7s+D3FAtS18OOUvJwBszAjkISghSBla0peAkCAwEAAQ=='

const privateKey = 'MIIBVAIBADANBgkqhkiG9w0BAQEFAASCAT4wggE6AgEAAkEApQcqV+BFfm4k5Ppr\n' +
  'pDFEpjWy4XukVG9VD311BM3DCmCJeRv+fHuz4PcUC1LXw45S8nAGzMCOQhKCFIGV\n' +
  'rSl4CQIDAQABAkBDAPrHPS7aG3xtX+OugbZ+yZS8ikf5ZE6kAGsvrR+AqXSal42U\n' +
  'bOePcISgTaCAdgDoNLQ3++mm0tHR/u22nKUFAiEA0JZ3y1Z/90doD80txP0aQhvM\n' +
  'JPap/eAA9Gm+Lu/1s+sCIQDKif5plUWsOM+jji2IKtxhcIThPie2NvGO2ihkylwq\n' +
  '2wIgRtKQIi5gjKlmH9derv/xJnkhu3s1BMpGCLbOqEk5d7kCIQCdJLPf95E3Llzr\n' +
  '6UQqgha7AzIWEMN+/OIuk9UDXn5kQQIgbruerNbiFRAl8Y8+naEnNZwTc2MOt6bM\n' +
  'EWGOrk+m/y4='

// 加密
export function encrypt (txt: string) {
  const encryptor = new JSEncrypt()
  encryptor.setPublicKey(publicKey) // 设置公钥
  return encryptor.encrypt(txt) // 对数据进行加密
}

// 解密
export function decrypt (txt: string) {
  const encryptor = new JSEncrypt()
  encryptor.setPrivateKey(privateKey) // 设置私钥
  return encryptor.decrypt(txt) // 对数据进行解密
}
