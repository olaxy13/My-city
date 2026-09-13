import { Controller, Route, Get, Query, Tags } from 'tsoa';
import { MediaService } from '../../services/media.service';
import { MediaUploadType, UploadSignatureResponse } from '../../models/media.dto';
import { ApiResponse } from '../../models/common.dto';

@Tags('Media & Uploads')
@Route('api/v1/media')
export class MediaController extends Controller {
  /**
   * Generate short-lived signed Cloudinary credentials for direct secure client uploads.
   * @param type Choose 'thumbnail' for cover photos or 'gallery' for detail page photos.
   */
  @Get('upload-signature')
  public async getUploadSignature(
    @Query() type: MediaUploadType = 'thumbnail'
  ): Promise<ApiResponse<UploadSignatureResponse>> {
    const signature = MediaService.generateUploadSignature(type);
    return {
      success: true,
      message: 'Upload signature generated successfully',
      data: signature,
    };
  }
}
