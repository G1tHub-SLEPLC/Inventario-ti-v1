import { supabase } from '../lib/supabaseClient';

const BUCKET_NAME = 'documentos';

export async function saveDocument(storageKey, type, file) {
  if (!storageKey) throw new Error('Storage key is required');
  
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storageKey, file, {
      upsert: true,
      contentType: file.type
    });

  if (error) throw error;
  return true;
}

export async function getDocument(storageKey, type) {
  if (!storageKey) return null;
  
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .download(storageKey);
    
  if (error) {
    console.error('Error downloading document:', error);
    return null;
  }
  
  // Return in a format compatible with the existing URL.createObjectURL(doc.blob)
  return { blob: data }; 
}

export async function deleteDocument(storageKey, type) {
  if (!storageKey) return false;
  
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([storageKey]);
    
  if (error) throw error;
  return true;
}
