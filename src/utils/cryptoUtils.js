export const encodeQRData = (type, id) => {
  // type: 'E' for equipo, 'U' for usuario
  if (!id) return '';
  const payload = `INV||${type}||${id}`;
  // Simple obfuscation: string -> hex -> base64 -> reverse -> url-safe
  let hex = '';
  for(let i=0; i<payload.length; i++) {
    hex += payload.charCodeAt(i).toString(16).padStart(2, '0');
  }
  return btoa(hex).split('').reverse().join('').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};

export const decodeQRData = (hash) => {
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
  } catch (e) {
    return null;
  }
  return null;
};
