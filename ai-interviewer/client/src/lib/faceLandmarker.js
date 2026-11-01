// Loads Google's MediaPipe face model once and shares it. Runs fully in the browser:
// the video never leaves the page. The code is bundled; only the model files are downloaded.

const VERSION = '1.1.0' // keep in step with @mediapipe/tasks-vision in package.json
const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${VERSION}/wasm`
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'

let loading = null

export function loadFaceLandmarker() {
  if (!loading) {
    loading = (async () => {
      const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')
      const fileset = await FilesetResolver.forVisionTasks(WASM_URL)
      const create = (delegate) =>
        FaceLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate },
          runningMode: 'VIDEO',
          numFaces: 1,
        })
      try {
        return await create('GPU')
      } catch {
        return await create('CPU') // older graphics hardware
      }
    })().catch((err) => {
      loading = null // allow a retry (for example after coming back online)
      throw err
    })
  }
  return loading
}
