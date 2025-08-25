import { useState, useEffect, useRef, useCallback } from 'react';

interface RevDetectionState {
  isListening: boolean;
  revIntensity: number; // 0-1 scale
  isRevving: boolean;
  lastRevTime: number;
  revCount: number;
}

interface EngineRevHook {
  revState: RevDetectionState;
  startListening: () => Promise<void>;
  stopListening: () => void;
  triggerManualRev: (intensity?: number) => void;
}

export const useEngineRevDetection = (): EngineRevHook => {
  const [revState, setRevState] = useState<RevDetectionState>({
    isListening: false,
    revIntensity: 0,
    isRevving: false,
    lastRevTime: 0,
    revCount: 0
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number>();

  // Engine rev detection algorithm
  const detectEngineRev = useCallback((frequencyData: Uint8Array) => {
    // Engine revs typically have strong low-mid frequency components (100-2000 Hz)
    const sampleRate = audioContextRef.current?.sampleRate || 44100;
    const binSize = sampleRate / frequencyData.length;
    
    // Focus on engine frequency range (100-2000 Hz)
    const startBin = Math.floor(100 / binSize);
    const endBin = Math.floor(2000 / binSize);
    
    let totalEnergy = 0;
    let peakFrequency = 0;
    let maxAmplitude = 0;

    for (let i = startBin; i < endBin && i < frequencyData.length; i++) {
      const amplitude = frequencyData[i];
      totalEnergy += amplitude;
      
      if (amplitude > maxAmplitude) {
        maxAmplitude = amplitude;
        peakFrequency = i * binSize;
      }
    }

    const averageEnergy = totalEnergy / (endBin - startBin);
    const normalizedIntensity = Math.min(averageEnergy / 128, 1); // Normalize to 0-1

    // Rev detection criteria
    const isRevving = normalizedIntensity > 0.3 && maxAmplitude > 100;
    const intensity = isRevving ? normalizedIntensity : 0;

    return { isRevving, intensity, peakFrequency };
  }, []);

  // Audio processing loop
  const processAudio = useCallback(() => {
    if (!analyserRef.current) return;

    const frequencyData = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(frequencyData);

    const { isRevving, intensity } = detectEngineRev(frequencyData);

    setRevState(prev => {
      const now = Date.now();
      const newRevCount = isRevving && !prev.isRevving ? prev.revCount + 1 : prev.revCount;
      
      return {
        ...prev,
        revIntensity: intensity,
        isRevving,
        lastRevTime: isRevving ? now : prev.lastRevTime,
        revCount: newRevCount
      };
    });

    animationFrameRef.current = requestAnimationFrame(processAudio);
  }, [detectEngineRev]);

  // Start microphone listening
  const startListening = useCallback(async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 44100
        } 
      });

      streamRef.current = stream;

      // Create audio context and analyser
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      microphoneRef.current = audioContextRef.current.createMediaStreamSource(stream);

      // Configure analyser for engine detection
      analyserRef.current.fftSize = 2048;
      analyserRef.current.smoothingTimeConstant = 0.3;
      
      // Connect audio nodes
      microphoneRef.current.connect(analyserRef.current);

      setRevState(prev => ({ ...prev, isListening: true }));

      // Start processing
      processAudio();

    } catch (error) {
      console.error('Error accessing microphone:', error);
      throw new Error('Microphone access denied. Please allow microphone access to use Rev to React.');
    }
  }, [processAudio]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    microphoneRef.current = null;

    setRevState(prev => ({
      ...prev,
      isListening: false,
      isRevving: false,
      revIntensity: 0
    }));
  }, []);

  // Manual rev trigger for testing/demo
  const triggerManualRev = useCallback((intensity: number = 0.8) => {
    setRevState(prev => ({
      ...prev,
      isRevving: true,
      revIntensity: intensity,
      lastRevTime: Date.now(),
      revCount: prev.revCount + 1
    }));

    // Auto-reset after animation
    setTimeout(() => {
      setRevState(prev => ({
        ...prev,
        isRevving: false,
        revIntensity: 0
      }));
    }, 1500);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    revState,
    startListening,
    stopListening,
    triggerManualRev
  };
};
