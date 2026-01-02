
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Bell, MessageCircle, Mail, Phone } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface AlertConfig {
  email: {
    enabled: boolean;
    address: string;
  };
  whatsapp: {
    enabled: boolean;
    number: string;
  };
  telegram: {
    enabled: boolean;
    chatId: string;
    botToken: string;
  };
}

interface AlertConfigDialogProps {
  trigger?: React.ReactNode;
}

const AlertConfigDialog: React.FC<AlertConfigDialogProps> = ({ trigger }) => {
  const [config, setConfig] = useState<AlertConfig>({
    email: { enabled: false, address: '' },
    whatsapp: { enabled: false, number: '' },
    telegram: { enabled: false, chatId: '', botToken: '' }
  });

  const [open, setOpen] = useState(false);

  const handleSave = () => {
    // Save configuration (you can implement this with your storage solution)
    console.log('Saving alert configuration:', config);
    localStorage.setItem('alertConfig', JSON.stringify(config));
    setOpen(false);
  };

  const updateEmailConfig = (field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      email: { ...prev.email, [field]: value }
    }));
  };

  const updateWhatsAppConfig = (field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      whatsapp: { ...prev.whatsapp, [field]: value }
    }));
  };

  const updateTelegramConfig = (field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      telegram: { ...prev.telegram, [field]: value }
    }));
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm">
      <Bell className="h-4 w-4 mr-2" />
      Alert Config
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alert Configuration
          </DialogTitle>
          <DialogDescription>
            Configure how you want to receive alerts from your trading strategies.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Email Configuration */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="email-enabled" className="text-sm">Enable Email Alerts</Label>
                <Switch
                  id="email-enabled"
                  checked={config.email.enabled}
                  onCheckedChange={(enabled) => updateEmailConfig('enabled', enabled)}
                />
              </div>
              {config.email.enabled && (
                <div className="space-y-2">
                  <Label htmlFor="email-address" className="text-sm">Email Address</Label>
                  <Input
                    id="email-address"
                    type="email"
                    placeholder="your-email@example.com"
                    value={config.email.address}
                    onChange={(e) => updateEmailConfig('address', e.target.value)}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* WhatsApp Configuration */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                WhatsApp Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="whatsapp-enabled" className="text-sm">Enable WhatsApp Alerts</Label>
                <Switch
                  id="whatsapp-enabled"
                  checked={config.whatsapp.enabled}
                  onCheckedChange={(enabled) => updateWhatsAppConfig('enabled', enabled)}
                />
              </div>
              {config.whatsapp.enabled && (
                <div className="space-y-2">
                  <Label htmlFor="whatsapp-number" className="text-sm">Phone Number</Label>
                  <Input
                    id="whatsapp-number"
                    type="tel"
                    placeholder="+1234567890"
                    value={config.whatsapp.number}
                    onChange={(e) => updateWhatsAppConfig('number', e.target.value)}
                  />
                  <div className="text-xs text-muted-foreground">
                    Include country code (e.g., +1 for US)
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Telegram Configuration */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Telegram Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="telegram-enabled" className="text-sm">Enable Telegram Alerts</Label>
                <Switch
                  id="telegram-enabled"
                  checked={config.telegram.enabled}
                  onCheckedChange={(enabled) => updateTelegramConfig('enabled', enabled)}
                />
              </div>
              {config.telegram.enabled && (
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="telegram-chat-id" className="text-sm">Chat ID</Label>
                    <Input
                      id="telegram-chat-id"
                      placeholder="123456789"
                      value={config.telegram.chatId}
                      onChange={(e) => updateTelegramConfig('chatId', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telegram-bot-token" className="text-sm">Bot Token</Label>
                    <Input
                      id="telegram-bot-token"
                      type="password"
                      placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"
                      value={config.telegram.botToken}
                      onChange={(e) => updateTelegramConfig('botToken', e.target.value)}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Create a bot via @BotFather on Telegram to get your bot token.
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Configuration
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AlertConfigDialog;
