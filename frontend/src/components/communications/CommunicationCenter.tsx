import React from 'react';
import MessageBoard from './MessageBoard';
import { useDashboardIntegration } from '@/hooks/useDashboardIntegration';
import type { Message } from '@/types/messages';

const CommunicationCenter: React.FC = () => {
  const { notifyCommunicationSent } = useDashboardIntegration();

  const handleMessageCreated = (message: Message) => {
    // Notificar o dashboard sobre a nova mensagem
    notifyCommunicationSent(1, 'Recado');
  };

  return <MessageBoard onMessageCreated={handleMessageCreated} />;
};

export default CommunicationCenter;