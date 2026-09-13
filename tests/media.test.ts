import { MediaService } from '../src/services/media.service';

describe('MediaService Unit Tests', () => {
  it('should generate signed upload params for thumbnails', () => {
    const signature = MediaService.generateUploadSignature('thumbnail');

    expect(signature).toBeDefined();
    expect(signature.signature).toBeDefined();
    expect(signature.timestamp).toBeGreaterThan(0);
    expect(signature.folder).toContain('thumbnails');
    expect(signature.uploadUrl).toContain('image/upload');
  });

  it('should generate signed upload params for gallery images', () => {
    const signature = MediaService.generateUploadSignature('gallery');

    expect(signature).toBeDefined();
    expect(signature.signature).toBeDefined();
    expect(signature.timestamp).toBeGreaterThan(0);
    expect(signature.folder).toContain('gallery');
    expect(signature.uploadUrl).toContain('image/upload');
  });
});
