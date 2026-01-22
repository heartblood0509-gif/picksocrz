import { NextResponse } from 'next/server';

interface NewsItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  thumbnail: string | null;
}

export async function GET() {
  try {
    const response = await fetch('http://www.yonhapnewstv.co.kr/browse/feed/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; NewsBot/1.0)',
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch RSS: ${response.status}`);
    }

    const xmlText = await response.text();

    // Parse RSS XML
    const items: NewsItem[] = [];
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    let match;

    while ((match = itemRegex.exec(xmlText)) !== null) {
      const itemContent = match[1];

      const title = extractTag(itemContent, 'title');
      const link = extractTag(itemContent, 'link');
      const description = extractTag(itemContent, 'description');
      const pubDate = extractTag(itemContent, 'pubDate');

      // Extract thumbnail from media:content or enclosure
      let thumbnail = extractAttribute(itemContent, 'media:content', 'url') ||
                      extractAttribute(itemContent, 'enclosure', 'url') ||
                      extractImageFromDescription(description);

      items.push({
        title: cleanHtml(title),
        link,
        description: cleanHtml(description).substring(0, 150) + '...',
        pubDate,
        thumbnail,
      });
    }

    // Filter ONLY cruise-related articles (strict filtering)
    const cruiseKeywords = ['크루즈', '여객선', '유람선', '항해', 'cruise', '선박여행'];

    const cruiseNews = items.filter(item => {
      const searchText = `${item.title} ${item.description}`.toLowerCase();
      return cruiseKeywords.some(keyword => searchText.includes(keyword.toLowerCase()));
    });

    // If no cruise news found, return fallback cruise news
    if (cruiseNews.length === 0) {
      return NextResponse.json({
        success: true,
        articles: getFallbackNews(),
        lastUpdated: new Date().toISOString(),
        note: '현재 크루즈 관련 최신 뉴스가 없어 샘플 뉴스를 표시합니다.',
      });
    }

    // Return only cruise-related articles (up to 6)
    return NextResponse.json({
      success: true,
      articles: cruiseNews.slice(0, 6),
      lastUpdated: new Date().toISOString(),
    });
  } catch (error) {
    console.error('News API Error:', error);

    // Return fallback news data
    return NextResponse.json({
      success: false,
      articles: getFallbackNews(),
      lastUpdated: new Date().toISOString(),
      error: 'RSS 피드를 가져오는데 실패했습니다. 샘플 뉴스를 표시합니다.',
    });
  }
}

function extractTag(content: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const match = content.match(regex);
  return match ? (match[1] || match[2] || '').trim() : '';
}

function extractAttribute(content: string, tag: string, attr: string): string | null {
  const regex = new RegExp(`<${tag}[^>]*${attr}=["']([^"']+)["']`, 'i');
  const match = content.match(regex);
  return match ? match[1] : null;
}

function extractImageFromDescription(description: string): string | null {
  const imgRegex = /<img[^>]+src=["']([^"']+)["']/i;
  const match = description.match(imgRegex);
  return match ? match[1] : null;
}

function cleanHtml(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .trim();
}

function getFallbackNews(): NewsItem[] {
  return [
    {
      title: '지중해 크루즈 여행, 올해 최고 인기 여행지로 선정',
      link: 'https://www.yonhapnewstv.co.kr/',
      description: '유럽 지중해를 순항하는 크루즈 여행이 올해 가장 인기 있는 여행 상품으로 선정되었습니다...',
      pubDate: new Date().toISOString(),
      thumbnail: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?w=400',
    },
    {
      title: '알래스카 빙하 크루즈, 여름 시즌 예약 폭주',
      link: 'https://www.yonhapnewstv.co.kr/',
      description: '알래스카 빙하를 감상하는 크루즈 상품의 여름 시즌 예약이 크게 증가했습니다...',
      pubDate: new Date().toISOString(),
      thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
    },
    {
      title: '카리브해 럭셔리 크루즈 신규 노선 출시',
      link: 'https://www.yonhapnewstv.co.kr/',
      description: '카리브해를 항해하는 새로운 럭셔리 크루즈 노선이 출시되어 관심을 모으고 있습니다...',
      pubDate: new Date().toISOString(),
      thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400',
    },
    {
      title: '노르웨이 피오르드 크루즈, 대자연의 신비 체험',
      link: 'https://www.yonhapnewstv.co.kr/',
      description: '노르웨이의 장엄한 피오르드를 감상하는 크루즈 여행이 인기를 끌고 있습니다...',
      pubDate: new Date().toISOString(),
      thumbnail: 'https://images.unsplash.com/photo-1503917988258-f87a78e3c995?w=400',
    },
    {
      title: '동남아시아 크루즈, 이국적인 문화 체험 기회',
      link: 'https://www.yonhapnewstv.co.kr/',
      description: '동남아시아를 순항하는 크루즈로 다양한 문화와 음식을 체험할 수 있습니다...',
      pubDate: new Date().toISOString(),
      thumbnail: 'https://images.unsplash.com/photo-1537956965359-7573183d1f57?w=400',
    },
    {
      title: '남태평양 타히티 크루즈, 꿈의 휴양지 탐방',
      link: 'https://www.yonhapnewstv.co.kr/',
      description: '타히티와 보라보라 섬을 방문하는 남태평양 크루즈가 인기 상승 중입니다...',
      pubDate: new Date().toISOString(),
      thumbnail: 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=400',
    },
  ];
}
