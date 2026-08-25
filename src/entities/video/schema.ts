import { z } from "zod";

export const YoutubePlaybackSchema = z.object({
  kind: z.literal("youtube"),
  youtubeVideoId: z.string(),
  embedUrl: z.string().url(),
  watchUrl: z.string().url(),
  thumbnailUrl: z.string().url(),
});
export type YoutubePlayback = z.infer<typeof YoutubePlaybackSchema>;

export const FilePlaybackSchema = z.object({
  kind: z.literal("file"),
  url: z.string().url(),
  expiresAt: z.string().datetime(),
  thumbnailUrl: z.string().url().nullable(),
});
export type FilePlayback = z.infer<typeof FilePlaybackSchema>;

export const UnavailablePlaybackSchema = z.object({
  kind: z.literal("unavailable"),
  reason: z.string(),
});
export type UnavailablePlayback = z.infer<typeof UnavailablePlaybackSchema>;

export const PlaybackSchema = z.discriminatedUnion("kind", [
  YoutubePlaybackSchema,
  FilePlaybackSchema,
  UnavailablePlaybackSchema,
]);
export type Playback = z.infer<typeof PlaybackSchema>;

export const DemoCoachSchema = z.object({
  id: z.string(),
  name: z.string(),
  avatarUrl: z.string().url().nullable(),
});
export type DemoCoach = z.infer<typeof DemoCoachSchema>;

export const ExerciseDemoSchema = z.object({
  exerciseId: z.string(),
  videoId: z.string(),
  title: z.string(),
  source: z.enum(["upload", "youtube"]),
  performerGender: z.enum(["male", "female", "all"]),
  coachNote: z.string().max(280).nullable().default(null),
  isPrimary: z.boolean().default(false),
  ownedByCoach: z.boolean().default(false),
  coach: DemoCoachSchema.nullable(),
  playback: PlaybackSchema,
});
export type ExerciseDemo = z.infer<typeof ExerciseDemoSchema>;

export const ExerciseDemoListSchema = z.array(ExerciseDemoSchema);

export const VideoUploadRequestSchema = z.object({
  title: z.string().min(1),
  contentType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
});
export type VideoUploadRequest = z.infer<typeof VideoUploadRequestSchema>;

export const VideoUploadResponseSchema = z.object({
  videoId: z.string(),
  uploadUrl: z.string().url(),
  storageKey: z.string(),
  expiresAt: z.string().datetime(),
});
export type VideoUploadResponse = z.infer<typeof VideoUploadResponseSchema>;

export const VideoUploadCompleteResponseSchema = z.object({
  id: z.string(),
  status: z.enum(["pending", "processing", "ready", "error"]),
});
export type VideoUploadCompleteResponse = z.infer<typeof VideoUploadCompleteResponseSchema>;

export const YoutubeVideoRequestSchema = z.object({
  url: z.string().min(11),
  title: z.string().min(1),
});
export type YoutubeVideoRequest = z.infer<typeof YoutubeVideoRequestSchema>;

export const YoutubeVideoResponseSchema = z.object({
  id: z.string(),
  status: z.enum(["pending", "processing", "ready", "error"]),
});
export type YoutubeVideoResponse = z.infer<typeof YoutubeVideoResponseSchema>;

export const CreateExerciseDemoRequestSchema = z.object({
  videoId: z.string(),
  isPrimary: z.boolean().optional(),
  coachNote: z.string().max(280).optional(),
});
export type CreateExerciseDemoRequest = z.infer<typeof CreateExerciseDemoRequestSchema>;
