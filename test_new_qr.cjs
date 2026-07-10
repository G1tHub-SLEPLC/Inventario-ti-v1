const btoa = (str) => Buffer.from(str).toString('base64');
const atob = (str) => Buffer.from(str, 'base64').toString();

const encodeQRData = (type, id) => {
  if (!id) return '';
  const payload = `INV||${type}||${id}`;
  let hex = '';
  for(let i=0; i<payload.length; i++) {
    hex += payload.charCodeAt(i).toString(16).padStart(2, '0');
  }
  return btoa(hex).split('').reverse().join('').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

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
    const parts = payload.split('||');
    if (parts.length >= 3 && parts[0] === 'INV') {
      return { type: parts[1], id: parts.slice(2).join('||') };
    }
    return { error: 'Invalid format', parts };
  } catch (e) {
    return { error: e.message };
  }
};

const encoded = encodeQRData('U', '80e2bd11-590e-4158-8e5b-413dc4975720||Cristian Fernando Gutiérrez Gutiérrez');
console.log('Encoded:', encoded);
const decoded = decodeQRData(encoded);
console.log('Decoded:', decoded);

const parts = decoded.id.split('||');
console.log('Parts:', parts);
