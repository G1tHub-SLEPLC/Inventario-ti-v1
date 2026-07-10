const btoa = (str) => Buffer.from(str).toString('base64');
const encodeQRData = (type, id) => {
  if (!id) return '';
  const payload = `INV||${type}||${id}`;
  let hex = '';
  for(let i=0; i<payload.length; i++) {
    hex += payload.charCodeAt(i).toString(16).padStart(2, '0');
  }
  return btoa(hex).split('').reverse().join('').replace(/=/g, '');
};
console.log(encodeQRData('U', '80e21411-590e-4158-8e5b-433c30a10b48'));
