import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const chatbotWidgetScriptUrl =
  process.env.NEXT_PUBLIC_CHATBOT_WIDGET_SCRIPT_URL ??
  'https://smart-chat-assistant-nestjs-fe.vercel.app/widget.js';
const chatbotWidgetOrigin =
  process.env.NEXT_PUBLIC_CHATBOT_WIDGET_ORIGIN ??
  'https://smart-chat-assistant-nestjs-fe.vercel.app';
const chatbotApiBase =
  process.env.NEXT_PUBLIC_CHATBOT_API_BASE ??
  'https://api-chatbot.codelife138.io.vn';
const chatbotId =
  process.env.NEXT_PUBLIC_CHATBOT_ID ??
  '9382504a-9d4b-4764-ac63-240955cf55ae';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: 'Luxe Time - Đồng Hồ Cao Cấp Chính Hãng',
  description:
    'Shop đồng hồ cao cấp chính hãng - Rolex, Omega, Tag Heuer, Tissot. Bảo hành chính hãng, giao hàng toàn quốc.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        {children}
        <Script
          src={chatbotWidgetScriptUrl}
          strategy="afterInteractive"
          data-chatbot-id={chatbotId}
          data-widget-origin={chatbotWidgetOrigin}
          data-api-base={chatbotApiBase}
          data-position="bottom-right"
          data-color="#e6e04c"
          data-lang="vi"
        />
      </body>
    </html>
  );
}
