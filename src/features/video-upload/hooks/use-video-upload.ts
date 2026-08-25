import { useCallback, useReducer, useRef } from "react";
import * as FileSystemLegacy from "expo-file-system/legacy";
import { requestVideoUploadUrl, completeVideoUpload, isStorageUnavailableError } from "../api";
import { uploadReducer, INITIAL_UPLOAD_STATE } from "../lib/upload-state-machine";

interface UploadFileInput {
  title: string;
  fileUri: string;
  contentType: string;
  sizeBytes: number;
}

export function useVideoUpload() {
  const [state, dispatch] = useReducer(uploadReducer, INITIAL_UPLOAD_STATE);
  const taskRef = useRef<FileSystemLegacy.UploadTask | null>(null);

  const upload = useCallback(async (input: UploadFileInput) => {
    dispatch({ type: "START" });
    try {
      const { videoId, uploadUrl } = await requestVideoUploadUrl({
        title: input.title,
        contentType: input.contentType,
        sizeBytes: input.sizeBytes,
      });
      dispatch({ type: "URL_READY", videoId, uploadUrl });

      const task = FileSystemLegacy.createUploadTask(
        uploadUrl,
        input.fileUri,
        {
          httpMethod: "PUT",
          uploadType: FileSystemLegacy.FileSystemUploadType.BINARY_CONTENT,
          headers: { "Content-Type": input.contentType },
        },
        ({ totalBytesSent, totalBytesExpectedToSend }) => {
          if (totalBytesExpectedToSend > 0) {
            dispatch({ type: "PROGRESS", progress: totalBytesSent / totalBytesExpectedToSend });
          }
        },
      );
      taskRef.current = task;

      const result = await task.uploadAsync();
      taskRef.current = null;

      if (!result || result.status < 200 || result.status >= 300) {
        dispatch({ type: "FAILED", message: "Falha ao enviar o vídeo. Verifique sua conexão e tente novamente." });
        return;
      }

      dispatch({ type: "UPLOADED" });
      const completed = await completeVideoUpload(videoId);
      dispatch({ type: "COMPLETED", videoId: completed.id });
    } catch (error) {
      taskRef.current = null;
      if (isStorageUnavailableError(error)) {
        dispatch({
          type: "FAILED",
          message: "Envio de vídeo indisponível no momento. Use um link do YouTube.",
        });
        return;
      }
      dispatch({
        type: "FAILED",
        message: error instanceof Error ? error.message : "Não foi possível enviar o vídeo.",
      });
    }
  }, []);

  const cancel = useCallback(async () => {
    await taskRef.current?.cancelAsync();
    taskRef.current = null;
    dispatch({ type: "CANCEL" });
  }, []);

  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  return { state, upload, cancel, reset };
}
