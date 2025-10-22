import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';
import { useState, useRef } from 'react';

interface Service {
  id: number;
  name: string;
  tokens: number;
}

interface ChatInputProps {
  message: string;
  setMessage: (msg: string) => void;
  handleSend: () => void;
  isLoading: boolean;
  selectedService: number;
  setSelectedService: (id: number) => void;
  services: Service[];
  deepThinkMode: boolean;
  setDeepThinkMode: (mode: boolean) => void;
  attachedFiles: Array<{name: string; content: string; type: string}>;
  removeFile: (index: number) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function ChatInput({
  message,
  setMessage,
  handleSend,
  isLoading,
  selectedService,
  setSelectedService,
  services,
  deepThinkMode,
  setDeepThinkMode,
  attachedFiles,
  removeFile,
  fileInputRef,
  handleFileUpload
}: ChatInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const startVoiceRecording = async () => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        alert('Распознавание речи не поддерживается в вашем браузере. Попробуйте Chrome или Edge.');
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }).catch((err) => {
        alert('Не удалось получить доступ к микрофону. Проверьте разрешения браузера.');
        throw err;
      });
      
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.fftSize = 256;
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateAudioLevel = () => {
        if (analyserRef.current && isRecording) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setAudioLevel(Math.min(100, (average / 128) * 100));
          animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        }
      };

      const recognition = new SpeechRecognition();
      
      recognition.lang = 'ru-RU';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          setMessage(prev => prev + finalTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Ошибка распознавания речи:', event.error);
        setIsRecording(false);
        stream.getTracks().forEach(track => track.stop());
      };

      recognition.onend = () => {
        setIsRecording(false);
        setAudioLevel(0);
        stream.getTracks().forEach(track => track.stop());
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };

      recognition.start();
      setIsRecording(true);
      updateAudioLevel();
      mediaRecorderRef.current = recognition;
    } catch (error) {
      console.error('Ошибка доступа к микрофону:', error);
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (typeof mediaRecorderRef.current.stop === 'function') {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
      setAudioLevel(0);
      
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    }
  };

  return (
    <div className="border-t border-border bg-card px-3 py-3 shrink-0">
      <div className="container mx-auto max-w-4xl space-y-3">
        <div className="flex items-center gap-2">
          <Button
            variant={deepThinkMode ? "default" : "ghost"}
            size="sm"
            onClick={() => setDeepThinkMode(!deepThinkMode)}
            className="shrink-0"
          >
            <Icon name="Sparkles" size={18} />
            <span className="ml-1 text-xs hidden sm:inline">Креативное мышление</span>
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0"
          >
            <Icon name="Paperclip" size={18} />
          </Button>
          <Button 
            variant={isRecording ? "destructive" : "ghost"}
            size="sm"
            onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
            className="shrink-0 relative"
          >
            <Icon name={isRecording ? "MicOff" : "Mic"} size={18} />
            {isRecording && (
              <span 
                className="absolute -bottom-1 left-0 h-1 bg-red-500 rounded-full transition-all duration-100"
                style={{ width: `${audioLevel}%` }}
              />
            )}
          </Button>
          <input 
            ref={fileInputRef}
            type="file" 
            multiple 
            className="hidden"
            onChange={handleFileUpload}
            accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
          />
        </div>

        {attachedFiles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {attachedFiles.map((file, idx) => (
              <Badge key={idx} variant="secondary" className="pr-1">
                <Icon name="File" size={14} className="mr-1" />
                {file.name}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => removeFile(idx)}
                >
                  <Icon name="X" size={12} />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Отправить сообщение в Juno"
              className="min-h-[44px] max-h-[200px] pr-12 resize-none"
              disabled={isLoading}
            />
            <Button 
              onClick={handleSend} 
              disabled={isLoading || !message.trim()} 
              size="sm"
              className="absolute right-2 bottom-2 h-8 w-8 p-0"
            >
              <Icon name="ArrowUp" size={18} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}