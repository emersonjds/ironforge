import { apiRequest, ApiError } from "@shared/lib/api/client";
import {
  VideoUploadResponseSchema,
  VideoUploadCompleteResponseSchema,
  YoutubeVideoResponseSchema,
  type VideoUploadRequest,
  type VideoUploadResponse,
  type VideoUploadCompleteResponse,
  type YoutubeVideoRequest,
  type YoutubeVideoResponse,
  type CreateExerciseDemoRequest,
} from "@entities/video";

export const STORAGE_UNAVAILABLE_CODE = "STORAGE_UNAVAILABLE";

export function isStorageUnavailableError(error: unknown): boolean {
  return error instanceof ApiError && error.code === STORAGE_UNAVAILABLE_CODE;
}

export async function requestVideoUploadUrl(body: VideoUploadRequest): Promise<VideoUploadResponse> {
  const raw = await apiRequest<unknown>("/videos/uploads", { method: "POST", body });
  return VideoUploadResponseSchema.parse(raw);
}

export async function completeVideoUpload(videoId: string): Promise<VideoUploadCompleteResponse> {
  const raw = await apiRequest<unknown>(`/videos/${videoId}/complete`, { method: "POST" });
  return VideoUploadCompleteResponseSchema.parse(raw);
}

export async function createYoutubeVideo(body: YoutubeVideoRequest): Promise<YoutubeVideoResponse> {
  const raw = await apiRequest<unknown>("/videos/youtube", { method: "POST", body });
  return YoutubeVideoResponseSchema.parse(raw);
}

export async function linkExerciseDemo(exerciseId: string, body: CreateExerciseDemoRequest): Promise<void> {
  await apiRequest<unknown>(`/exercises/${exerciseId}/demos`, { method: "POST", body });
}
