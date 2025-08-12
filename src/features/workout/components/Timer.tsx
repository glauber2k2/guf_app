import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface TimerProps {
  initialTime?: number;
  onTimeChange?: (seconds: number) => void;
  onStartStop?: (running: boolean) => void;
}

const Timer: React.FC<TimerProps> = ({
  initialTime = 0,
  onTimeChange,
  onStartStop,
}) => {
  const [elapsedTime, setElapsedTime] = useState(initialTime);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => {
        setElapsedTime((prevTime) => {
          const newTime = prevTime + 1;
          if (onTimeChange) onTimeChange(newTime);
          return newTime;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    // Cleanup on unmount or timerRunning change
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerRunning, onTimeChange]);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds]
      .map((unit) => String(unit).padStart(2, "0"))
      .join(":");
  };

  const handleStartStopTimer = () => {
    setTimerRunning((prev) => {
      const newRunning = !prev;
      if (onStartStop) onStartStop(newRunning);
      return newRunning;
    });
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    setElapsedTime(0);
    if (onTimeChange) onTimeChange(0);
  };

  return (
    <View className="absolute bottom-6 self-center py-4 px-6 rounded-full gap-4 bg-violet-800 z-50 flex-row items-center justify-between">
      <Text className="text-2xl font-bold text-purple-100">
        {formatTime(elapsedTime)}
      </Text>
      <View className="flex-row gap-2">
        <TouchableOpacity
          className="bg-purple-50/10 justify-center p-4 rounded-full"
          onPress={handleResetTimer}
        >
          <Ionicons name="refresh" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          className="bg-purple-50/10 justify-center p-4 rounded-full"
          onPress={handleStartStopTimer}
        >
          <Ionicons
            name={timerRunning ? "pause" : "play"}
            size={24}
            color="white"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Timer;
