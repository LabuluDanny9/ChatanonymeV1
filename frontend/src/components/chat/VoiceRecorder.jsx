/**
 * Voice Recorder — Enregistrement vocal
 * Waveform, pause/resume, playback, >2h
 */

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Play, Pause, Send, X } from 'lucide-react';
import api, { getApiBaseUrl } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

export default function VoiceRecorder({ onSend, onCancel }) {
  const toast = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [waveformData, setWaveformData] = useState([]);
  const [sending, setSending] = useState(false);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
          setAudioBlob(blob);
        }
      };

      recorder.start(100);
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } catch (err) {
      console.error('Erreur micro:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      clearInterval(timerRef.current);
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  const togglePause = () => {
    if (!mediaRecorderRef.current) return;
    if (isPaused) {
      mediaRecorderRef.current.resume();
    } else {
      mediaRecorderRef.current.pause();
    }
    setIsPaused(!isPaused);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSend = async () => {
    if (!audioBlob || sending) return;
    setSending(true);
    let payload = null;
    try {
      const formData = new FormData();
      const ext = audioBlob.type?.includes('webm') ? '.webm' : '.ogg';
      formData.append('file', audioBlob, `voice-${Date.now()}${ext}`);
      const authHeader = api.defaults.headers?.common?.['Authorization'];
      const { data } = await api.post('/api/upload', formData, {
        headers: authHeader ? { Authorization: authHeader } : undefined,
        timeout: 20000,
      });
      const base = getApiBaseUrl().replace(/\/$/, '');
      const fullUrl = data.url?.startsWith('http') ? data.url : `${base}${data.url?.startsWith('/') ? '' : '/'}${data.url || ''}`;
      payload = { type: 'voice', url: fullUrl, duration, metadata: { url: fullUrl, duration } };
    } catch (err) {
      console.error('[VoiceRecorder] Upload échoué, fallback base64:', err?.message);
      if (toast) toast.error('Upload impossible, envoi direct...');
      const reader = new FileReader();
      payload = await new Promise((resolve, reject) => {
        reader.onloadend = () => resolve({ type: 'voice', data: reader.result, duration });
        reader.onerror = () => reject(new Error('Lecture échouée'));
        reader.readAsDataURL(audioBlob);
      });
    }
    if (payload) {
      try {
        const result = onSend(payload);
        if (result && typeof result.then === 'function') await result;
        setAudioBlob(null);
        setDuration(0);
      } catch (err) {
        console.error('[VoiceRecorder] Envoi échoué:', err);
        if (toast) toast.error('Impossible d\'envoyer le message vocal');
      }
    }
    setSending(false);
  };

  const handlePlay = () => {
    if (!audioBlob) return;
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      const url = URL.createObjectURL(audioBlob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    if (isRecording && !isPaused) {
      const interval = setInterval(() => {
        setWaveformData((prev) => {
          const next = [...prev, Math.random() * 0.6 + 0.2];
          return next.slice(-20);
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isRecording, isPaused]);

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-4 p-4 rounded-xl bg-corum-night/80 border border-white/10"
    >
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
      {isRecording ? (
        <>
          <motion.button
            type="button"
            onClick={togglePause}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-xl bg-corum-turquoise/20 text-corum-turquoise"
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </motion.button>
          <div className="flex-1 flex items-center gap-2">
            <div className="flex items-center gap-1 h-8">
              {(waveformData.length ? waveformData : [0.3, 0.5, 0.4, 0.6, 0.5]).map((h, i) => (
                <motion.div
                  key={i}
                  animate={{ height: `${h * 100}%` }}
                  className="w-1 rounded-full bg-corum-turquoise min-h-[4px]"
                />
              ))}
            </div>
            <span className="text-sm text-corum-offwhite font-mono">{formatTime(duration)}</span>
          </div>
          <motion.button
            type="button"
            onClick={stopRecording}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-xl bg-corum-red/20 text-corum-red"
          >
            <Square className="w-5 h-5" />
          </motion.button>
        </>
      ) : audioBlob ? (
        <>
          <motion.button
            type="button"
            onClick={handlePlay}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-xl bg-corum-turquoise/20 text-corum-turquoise"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </motion.button>
          <span className="text-sm text-corum-gray flex-1">{formatTime(duration)}</span>
          <motion.button
            type="button"
            onClick={() => { setAudioBlob(null); setDuration(0); }}
            disabled={sending}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-xl text-corum-gray hover:bg-white/5 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </motion.button>
          <motion.button
            type="button"
            onClick={handleSend}
            disabled={sending}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-xl bg-chat-accent text-white disabled:opacity-50 flex items-center gap-1"
          >
            {sending ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </>
      ) : (
        <div className="flex items-center gap-2 flex-1">
          <motion.button
            type="button"
            onClick={startRecording}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-corum-red/20 text-corum-red"
          >
            <Mic className="w-5 h-5" />
            Démarrer
          </motion.button>
          <motion.button
            type="button"
            onClick={onCancel}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-xl text-corum-gray hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
