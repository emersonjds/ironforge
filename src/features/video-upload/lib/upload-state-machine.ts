export type UploadState =
  | { status: "idle" }
  | { status: "requesting-url" }
  | { status: "uploading"; videoId: string; uploadUrl: string; progress: number }
  | { status: "completing"; videoId: string }
  | { status: "done"; videoId: string }
  | { status: "error"; message: string }
  | { status: "canceled" };

export type UploadAction =
  | { type: "START" }
  | { type: "URL_READY"; videoId: string; uploadUrl: string }
  | { type: "PROGRESS"; progress: number }
  | { type: "UPLOADED" }
  | { type: "COMPLETED"; videoId: string }
  | { type: "FAILED"; message: string }
  | { type: "CANCEL" }
  | { type: "RESET" };

export const INITIAL_UPLOAD_STATE: UploadState = { status: "idle" };

export function uploadReducer(state: UploadState, action: UploadAction): UploadState {
  switch (action.type) {
    case "START":
      return { status: "requesting-url" };

    case "URL_READY":
      if (state.status !== "requesting-url") return state;
      return { status: "uploading", videoId: action.videoId, uploadUrl: action.uploadUrl, progress: 0 };

    case "PROGRESS":
      if (state.status !== "uploading") return state;
      return { ...state, progress: Math.min(1, Math.max(0, action.progress)) };

    case "UPLOADED":
      if (state.status !== "uploading") return state;
      return { status: "completing", videoId: state.videoId };

    case "COMPLETED":
      return { status: "done", videoId: action.videoId };

    case "FAILED":
      return { status: "error", message: action.message };

    case "CANCEL":
      return state.status === "uploading" || state.status === "requesting-url"
        ? { status: "canceled" }
        : state;

    case "RESET":
      return INITIAL_UPLOAD_STATE;

    default:
      return state;
  }
}
