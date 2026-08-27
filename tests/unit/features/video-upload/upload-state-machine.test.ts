import {
  uploadReducer,
  INITIAL_UPLOAD_STATE,
  type UploadState,
  type UploadAction,
} from "@features/video-upload/lib/upload-state-machine";

describe("uploadReducer", () => {
  it("começa idle", () => {
    expect(INITIAL_UPLOAD_STATE).toEqual({ status: "idle" });
  });

  it("percorre o fluxo feliz: pedir URL -> subir -> confirmar", () => {
    let state: UploadState = INITIAL_UPLOAD_STATE;

    state = uploadReducer(state, { type: "START" });
    expect(state.status).toBe("requesting-url");

    state = uploadReducer(state, { type: "URL_READY", videoId: "v1", uploadUrl: "https://upload" });
    expect(state).toEqual({ status: "uploading", videoId: "v1", uploadUrl: "https://upload", progress: 0 });

    state = uploadReducer(state, { type: "PROGRESS", progress: 0.5 });
    expect(state).toMatchObject({ status: "uploading", progress: 0.5 });

    state = uploadReducer(state, { type: "UPLOADED" });
    expect(state).toEqual({ status: "completing", videoId: "v1" });

    state = uploadReducer(state, { type: "COMPLETED", videoId: "v1" });
    expect(state).toEqual({ status: "done", videoId: "v1" });
  });

  it("ignora PROGRESS fora de uploading", () => {
    expect(uploadReducer(INITIAL_UPLOAD_STATE, { type: "PROGRESS", progress: 0.5 })).toEqual(
      INITIAL_UPLOAD_STATE,
    );
  });

  it("ignora UPLOADED fora de uploading", () => {
    const requestingState: UploadState = { status: "requesting-url" };
    expect(uploadReducer(requestingState, { type: "UPLOADED" })).toEqual(requestingState);
  });

  it("clampa o progresso entre 0 e 1", () => {
    let state: UploadState = { status: "uploading", videoId: "v1", uploadUrl: "u", progress: 0 };
    state = uploadReducer(state, { type: "PROGRESS", progress: 1.4 });
    expect(state).toMatchObject({ progress: 1 });
    state = uploadReducer(state, { type: "PROGRESS", progress: -0.2 });
    expect(state).toMatchObject({ progress: 0 });
  });

  it("vai para error em qualquer estado ao falhar", () => {
    const state = uploadReducer(
      { status: "uploading", videoId: "v1", uploadUrl: "u", progress: 0.3 },
      { type: "FAILED", message: "rede caiu" },
    );
    expect(state).toEqual({ status: "error", message: "rede caiu" });
  });

  it("cancela durante requesting-url ou uploading", () => {
    expect(uploadReducer({ status: "requesting-url" }, { type: "CANCEL" })).toEqual({ status: "canceled" });
    expect(
      uploadReducer({ status: "uploading", videoId: "v1", uploadUrl: "u", progress: 0.1 }, { type: "CANCEL" }),
    ).toEqual({ status: "canceled" });
  });

  it("ignora cancelamento fora de requesting-url/uploading", () => {
    const doneState: UploadState = { status: "done", videoId: "v1" };
    expect(uploadReducer(doneState, { type: "CANCEL" })).toEqual(doneState);
  });

  it("reset volta para idle a partir de qualquer estado", () => {
    expect(uploadReducer({ status: "error", message: "x" }, { type: "RESET" })).toEqual(INITIAL_UPLOAD_STATE);
  });

  it("ignora uma ação desconhecida e mantém o estado atual (switch exaustivo, guarda defensiva)", () => {
    const state: UploadState = { status: "uploading", videoId: "v1", uploadUrl: "u", progress: 0.4 };
    // Simula uma action fora da union fechada (ex.: payload corrompido vindo de um reducer externo).
    const unknownAction = { type: "UNKNOWN" } as unknown as UploadAction;
    expect(uploadReducer(state, unknownAction)).toBe(state);
  });

  it("ignora URL_READY fora de requesting-url", () => {
    expect(uploadReducer(INITIAL_UPLOAD_STATE, { type: "URL_READY", videoId: "v1", uploadUrl: "u" })).toEqual(
      INITIAL_UPLOAD_STATE,
    );
  });
});
