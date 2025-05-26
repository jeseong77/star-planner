// utils/colorUtils.ts

/**
 * 주어진 HEX 색상을 지정된 비율만큼 밝게 만듭니다.
 * @param hex - # 포함 또는 미포함 HEX 색상 코드 (예: '#FFFFFF' 또는 'FFFFFF')
 * @param percent - 밝게 만들 비율 (0 ~ 1 사이, 예: 0.5 는 50% 밝게)
 * @returns 밝아진 HEX 색상 코드 (예: '#FFFFFF')
 */
export const lightenColor = (hex: string, percent: number): string => {
    // # 제거 및 3자리 -> 6자리 변환
    hex = hex.replace(/^\s*#|\s*$/g, '');
    if (hex.length === 3) {
        hex = hex.replace(/(.)/g, '$1$1');
    }

    // RGB 값 파싱
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // 밝기 조절 (최대 255)
    r = Math.min(255, Math.floor(r + (255 - r) * percent));
    g = Math.min(255, Math.floor(g + (255 - g) * percent));
    b = Math.min(255, Math.floor(b + (255 - b) * percent));

    // 다시 HEX로 변환하고 2자리로 패딩
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};