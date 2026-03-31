/**
 * Supabase Storage Initialization Service
 * 
 * This module handles the initialization of required storage buckets
 * and verifies that the application has proper storage setup.
 * 
 * Call initializeApp() on application startup to ensure everything is ready.
 */

import { supabase } from './client';
import { toast } from 'sonner';

const REQUIRED_BUCKETS = ['board-images', 'planning-images'];
const BUCKET_CONFIG = {
  'board-images': {
    maxSize: 10 * 1024 * 1024, // 10 MB
    public: true,
  },
  'planning-images': {
    maxSize: 50 * 1024 * 1024, // 50 MB
    public: true,
  },
};

/**
 * Initialize the Supabase application
 * Checks and reports on storage bucket availability
 * 
 * Should be called once during app initialization (e.g., in App.tsx or main.tsx)
 */
export async function initializeStorageApplication(): Promise<boolean> {
  try {
    console.log('🚀 Initializing Supabase Storage...');

    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError);
      return false;
    }

    const existingBucketNames = buckets?.map((b) => b.name) || [];
    console.log('📦 Existing buckets:', existingBucketNames);

    const missingBuckets = REQUIRED_BUCKETS.filter(
      (required) => !existingBucketNames.includes(required)
    );

    if (missingBuckets.length > 0) {
      console.warn(
        `⚠️ Missing storage buckets: ${missingBuckets.join(', ')}\n` +
        'Please create them in Supabase Dashboard:\n' +
        '1. Go to Storage > Buckets\n' +
        '2. Create each missing bucket as PUBLIC\n' +
        '3. The application will work without them, but image uploads will fail.'
      );

      // Show user-friendly notification (non-blocking)
      toast.warning(
        'Storage setup incomplete. Image uploads may not work. ' +
        'Please contact administrator.',
        { duration: 5000 }
      );

      return false;
    }

    console.log('✅ All required storage buckets exist');

    // Verify bucket accessibility
    const accessibleBuckets = [];
    for (const bucketName of REQUIRED_BUCKETS) {
      try {
        const { data, error } = await supabase.storage
          .from(bucketName)
          .list('', { limit: 1 });

        if (!error) {
          accessibleBuckets.push(bucketName);
        } else {
          console.warn(`⚠️ Bucket ${bucketName} exists but may have permission issues:`, error);
        }
      } catch (err) {
        console.warn(`⚠️ Could not verify access to ${bucketName}:`, err);
      }
    }

    console.log(`✅ Accessible buckets: ${accessibleBuckets.join(', ')}`);
    return accessibleBuckets.length === REQUIRED_BUCKETS.length;
  } catch (error) {
    console.error('❌ Error during storage initialization:', error);
    return false;
  }
}

/**
 * Check if a specific bucket exists
 */
export async function bucketExists(bucketName: string): Promise<boolean> {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    return buckets?.some((b) => b.name === bucketName) || false;
  } catch (error) {
    console.error(`Error checking bucket ${bucketName}:`, error);
    return false;
  }
}

/**
 * Get information about a bucket's configuration
 */
export async function getBucketInfo(bucketName: string): Promise<{
  exists: boolean;
  isPublic: boolean;
  size: number;
  fileCount: number;
  config: typeof BUCKET_CONFIG[keyof typeof BUCKET_CONFIG] | null;
} | null> {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucket = buckets?.find((b) => b.name === bucketName);

    if (!bucket) {
      return null;
    }

    const config = BUCKET_CONFIG[bucketName as keyof typeof BUCKET_CONFIG] || null;
    console.log(`📊 Bucket Info for "${bucketName}":`, bucket);

    return {
      exists: true,
      isPublic: bucket.public || false,
      size: 0, // Supabase doesn't provide direct size info via SDK
      fileCount: 0, // Would need to enumerate all files
      config,
    };
  } catch (error) {
    console.error(`Error getting bucket info for ${bucketName}:`, error);
    return null;
  }
}

/**
 * List all files in a bucket (for debugging/admin purposes)
 */
export async function listBucketFiles(
  bucketName: string,
  limit: number = 100
): Promise<Array<{ name: string; id: string }>> {
  try {
    const { data, error } = await supabase.storage
      .from(bucketName)
      .list('', { limit });

    if (error) {
      console.error(`Error listing files in ${bucketName}:`, error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error(`Exception listing files in ${bucketName}:`, error);
    return [];
  }
}

/**
 * Get public URL for a file
 */
export function getPublicFileUrl(bucketName: string, filePath: string): string {
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath);

  return data?.publicUrl || '';
}

/**
 * Delete a file from a bucket
 */
export async function deleteFile(bucketName: string, filePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);

    if (error) {
      console.error(`Error deleting ${filePath} from ${bucketName}:`, error);
      return false;
    }

    console.log(`✅ Deleted ${filePath} from ${bucketName}`);
    return true;
  } catch (error) {
    console.error(`Exception deleting file:`, error);
    return false;
  }
}

/**
 * Clean up old files from a bucket (older than specified days)
 * Useful for maintenance
 */
export async function cleanupOldFiles(
  bucketName: string,
  olderThanDays: number = 7
): Promise<number> {
  try {
    const files = await listBucketFiles(bucketName, 1000);
    const now = Date.now();
    const timeThreshold = olderThanDays * 24 * 60 * 60 * 1000;
    let deletedCount = 0;

    for (const file of files) {
      const fileTime = new Date(file.updated_at || file.created_at).getTime();
      if (now - fileTime > timeThreshold) {
        const success = await deleteFile(bucketName, file.name);
        if (success) deletedCount++;
      }
    }

    console.log(`🧹 Cleaned up ${deletedCount} old files from ${bucketName}`);
    return deletedCount;
  } catch (error) {
    console.error(`Error cleaning up files:`, error);
    return 0;
  }
}

export default {
  initializeStorageApplication,
  bucketExists,
  getBucketInfo,
  listBucketFiles,
  getPublicFileUrl,
  deleteFile,
  cleanupOldFiles,
};
