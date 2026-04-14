'use client';

import { useEffect } from 'react';
import { useLocale } from 'next-intl';

declare global {
  interface Window {
    ZaloSocialSDK?: { reload: () => void };
  }
}

const WELCOME_MESSAGES: Record<string, string> = {
  vi: 'Xin chào! Hanie có thể giúp gì cho bạn? 💗',
  en: 'Hello! How can Hanie help you today? 💗',
  ko: '안녕하세요! Hanie가 어떻게 도와드릴까요? 💗',
};

interface ZaloChatWidgetProps {
  oaId: string;
}

export function ZaloChatWidget({ oaId }: ZaloChatWidgetProps) {
  const locale = useLocale();
  const welcomeMessage = WELCOME_MESSAGES[locale] ?? WELCOME_MESSAGES['vi'];

  useEffect(() => {
    // Load Zalo SDK nếu chưa có
    if (!document.getElementById('zalo-sdk')) {
      const script = document.createElement('script');
      script.id = 'zalo-sdk';
      script.src = 'https://sp.zalo.me/plugins/sdk.js';
      script.async = true;
      script.onload = () => {
        window.ZaloSocialSDK?.reload();
      };
      document.body.appendChild(script);
    } else {
      window.ZaloSocialSDK?.reload();
    }
  }, [oaId]);

  return (
    <div
      className="zalo-chat-widget"
      data-oaid={oaId}
      data-welcome-message={welcomeMessage}
      data-autopopup="0"
      data-width="350"
      data-height="420"
    />
  );
}
