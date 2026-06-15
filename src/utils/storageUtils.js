import { supabase } from '../lib/supabaseClient';

const BUCKET_NAME = 'documentos';

/**
 * Uploads an image file to Supabase Storage and returns the public URL.
 * @param {File} file - The file object to upload.
 * @returns {Promise<string|null>} The public URL or null if error.
 */
export async function uploadEquipoImage(file) {
  if (!file) return null;
  
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `imagenes/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading image:', uploadError);
      return null;
    }

    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return data.publicUrl;
  } catch (error) {
    console.error('Exception uploading image:', error);
    return null;
  }
}

/**
 * Extracts the file path from a Supabase public URL.
 * @param {string} publicUrl 
 * @returns {string|null} The path inside the bucket.
 */
function extractPathFromUrl(publicUrl) {
  if (!publicUrl) return null;
  const match = publicUrl.match(new RegExp(`${BUCKET_NAME}/(.*)`));
  return match ? match[1] : null;
}

/**
 * Deletes an image from Supabase Storage given its public URL.
 * @param {string} publicUrl - The public URL of the image to delete.
 */
export async function deleteEquipoImage(publicUrl) {
  if (!publicUrl) return;

  try {
    const filePath = extractPathFromUrl(publicUrl);
    if (!filePath) return;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting image:', error);
    }
  } catch (error) {
    console.error('Exception deleting image:', error);
  }
}
