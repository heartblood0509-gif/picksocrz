import { MetadataRoute } from 'next';

const siteUrl = 'https://cruise-jade.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    // 추가 페이지가 생기면 여기에 추가
    // {
    //   url: `${siteUrl}/destinations`,
    //   lastModified: new Date(),
    //   changeFrequency: 'weekly',
    //   priority: 0.8,
    // },
  ];
}
