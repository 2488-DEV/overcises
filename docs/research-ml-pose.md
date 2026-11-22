# Research: pose detection for Valid Rep checking

Status: first pass, 2026-11-22. Nothing here is benchmarked on our own devices yet.

## Decision

Use an existing pretrained pose model as is. We do not train or fine-tune our own model. All app-specific logic (angles, thresholds, form rules) is plain code on top of the model's output.

## What we need

Camera frames in, a per-frame body pose out, then our own rule code decides whether a rep happened and whether its form was correct. The model gives joint positions only. It does not know what a squat is.

## Options

| Option | Keypoints | Platform | Notes |
|---|---|---|---|
| MediaPipe Pose Landmarker | 33 (3D) | Web JS, Android, iOS, Python | Single-person, built for fitness. Three bundles: lite, full, heavy. |
| ML Kit Pose Detection | 33 | Android, iOS only | Single person. Fast and accurate SDK variants. Easier native integration. |
| MoveNet | 17 | Web (TF.js), mobile | Fewer keypoints, lighter. |
| YOLO pose (Ultralytics) | 17 | Mostly server/Python | Only needed for multi-person. |

The sheet's "Google MediaPipe or Google ML Kit" is a sound shortlist. MediaPipe is the one that runs in a browser.

## Model bundles (MediaPipe)

- Lite, full and heavy share input sizes (224x224 detector, 256x256 landmarker).
- Heavy is most accurate and slowest; lite is fastest and least accurate.
- The only numbers found were from the legacy MediaPipe Pose docs, not the current Pose Landmarker task: roughly 20 / 25 / 53 ms for lite / full / heavy, with the hardware unclear. Treat them as ordering only.

## How rep counting works

1. Per frame, take three landmarks and compute the joint angle (squat: hip, knee, ankle; push-up: shoulder, elbow, wrist).
2. Run a two-state machine, up and down, with a gap between the two thresholds so jitter does not double-count. Example from a public demo: up above about 169 degrees, down below about 90 degrees.
3. A rep counts as a **Valid Rep** only if form checks also pass at the bottom of the movement (knee angle, back angle, and so on).

An alternative is to track normalised hip height with two thresholds. It is simpler but depends more on camera angle and the user's height, so it needs calibration.

## Risks to test early

- Camera angle: side view suits push-ups, front or 45 degrees suits squats. The user must set the phone up correctly.
- Lighting, loose clothing, and the body going partly out of frame.
- Cheating the ranking: someone holding up a video or a second person doing the reps. Not covered by pose detection alone.
- Frame rate on a mid-range phone with the heavy model.

## Suggested next step

Build a small spike that runs MediaPipe Pose Landmarker in a browser, draws the skeleton on the webcam feed, and prints the knee angle for one squat. Measure frames per second on a real phone before committing to a model.

## Sources

- [MediaPipe Pose Landmarker, Web guide](https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker/web_js)
- [MediaPipe Pose Landmarker guide](https://developers.google.com/edge/mediapipe/solutions/vision/pose_landmarker)
- [Legacy MediaPipe Pose docs with model tables](https://github.com/google-ai-edge/mediapipe/blob/master/docs/solutions/pose.md)
- [ML Kit Pose Detection](https://developers.google.com/ml-kit/vision/pose-detection)
- [Hugging Face MediaPipe squat demo](https://huggingface.co/spaces/rootstrap-org/mediapipe-pose-demo/blob/main/index.html)
- [SunFounder squat counter](https://docs.sunfounder.com/projects/ai-lab-kit/en/latest/mediapipe/mp_8_pose_squat.html)
- [Topflight pose estimation overview](https://topflightapps.com/ideas/pose-estimation/)
