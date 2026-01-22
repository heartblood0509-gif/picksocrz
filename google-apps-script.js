/**
 * OceanVoyage 크루즈 문의 폼 - Google Apps Script
 *
 * 설정 방법:
 * 1. Google Sheets에서 도구 > 스크립트 편집기 열기
 * 2. 이 코드를 붙여넣기
 * 3. 배포 > 새 배포 > 웹 앱 선택
 * 4. 액세스 권한: "모든 사용자" 선택
 * 5. 배포 후 웹 앱 URL 복사하여 프론트엔드에서 사용
 */

// 스프레드시트 ID
const SPREADSHEET_ID = '1HGjeK28aih2jsDoy01zI6N0pVF3erjE03bscPt_P2FM';

// 시트 이름 (없으면 자동 생성)
const SHEET_NAME = '문의접수';

/**
 * 초기 설정 - 시트 헤더 생성
 * 처음 한 번만 실행하세요
 */
function setupSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);

  // 시트가 없으면 생성
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  // 헤더 설정
  const headers = [
    '접수일시',
    '이름',
    '연락처',
    '이메일',
    '관심 목적지',
    '문의 내용',
    '처리 상태'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // 헤더 스타일 적용
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#0ea5e9');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');

  // 열 너비 조정
  sheet.setColumnWidth(1, 150); // 접수일시
  sheet.setColumnWidth(2, 100); // 이름
  sheet.setColumnWidth(3, 130); // 연락처
  sheet.setColumnWidth(4, 200); // 이메일
  sheet.setColumnWidth(5, 150); // 관심 목적지
  sheet.setColumnWidth(6, 400); // 문의 내용
  sheet.setColumnWidth(7, 100); // 처리 상태

  // 첫 행 고정
  sheet.setFrozenRows(1);

  Logger.log('시트 설정 완료!');
}

/**
 * POST 요청 처리 - 폼 데이터 저장
 */
function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);

    // 시트가 없으면 생성
    if (!sheet) {
      setupSheet();
      sheet = ss.getSheetByName(SHEET_NAME);
    }

    // 요청 데이터 파싱
    const data = JSON.parse(e.postData.contents);

    // 목적지 매핑
    const destinationMap = {
      'mediterranean': '지중해',
      'caribbean': '카리브해',
      'alaska': '알래스카',
      'norway': '노르웨이 피오르드',
      'asia': '동남아시아',
      'pacific': '남태평양',
      '': '미선택'
    };

    // 데이터 행 생성
    const rowData = [
      Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss'),
      data.name || '',
      data.phone || '',
      data.email || '',
      destinationMap[data.destination] || data.destination || '미선택',
      data.message || '',
      '신규'
    ];

    // 데이터 추가
    sheet.appendRow(rowData);

    // 새 행에 스타일 적용
    const lastRow = sheet.getLastRow();
    const newRowRange = sheet.getRange(lastRow, 7); // 처리 상태 셀
    newRowRange.setBackground('#fef3c7'); // 노란색 배경

    // 성공 응답
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: '문의가 접수되었습니다.',
        row: lastRow
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // 에러 응답
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        message: '오류가 발생했습니다: ' + error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * GET 요청 처리 - 테스트용
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      message: 'OceanVoyage API가 정상 작동 중입니다.',
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * 이메일 알림 발송 (선택사항)
 * 새 문의 접수 시 관리자에게 이메일 발송
 */
function sendNotificationEmail(data) {
  const adminEmail = 'admin@oceanvoyage.com'; // 관리자 이메일 주소로 변경

  const subject = '[OceanVoyage] 새로운 크루즈 문의가 접수되었습니다';

  const body = `
새로운 문의가 접수되었습니다.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
▶ 고객 정보
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 이름: ${data.name}
• 연락처: ${data.phone}
• 이메일: ${data.email}
• 관심 목적지: ${data.destination}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
▶ 문의 내용
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${data.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
접수일시: ${Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

스프레드시트에서 확인: https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}
`;

  try {
    MailApp.sendEmail(adminEmail, subject, body);
    Logger.log('알림 이메일 발송 완료');
  } catch (error) {
    Logger.log('이메일 발송 실패: ' + error);
  }
}

/**
 * 테스트 함수 - 직접 실행하여 동작 확인
 */
function testSubmission() {
  const testData = {
    postData: {
      contents: JSON.stringify({
        name: '홍길동',
        phone: '010-1234-5678',
        email: 'test@example.com',
        destination: 'mediterranean',
        message: '지중해 크루즈 7박 8일 일정에 관심이 있습니다. 9월 출발 가능한 일정 안내 부탁드립니다.'
      })
    }
  };

  const result = doPost(testData);
  Logger.log(result.getContent());
}
