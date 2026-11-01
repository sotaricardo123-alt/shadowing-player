import { useRef, useState } from "react";

function getRecordingErrorMessage(err) {
  if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
    return "Microphone access denied. Please allow microphone permission in your browser.";
  }
  if (err.name === "NotFoundError") {
    return "No microphone found. Please connect a microphone and try again.";
  }
  return err.message || "Failed to start recording.";
}

export function useMediaRecorder() {
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordedUrlRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [recordingError, setRecordingError] = useState(null);

  const startRecording = async () => {
    setRecordingError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setRecordingError("Recording is not supported in this browser.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);

      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => audioChunksRef.current.push(e.data);
      recorder.onstop = () => {
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        if (recordedUrlRef.current) {
          URL.revokeObjectURL(recordedUrlRef.current);
        }
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        recordedUrlRef.current = url;
        setRecordedAudio(url);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (err) {
      setRecordingError(getRecordingErrorMessage(err));
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const clearRecordingError = () => setRecordingError(null);

  return {
    isRecording,
    recordedAudio,
    recordingError,
    startRecording,
    stopRecording,
    clearRecordingError,
  };
}
