import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const useDocumentUpload = () => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);

  const uploadDocument = async (file) => {
    setIsUploading(true);
    try {
      // 10MB limit
      if (file.size > 10 * 1024 * 1024) {
        throw new Error(`File ${file.name} exceeds 10MB limit.`);
      }

      const storagePath = `${user.id}/${Date.now()}_${file.name}`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(storagePath, file);

      if (uploadError) throw uploadError;

      const newDocument = {
        user_id: user.id,
        filename: file.name,
        storage_path: storagePath,
        source_type: 'upload',
        mime_type: file.type || 'application/octet-stream',
        status: 'pending'
      };

      // Insert row
      const { data, error: dbError } = await supabase
        .from('documents')
        .insert([newDocument])
        .select()
        .single();

      if (dbError) throw dbError;

      return { success: true, data };
    } catch (err) {
      console.error('Upload failed:', err);
      return { success: false, error: err.message };
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadDocument, isUploading };
};
