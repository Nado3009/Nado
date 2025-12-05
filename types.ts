export interface UploadedImage {
  id: string;
  file?: File | null;
  previewUrl: string;
  base64Data: string; // Raw base64 without data prefix
  mimeType: string;
}

export interface GenerationRequest {
  images: UploadedImage[];
  rules: string;
}

export interface GenerationResponse {
  prompt: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
}
