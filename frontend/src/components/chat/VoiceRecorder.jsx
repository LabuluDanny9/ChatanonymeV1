/**
 * Voice Recorder — Enregistrement vocal (WebM / MP4 selon navigateur)
 */

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, Play, Pause, Send, X } from 'lucide-react';
import api, { getApiBaseUrl, ensureAuthToken } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

function pickRecorderMime() {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
  ];
  for (const m of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(m)) return m;
  }
  return '';
}

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
  const mimeRef = useRef('');
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioRef = useRef(null);
  const streamRef = useRef(null);

  const startRecording = async () => {
    if (typeof MediaRecorder === 'undefined') {
      toast.error('Enregistrement vocal non supporté par ce navigateur.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;
      const mimeType = pickRecorderMime();
      mimeRef.current = mimeType;
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        if (chunksRef.current.length > 0) {
          const type = recorder.mimeType || mimeRef.current || 'audio/webm';
          const blob = new Blob(chunksRef.current, { type });
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
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        toast.error('Micro refusé. Autorisez l’accès au microphone dans les paramètres du navigateur.');
      } else if (err?.name === 'NotFoundError') {
        toast.error('Aucun microphone détecté.');
      } else {
        toast.error('Impossible d’accéder au microphone.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        /* ignore */
      }
      clearInterval(timerRef.current);
      setIsRecording(false);
      setIsPaused(false);
      mediaRecorderRef.current = null;
    }
  };

  const togglePause = () => {
    if (!mediaRecorderRef.current) return;
    try {
      if (isPaused) {
        mediaRecorderRef.current.resume();
      } else {
        mediaRecorderRef.current.pause();
      }
      setIsPaused(!isPaused);
    } catch {
      /* pause non supporté sur certains navigateurs */
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSend = async () => {
    if (!audioBlob || sending) return;
    if (audioBlob.size < 400) {
      toast.error('Enregistrement trop court.');
      return;
    }
    setSending(true);
    ensureAuthToken('user');
    let payload = null;
    try {
      const formData = new FormData();
      const type = audioBlob.type || 'audio/webm';
      const ext = type.includes('webm') ? '.webm' : type.includes('mp4') || type.includes('m4a') ? '.m4a' : type.includes('ogg') ? '.ogg' : '.webm';
      formData.append('file', audioBlob, `voice-${Date.now()}${ext}`);
      const { data } = await api.post('/api/upload', formData, {
        timeout: 60000,
      });
      const base = getApiBaseUrl().replace(/\/$/, '');
      const fullUrl = data.url?.startsWith('http') ? data.url : `${base}${data.url?.startsWith('/') ? '' : '/'}${data.url || ''}`;
      payload = {
        type: 'voice',
        url: fullUrl,
        duration,
        metadata: { url: fullUrl, duration },
      };
    } catch (err) {
      console.error('[VoiceRecorder] Upload échoué, fallback base64:', err?.message);
      toast.info('Envoi direct du fichier audio…');
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
        toast.error("Impossible d'envoyer le message vocal");
      }
    }
    setSending(false);
  };

  const handlePlay = () => {
    if (!audioBlob) return;
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      const url = URL.createObjectURL(audioBlob);
      if (audioRef.current) {
        audioRef.current.src = url;
        audioRef.current.play();
      }
      setIsPlaying(true);
    }
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
    return () => {
      clearInterval(timerRef.current);
      streamRef.current?.getTracks?.().forEach((t) => t.stop());
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-4 p-4 rounded-xl bg-app-card border border-app-border"
    >
      <audio ref={audioRef} onEnded={() => setIsPlaying(false)} />
      {isRecording ? (
        <>
          <motion.button
            type="button"
            onClick={togglePause}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-xl bg-app-blue/15 text-app-blue shrink-0"
          >
            {isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </motion.button>
          <div className="flex-1 flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1 h-8 flex-1 min-w-0 overflow-hidden">
              {(waveformData.length ? waveformData : [0.3, 0.5, 0.4, 0.6, 0.5]).map((h, i) => (
                <motion.div
                  key={i}
                  animate={{ height: `${h * 100}%` }}
                  className="w-1 rounded-full bg-app-purple min-h-[4px]"
                />
              ))}
            </div>
            <span className="text-sm text-app-text font-mono shrink-0">{formatTime(duration)}</span>
          </div>
          <motion.button
            type="button"
            onClick={stopRecording}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-xl bg-app-danger/15 text-app-danger shrink-0"
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
            className="p-2 rounded-xl bg-app-blue/15 text-app-blue shrink-0"
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </motion.button>
          <span className="text-sm text-app-muted flex-1 min-w-0 truncate">{formatTime(duration)}</span>
          <motion.button
            type="button"
            onClick={() => {
              setAudioBlob(null);
              setDuration(0);
            }}
            disabled={sending}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-xl text-app-muted hover:bg-app-surface disabled:opacity-50 shrink-0"
          >
            <X className="w-5 h-5" />
          </motion.button>
          <motion.button
            type="button"
            onClick={handleSend}
            disabled={sending}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-xl bg-app-purple text-white disabled:opacity-50 flex items-center gap-1 shrink-0"
          >
            {sending ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </motion.button>
        </>
      ) : (
        <div className="flex items-center gap-2 flex-1 flex-wrap">
          <motion.button
            type="button"
            onClick={startRecording}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-app-purple/20 text-app-purple font-medium"
          >
            <Mic className="w-5 h-5" />
            Enregistrer
          </motion.button>
          <span className="text-xs text-app-muted hidden sm:inline">Micro requis — message vocal jusqu’à quelques minutes</span>
          <motion.button
            type="button"
            onClick={onCancel}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-xl text-app-muted hover:bg-app-surface ml-auto"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
