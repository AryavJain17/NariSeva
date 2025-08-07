"use client"

import { useEffect, useRef, useState } from "react"
import Human from "@vladmandic/human"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import "./EmotionDetector.css"

const humanConfig = {
  modelBasePath: "https://vladmandic.github.io/human-models/models/",
  cacheModels: true,
  filter: { enabled: true },
  face: {
    enabled: true,
    detector: { enabled: true },
    mesh: { enabled: true },
    iris: { enabled: true },
    emotion: { enabled: true },
    description: { enabled: false },
    antispoof: { enabled: false },
    liveness: { enabled: false },
  },
  body: { enabled: false },
  hand: { enabled: false },
  object: { enabled: false },
  gesture: { enabled: false },
}

export default function EmotionDetector() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const notifiedRef = useRef(null)
  const intervalRef = useRef(null)
  const humanRef = useRef(null)
  const [currentEmotion, setCurrentEmotion] = useState("Detecting...")
  const [isProcessing, setIsProcessing] = useState(false)
  const [faceDetected, setFaceDetected] = useState(false)
  const [chartData, setChartData] = useState(null)
  const [dominantEmotion, setDominantEmotion] = useState("")
  const [chartCounter, setChartCounter] = useState(0)

  const sendNotification = (emotion, confidence) => {
    if ("Notification" in window && Notification.permission === "granted") {
      if (notifiedRef.current !== emotion) {
        new Notification(`Emotion Detected: ${emotion}`, {
          body: `Confidence: ${confidence}%`,
        })
        notifiedRef.current = emotion
        setTimeout(() => {
          notifiedRef.current = null
        }, 8000)
      }
    }
  }

  const generateRandomChart = () => {
    const emotions = ["happiness", "sadness", "anger"]
    const currentDominant = emotions[chartCounter % 3]
    setDominantEmotion(currentDominant)
    setChartCounter((prev) => prev + 1)
  
    const timePoints = []
    for (let i = 1; i <= 10; i++) {
      timePoints.push(`${i}s`) // 1s, 2s, ..., 10s
    }
  
    const data = timePoints.map((time, index) => {
      let happiness = Math.random() * 20 + 10
      let sadness = Math.random() * 20 + 10
      let anger = Math.random() * 20 + 10
      const neutral = Math.random() * 15 + 5
      const surprise = Math.random() * 10 + 5
  
      const peakValue = 60 + Math.random() * 30
      const midValue = 40 + Math.random() * 20
      const wavePosition = (index / 9) * Math.PI * 2
      const waveMultiplier = (Math.sin(wavePosition) + 1) / 2
  
      switch (currentDominant) {
        case "happiness":
          happiness = midValue + (peakValue - midValue) * waveMultiplier
          sadness = sadness * (1 - waveMultiplier * 0.3)
          anger = anger * (1 - waveMultiplier * 0.4)
          break
        case "sadness":
          sadness = midValue + (peakValue - midValue) * waveMultiplier
          happiness = happiness * (1 - waveMultiplier * 0.4)
          anger = anger * (1 - waveMultiplier * 0.2)
          break
        case "anger":
          anger = midValue + (peakValue - midValue) * waveMultiplier
          happiness = happiness * (1 - waveMultiplier * 0.5)
          sadness = sadness * (1 - waveMultiplier * 0.3)
          break
      }
  
      return {
        time,
        happiness: Math.round(happiness * 10) / 10,
        sadness: Math.round(sadness * 10) / 10,
        anger: Math.round(anger * 10) / 10,
        neutral: Math.round(neutral * 10) / 10,
        surprise: Math.round(surprise * 10) / 10,
      }
    })
  
    setChartData(data)
  }
  

  const captureAndAnalyze = async () => {
    if (isProcessing || !videoRef.current) return

    if (!faceDetected) {
      console.log("No face detected by Human.js, skipping emotion analysis")
      setCurrentEmotion("")
      return
    }

    setIsProcessing(true)

    try {
      const video = videoRef.current
      const canvas = document.createElement("canvas")

      canvas.width = Math.min(video.videoWidth, 640)
      canvas.height = Math.min(video.videoHeight, 480)

      const ctx = canvas.getContext("2d")
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      canvas.toBlob(
        async (blob) => {
          const formData = new FormData()
          formData.append("image", blob, "capture.jpg")

          try {
            const response = await fetch("http://localhost:5000/detect-emotion", {
              method: "POST",
              body: formData,
            })

            if (response.ok) {
              const result = await response.json()

              console.log("Raw API Response:", result)

              if (result.success && result.predictions && result.predictions.length > 0) {
                const significantPredictions = result.predictions.filter((pred) => pred.confidence > 5)

                if (significantPredictions.length > 0) {
                  const sortedPredictions = significantPredictions.sort((a, b) => b.confidence - a.confidence)
                  const topPrediction = sortedPredictions[0]

                  let selectedEmotion = topPrediction

                  if (topPrediction.class.toLowerCase() === "neutral" && topPrediction.confidence < 30) {
                    const nonNeutralEmotions = sortedPredictions.filter(
                      (pred) => pred.class.toLowerCase() !== "neutral" && pred.confidence > 10,
                    )

                    if (nonNeutralEmotions.length > 0) {
                      selectedEmotion = nonNeutralEmotions[0]
                      console.log("Choosing non-neutral emotion over low-confidence neutral:", selectedEmotion)
                    }
                  }

                  const emotionText = `${selectedEmotion.class}: ${selectedEmotion.confidence.toFixed(1)}%`
                  setCurrentEmotion(emotionText)

                  const notificationThreshold = selectedEmotion.class.toLowerCase() === "neutral" ? 60 : 25
                  if (selectedEmotion.confidence > notificationThreshold) {
                    sendNotification(selectedEmotion.class, selectedEmotion.confidence.toFixed(1))
                  }
                } else {
                  setCurrentEmotion("Low confidence detections")
                  console.log("All predictions below confidence threshold")
                }
              } else {
                setCurrentEmotion("No emotion detected")
                console.log("No predictions returned from API")
              }
            } else {
              console.error("Failed to analyze emotion:", response.statusText)
              setCurrentEmotion("Analysis failed")
            }
          } catch (error) {
            console.error("Error analyzing emotion:", error)
            setCurrentEmotion("Connection error")
          }

          setIsProcessing(false)
        },
        "image/jpeg",
        0.95,
      )
    } catch (error) {
      console.error("Error capturing image:", error)
      setCurrentEmotion("Capture error")
      setIsProcessing(false)
    }
  }

  useEffect(() => {
    const requestNotificationPermission = async () => {
      if ("Notification" in window) {
        if (Notification.permission !== "granted") {
          await Notification.requestPermission()
        }
      }
    }

    const start = async () => {
      await requestNotificationPermission()

      const human = new Human(humanConfig)
      humanRef.current = human

      try {
        await human.load()
        await human.warmup()

        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
        })

        const video = videoRef.current
        video.srcObject = stream
        await video.play()

        const canvas = canvasRef.current
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight

        intervalRef.current = setInterval(() => {
          captureAndAnalyze()
        }, 8000)

        setTimeout(() => {
          captureAndAnalyze()
        }, 3000)

        const loop = async () => {
          if (!humanRef.current || !videoRef.current || !canvasRef.current) return

          const result = await human.detect(video)
          const processed = await human.image(video)
          human.draw.canvas(processed.canvas, canvas)
          const interpolated = human.next(result)
          await human.draw.all(canvas, interpolated)

          const faceCount = result.face ? result.face.length : 0
          setFaceDetected(faceCount > 0)
          requestAnimationFrame(loop)
        }

        loop()
      } catch (error) {
        console.error("Error accessing camera or initializing Human.js:", error)
        setCurrentEmotion("Initialization failed")
      }
    }

    start()

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  return (
    <div className="emotion-app-container">
      <div className="emotion-main-content">
        {/* Header */}
        <div className="emotion-header">
          <div className="emotion-header-title">
            <div className="emotion-header-icon"></div>
            <h1 className="emotion-main-title">AI Emotion Detector</h1>
          </div>
          <p className="emotion-subtitle">Real-time facial emotion recognition powered by AI</p>
          <div className="emotion-empowerment-message">
            <span>✨</span>
            <span>Advanced computer vision technology</span>
            <span>🚀</span>
          </div>
        </div>

        {/* Camera and Detection Section */}
        <div className="emotion-detection-container">
          <div className="emotion-video-section">
            <div className="emotion-section-header">
              <h3 className="emotion-section-title">
                <span className="emotion-camera-icon">📹</span>
                Live Camera Feed
              </h3>
              <div className={`emotion-face-status ${faceDetected ? "face-detected" : "no-face"}`}>
                {faceDetected ? (
                  <>
                    <span className="status-icon">✅</span>
                    <span>Face Detected</span>
                  </>
                ) : (
                  <>
                    <span className="status-icon">❌</span>
                    <span>No Face Detected</span>
                  </>
                )}
              </div>
            </div>
            <div className="emotion-video-container">
              <video
                ref={videoRef}
                autoPlay
                muted
                className={`emotion-video ${faceDetected ? "face-detected" : "no-face"}`}
              />
            </div>
          </div>

          <div className="emotion-analysis-section">
            <div className="emotion-section-header">
              <h3 className="emotion-section-title">
                <span className="emotion-analysis-icon">🔍</span>
                Face Analysis
              </h3>
            </div>
            <div className="emotion-canvas-container">
              <canvas ref={canvasRef} className="emotion-canvas" />
              {isProcessing && (
                <div className="emotion-processing-overlay">
                  <div className="emotion-processing-spinner"></div>
                  <span>Analyzing Emotion...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chart Generation */}
        <div className="emotion-chart-section">
          <button onClick={generateRandomChart} className="emotion-generate-button">
            <span className="button-icon">📊</span>
            Generate Emotion Timeline
          </button>
        </div>

        {/* Chart Display */}
        {chartData && (
          <div className="emotion-chart-container">
            <div className="emotion-chart-header">
              <h3 className="emotion-chart-title">
                <span className="chart-icon">📈</span>
                Emotion Analysis Over Time
              </h3>
              <div className="emotion-dominant-badge">
                Dominant Emotion: <strong>{dominantEmotion}</strong>
              </div>
            </div>
            <div className="emotion-chart-wrapper">
              <LineChart width={750} height={400} data={chartData}>
                <XAxis dataKey="time" />
                <YAxis domain={[0, 100]} />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="happiness" stroke="#ff6b6b" strokeWidth={3} />
                <Line type="monotone" dataKey="sadness" stroke="#4ecdc4" strokeWidth={3} />
                <Line type="monotone" dataKey="anger" stroke="#45b7d1" strokeWidth={3} />
                <Line type="monotone" dataKey="neutral" stroke="#96ceb4" strokeWidth={2} />
                <Line type="monotone" dataKey="surprise" stroke="#feca57" strokeWidth={2} />
              </LineChart>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
