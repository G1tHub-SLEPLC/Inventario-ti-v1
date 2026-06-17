import { supabase } from '../lib/supabaseClient';

const BUCKET_NAME = 'equipos_imagenes';

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

// --- ACTAS FIRMADAS ---
const ACTAS_BUCKET_NAME = 'actas_firmadas';

/**
 * Uploads a signed document to Supabase Storage (Private Bucket).
 * @param {File} file - The file to upload.
 * @param {string} rut - The user's RUT to organize folders.
 * @param {string} type - 'global', 'equipo', or 'prestamo' to organize subfolders.
 * @returns {Promise<string|null>} The file path in the bucket or null if error.
 */
export async function uploadActaFirmada(file, rut, type = 'global') {
  if (!file) return null;
  
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${type}_${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
    const filePath = `${rut}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(ACTAS_BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading acta:', uploadError);
      return null;
    }

    // Retornamos el path, no publicUrl, porque el bucket es privado.
    return filePath;
  } catch (error) {
    console.error('Exception uploading acta:', error);
    return null;
  }
}

/**
 * Gets a temporary signed URL to view or download the acta.
 * @param {string} filePath - The path stored in the database.
 * @returns {Promise<string|null>} The signed URL.
 */
export async function getActaFirmadaUrl(filePath) {
  if (!filePath) return null;

  try {
    const { data, error } = await supabase.storage
      .from(ACTAS_BUCKET_NAME)
      .createSignedUrl(filePath, 60 * 60); // 1 hour expiration

    if (error) {
      console.error('Error creating signed url for acta:', error);
      return null;
    }

    return data.signedUrl;
  } catch (error) {
    console.error('Exception creating signed url for acta:', error);
    return null;
  }
}

/**
 * Deletes an acta from Supabase Storage given its path.
 * @param {string} filePath - The path of the acta to delete.
 */
export async function deleteActaFirmada(filePath) {
  if (!filePath) return;

  try {
    const { error } = await supabase.storage
      .from(ACTAS_BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting acta:', error);
    }
  } catch (error) {
    console.error('Exception deleting acta:', error);
  }
}

