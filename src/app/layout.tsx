import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://cruise-jade.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "전세계 크루즈 최저가 | 거품 빠진 가격으로 떠나는 세계일주",
    template: "%s | 크루즈 최저가",
  },
  description:
    "9년 크루즈 전문가의 1:1 맞춤 상담. 지중해, 알래스카, 캐리비안 크루즈 최저가 보장. 세금·팁·항만세 포함 투명한 가격. 지금 무료 상담 신청하세요!",
  alternates: {
    canonical: siteUrl,
    languages: { ko: `${siteUrl}/` },
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: "전세계 크루즈 최저가 | 거품 빠진 가격의 프리미엄 여행",
    description:
      "같은 크루즈, 다른 가격? 중간 마진 없는 최저가로 럭셔리 크루즈를 경험하세요. 9년 전문가 무료 상담.",
    siteName: "PICKSO Cruise",
    locale: "ko_KR",
    images: [
      {
        url: `${siteUrl}/cruise-og.png`,
        width: 1200,
        height: 630,
        alt: "PICKSO Cruise - 전세계 크루즈 최저가",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "전세계 크루즈 최저가 | 세계일주의 꿈을 합리적으로",
    description:
      "지중해, 알래스카, 캐리비안 크루즈 최저가 보장. 9년 전문가 무료 상담.",
    images: [`${siteUrl}/cruise-og.png`],
  },
  keywords: [
    "크루즈 여행",
    "크루즈 최저가",
    "지중해 크루즈",
    "알래스카 크루즈",
    "캐리비안 크루즈",
    "동남아 크루즈",
    "허니문 크루즈",
    "가족 크루즈 여행",
    "크루즈 상담",
  ],
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-192.png", sizes: "192x192", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  category: "travel",
  verification: {
    // google: "구글서치콘솔 인증코드",
    // naver: "네이버서치어드바이저 인증코드",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
