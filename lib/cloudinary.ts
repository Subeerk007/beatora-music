import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";

cloudinary.config({ secure: true });

function assertCloudinaryConfigured() {
  const config = cloudinary.config();
  if (!config.cloud_name || !config.api_key || !config.api_secret) {
    throw new Error("Cloudinary is not configured. Set CLOUDINARY_URL in .env.local.");
  }
}

export function uploadBuffer(
  buffer: Buffer,
  options: {
    folder: string;
    public_id: string;
    resource_type: "image" | "video";
    format?: string;
  }
): Promise<UploadApiResponse> {
  assertCloudinaryConfigured();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
        return;
      }

      if (!result) {
        reject(new Error("Cloudinary returned no upload result."));
        return;
      }

      resolve(result);
    });

    uploadStream.end(buffer);
  });
}

export async function deleteAsset(publicId: string, resourceType: "image" | "video") {
  assertCloudinaryConfigured();
  await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
    invalidate: true,
  });
}
