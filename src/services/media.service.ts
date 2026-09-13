import { cloudinary } from '../config/cloudinary';
import { env } from '../config/env';
import { MediaUploadType, UploadSignatureResponse } from '../models/media.dto';

export class MediaService {
  /**
   * Generates a signed Cloudinary payload for secure direct client uploads.
   * Folder routing:
   *  - type = 'thumbnail' => `city-discovery/thumbnails`
   *  - type = 'gallery'   => `city-discovery/gallery`
   */
  static generateUploadSignature(type: MediaUploadType): UploadSignatureResponse {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const subfolder =
      type === 'thumbnail' ? 'thumbnails' :
      type === 'gallery'   ? 'gallery' :
                             'legal-docs'; // legal_doc
    const folder = `${env.CLOUDINARY_FOLDER}/${subfolder}`;
    const resourceType = type === 'legal_doc' ? 'auto' : 'image';

    const paramsToSign = {
      folder,
      timestamp,
    };

    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      env.CLOUDINARY_API_SECRET
    );

    return {
      signature,
      timestamp,
      apiKey: env.CLOUDINARY_API_KEY,
      cloudName: env.CLOUDINARY_CLOUD_NAME,
      folder,
      uploadUrl: `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/${resourceType}/upload`,
    };
  }
}
