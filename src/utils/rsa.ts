import JSEncrypt from 'jsencrypt';
/**
 * rsa加密
 * @author: talon
 * @Date: 2023-07-05 15:06:44
 */
export function RsaEncry(data: any, publicKey: string) {
  // 使用 RSA 公钥加密 请求响应解密的key
  const myEncrypt = new JSEncrypt();
  myEncrypt.setPublicKey(atob(publicKey));
  const cryptRespKeyStr = myEncrypt.encrypt(data);
  return cryptRespKeyStr;
}
