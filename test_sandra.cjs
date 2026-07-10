const btoa = (str) => Buffer.from(str).toString('base64');
const encodeQRData = (type, id) => {
  if (!id) return '';
  const payload = `INV||${type}||${id}`;
  let hex = '';
  for(let i=0; i<payload.length; i++) {
    hex += payload.charCodeAt(i).toString(16).padStart(2, '0');
  }
  return btoa(hex).split('').reverse().join('').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
};
console.log('Sandra old:', encodeQRData('U', '77eba6ed-7170-4d5e-a976-a717aa37fc06'));
console.log('Sandra new:', encodeQRData('U', '77eba6ed-7170-4d5e-a976-a717aa37fc06||Sandra Catalán Pérez'));
