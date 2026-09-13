export type MediaUploadType = 'thumbnail' | 'gallery' | 'legal_doc';

export interface UploadSignatureResponse {
  signature: string;
  timestamp: number;
  apiKey: string;
  cloudName: string;
  folder: string;
  uploadUrl: string;
}
