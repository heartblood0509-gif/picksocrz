import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { generateText } from 'ai';

export const maxDuration = 30;

const systemPrompt = `당신은 PICKSO Cruise의 친절한 크루즈 여행 상담원입니다.

다음 정보를 바탕으로 고객 상담을 진행해주세요:

## 회사 정보
- 회사명: PICKSO Cruise (픽소 크루즈)
- 9년 크루즈 전문 여행사
- 1:1 맞춤 상담 제공
- 연락처: 1588-1234
- 이메일: cruise@pickso.com
- 상담시간: 평일 09:00-18:00, 토요일 10:00-15:00

## 여행지
1. 지중해 (Mediterranean) - 이탈리아, 그리스, 스페인의 아름다운 항구 도시
2. 카리브해 (Caribbean) - 청록색 바다와 백사장의 열대 낙원
3. 알래스카 (Alaska) - 빙하와 야생동물의 대자연
4. 노르웨이 피오르드 (Norwegian Fjords) - 장엄한 피오르드 절경
5. 동남아시아 (Southeast Asia) - 이국적인 문화와 음식의 향연
6. 남태평양 (South Pacific) - 타히티, 보라보라의 꿈같은 섬들

## 선박
1. Ocean Majesty (플래그십) - 3,500명, 22개 레스토랑, 워터파크
2. Azure Dream (프리미엄) - 2,800명, 스파, 키즈클럽
3. Crystal Voyager (럭셔리) - 1,200명, 올스위트, 버틀러 서비스

## 패키지
1. Explorer (₩2,990,000) - 7박 8일, 오션뷰, 기본 식사
2. Voyager (₩5,490,000) - 10박 11일, 올인클루시브, VIP 좌석 (BEST SELLER)
3. Royal (₩12,900,000) - 14박 15일, 그랜드 스위트, 버틀러, 헬리콥터 투어

## 상담 지침
- 친절하고 전문적으로 응대
- 고객의 니즈를 파악하여 맞춤 추천
- 가격 문의 시 정확한 정보 제공
- 예약 관련 문의는 전화 상담(1588-1234) 안내
- 한국어로 응대
- 답변은 간결하게 (3-4문장 이내)`;

export async function POST(req: Request) {
  const { messages, apiKey } = await req.json();

  if (!apiKey) {
    return Response.json(
      { error: 'API 키가 필요합니다. 설정에서 Gemini API 키를 입력해주세요.' },
      { status: 400 }
    );
  }

  try {
    const google = createGoogleGenerativeAI({
      apiKey: apiKey,
    });

    const { text } = await generateText({
      model: google('gemini-2.5-flash'),
      system: systemPrompt,
      messages,
    });

    return Response.json({
      id: Date.now().toString(),
      role: 'assistant',
      content: text,
    });
  } catch (error) {
    console.error('Chat API Error:', error);
    return Response.json(
      { error: 'API 요청 중 오류가 발생했습니다. API 키를 확인해주세요.' },
      { status: 500 }
    );
  }
}
