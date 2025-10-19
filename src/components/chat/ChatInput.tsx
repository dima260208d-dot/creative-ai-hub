import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

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
  return (
    <div className="border-t border-border bg-card px-4 py-4 shrink-0">
      <div className="container mx-auto max-w-4xl space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch 
                id="deep-think" 
                checked={deepThinkMode} 
                onCheckedChange={setDeepThinkMode}
              />
              <Label htmlFor="deep-think" className="text-sm cursor-pointer">
                🧠 Глубокое мышление <Badge variant="outline" className="ml-1">+10 токенов</Badge>
              </Label>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Icon name="Paperclip" size={16} className="mr-1" />
            Файлы
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

        <Select value={selectedService.toString()} onValueChange={(v) => setSelectedService(parseInt(v))}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите сервис" />
          </SelectTrigger>
          <SelectContent>
            {services.map(service => (
              <SelectItem key={service.id} value={service.id.toString()}>
                <div className="flex items-center justify-between w-full">
                  <span>{service.name}</span>
                  <Badge variant="outline" className="ml-2">{service.tokens} токенов</Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Напиши сообщение..."
            className="min-h-[60px] max-h-[200px]"
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading} size="lg">
            <Icon name="Send" size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
}
