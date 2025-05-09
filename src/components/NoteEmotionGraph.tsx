
import React from "react";
import { ConversationMessage } from "@/types";
import EmotionGraph from "./EmotionGraph";
import { EmotionType } from "@/types";

interface NoteEmotionGraphProps {
  messages: ConversationMessage[];
}

const NoteEmotionGraph: React.FC<NoteEmotionGraphProps> = ({ messages }) => {
  // If there are no messages with emotions, don't render anything
  if (!messages.length || !messages.some(message => message.emotion)) {
    return null;
  }

  // Format messages for the emotion graph
  const emotionData = messages
    .filter(message => message.emotion)
    .map(message => ({
      timestamp: message.timestamp || new Date().toISOString(),
      label: message.emotion?.label as EmotionType,
      score: message.emotion?.score || 0,
      messageContent: message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
    }))
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  if (emotionData.length <= 1) {
    return (
      <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
        <p className="text-sm text-nousText-muted text-center">
          Add more messages to see your emotion graph
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 p-3 rounded-lg bg-white/5 border border-white/10">
      <p className="text-sm text-nousText-muted mb-2">Emotion changes in this note:</p>
      <div className="h-[180px]">
        <EmotionGraph emotionData={emotionData} compact dayView />
      </div>
    </div>
  );
};

export default NoteEmotionGraph;
