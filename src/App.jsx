import React, { useRef, useState } from "react";
import * as posedetection from "@tensorflow-models/pose-detection";
import "@tensorflow/tfjs-backend-webgl";
import { drawKeypoints, drawSkeleton } from "./utils/draw";

function App() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [modelLoaded, setModelLoaded] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [lastY, setLastY] = useState(null);
  const [direction, setDirection] = useState("down");

  const loadModel = async () => {
    const detectorConfig = {
      modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
    };
    const detector = await posedetection.createDetector(
      posedetection.SupportedModels.MoveNet,
      detectorConfig
    );
    setModelLoaded(true);
    detectPose(detector);
  };

  const detectPose = async (detector) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    video.width = 640;
    video.height = 480;
    canvas.width = 640;
    canvas.height = 480;

    async function poseFrame() {
      const poses = await detector.estimatePoses(video);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, video.width, video.height);
      if (poses.length > 0) {
        const keypoints = poses[0].keypoints;
        drawKeypoints(keypoints, ctx);
        drawSkeleton(keypoints, ctx);

        // Simple squat rep counter using hip y-position
        const hip = keypoints[11]; // Left hip
        if (hip && hip.score > 0.5) {
          const y = hip.y;
          if (lastY !== null) {
            if (direction === "down" && y > lastY + 30) {
              setDirection("up");
              setRepCount((r) => r + 1);
            } else if (direction === "up" && y < lastY - 30) {
              setDirection("down");
            }
          }
          setLastY(y);
        }
      }
      requestAnimationFrame(poseFrame);
    }

    poseFrame();
  };

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    videoRef.current.play();
    loadModel();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-4">IronForm AI</h1>
      <p className="text-lg">Reps Counted: {repCount}</p>
      <video ref={videoRef} className="hidden" />
      <canvas ref={canvasRef} className="border-2 border-green-500" />
      <button
        onClick={startCamera}
        className="mt-6 px-4 py-2 bg-green-600 rounded-lg hover:bg-green-700"
      >
        Start Form Analysis
      </button>
    </div>
  );
}

export default App;
