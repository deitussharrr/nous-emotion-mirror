
import React, { useRef, useState } from "react";
import { Mic, Loader2, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from '@/components/ui/use-toast';

const WHISPER_API_KEY = "VQVDcxXCbnn3GwPW9vEBNozCP4Stzxz0"; // Provided by user

interface WhisperApiVoiceInputProps {
  onTranscribe: (text: string) => void;
  disabled?: boolean;
}

const WhisperApiVoiceInput: React.FC<WhisperApiVoiceInputProps> = ({
  onTranscribe,
  disabled = false,
}) => {
  const [recording, setRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    if (recording || loading) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.current.push(e.data);
      };

      recorder.onstop = async () => {
        setLoading(true);
        const audioBlob = new Blob(chunks.current, { type: "audio/webm" });
        chunks.current = [];

        // Send blob to WhisperAPI
        const formData = new FormData();
        formData.append("file", audioBlob, "voice.webm");
        formData.append("task", "transcribe");

        try {
          const resp = await fetch("https://api.lemonfox.io/whisper", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${WHISPER_API_KEY}`,
            },
            body: formData,
          });
          if (!resp.ok) throw new Error("Transcription failed");
          const result = await resp.json();
          if (result.text) {
            onTranscribe(result.text);
            toast({ title: "Transcription Complete", description: "Voice transcript added!", variant: "default" });
          } else {
            toast({ title: "Transcription Error", description: "No text returned from API", variant: "destructive" });
          }
        } catch (err: any) {
          toast({ title: "Transcription Error", description: err.message || "Unknown error", variant: "destructive" });
        }
        setLoading(false);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (err: any) {
      toast({ title: "Could not record audio", description: err.message || "Permission denied", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (!mediaRecorder) return;
    mediaRecorder.stop();
    setRecording(false);
    setMediaRecorder(null);
  };

  return (
    <Button
      type="button"
      size="icon"
      variant="secondary"
      onClick={recording ? stopRecording : startRecording}
      className={`rounded-full h-12 w-12 bg-orange-500 hover:bg-orange-600 transition-colors mr-2 ${recording ? "animate-pulse" : ""}`}
      disabled={disabled || loading}
      aria-label={recording ? "Stop voice (Lemonfox WhisperAPI)" : "Record voice (Lemonfox WhisperAPI)"}
      title="Transcribe voice with Lemonfox WhisperAPI"
    >
      {loading ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : recording ? (
        <MicOff className="h-5 w-5 text-white" />
      ) : (
        <Mic className="h-5 w-5 text-white" />
      )}
    </Button>
  );
};

export default WhisperApiVoiceInput;

