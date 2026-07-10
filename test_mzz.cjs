const btoa = (str) => Buffer.from(str).toString('base64');
const atob = (str) => Buffer.from(str, 'base64').toString();

const decodeQRData = (hash) => {
  if (!hash) return null;
  try {
    let b64 = hash.replace(/-/g, '+').replace(/_/g, '/').replace(/ /g, '+').split('').reverse().join('');
    while(b64.length % 4 !== 0) b64 += '=';
    const hex = atob(b64);
    let payload = '';
    for (let i = 0; i < hex.length; i += 2) {
      payload += String.fromCharCode(parseInt(hex.substring(i, i+2), 16));
    }
    return payload;
  } catch (e) {
    return { error: e.message };
  }
};

const encoded = 'mZzN2UzN0Y';
console.log('Decoded prefix:', decodeQRData(encoded));
