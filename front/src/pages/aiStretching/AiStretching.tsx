import { useRef } from "react";
import * as posenet from "@tensorflow-models/posenet";
import Webcam from "react-webcam";
import { drawKeypoints, drawSkeleton } from "./util";
import * as poseDetection from "@tensorflow-models/pose-detection";
import { Socket, io } from "socket.io-client";

require("@tensorflow/tfjs");
const AiStretching = () => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const socketUrl = "ws://localhost:8000";
  const socket = io(socketUrl as string);
  //user media device select할 때 일단 콘솔.. 이걸 적용시켜야함
  navigator.mediaDevices
    .enumerateDevices()
    .then((devices) =>
      console.log(devices.filter((x) => x.kind == "videoinput"))
    );

  const detectWebCamFeed = async (detector: poseDetection.PoseDetector) => {
    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null &&
      (webcamRef.current as any).video.readyState === 4
    ) {
      const video = (webcamRef.current as any).video;
      const videoWidth = (webcamRef.current as any).video.videoWidth;
      const videoHeight = (webcamRef.current as any).video.videoHeight;
      (webcamRef.current as any).video.width = videoWidth;
      (webcamRef.current as any).video.height = videoHeight;
      const pose = await detector.estimatePoses(video);
      let dataArr: any = [];
      if(!pose[0].keypoints) return;
      const dataToSend = pose[0].keypoints.slice(0, 11);
      if (dataToSend) {
        dataToSend.forEach((item) => {
          dataArr.push(item.x);
          dataArr.push(item.y);
          dataArr.push(item.score);
        });
      }
      const dataArr2: {[name: string]: number[] }={};
      dataArr2.xy_coord = dataArr

      // console.log(JSON.stringify(dataArr))
      console.log(dataArr2);
      socket.emit("model", dataArr2);

      socket.on('model',(message)=>{
        console.log(message)
      })
      
      drawResult(pose, video, videoWidth, videoHeight, canvasRef);
    }
  };
  
  const runMovenet = async () => {
    const detectorConfig = {
      modelType: poseDetection.movenet.modelType.SINGLEPOSE_THUNDER,
    };
    const detector = await poseDetection.createDetector(
      poseDetection.SupportedModels.MoveNet,
      detectorConfig
    );

    setInterval(() => {
      detectWebCamFeed(detector);
    }, 100);
  };
  runMovenet();

  const drawResult = (
    pose: any,
    video: any,
    videoWidth: number,
    videoHeight: number,
    canvas: any
  ) => {
    const ctx = canvas.current.getContext("2d");
    canvas.current.width = videoWidth;
    canvas.current.height = videoHeight;
    drawKeypoints(pose[0]["keypoints"], 0.3, ctx, videoWidth);
    drawSkeleton(pose[0]["keypoints"], 0.3, ctx, videoWidth);
  };
  return (
    <div>
      <Webcam
        ref={webcamRef}
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 9,
          width: 640,
          height: 480,
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 0,
          right: 0,
          textAlign: "center",
          zIndex: 9,
          width: 640,
          height: 480,
        }}
      />
    </div>
  );
};

export default AiStretching;