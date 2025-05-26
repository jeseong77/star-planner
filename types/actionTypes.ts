// types/actionTypes.ts
import { Ionicons } from '@expo/vector-icons';

/** 탭 선택 상태를 나타내는 타입 */
export type SelectedTab = 'routine' | 'log';

/** 액션 아이템의 데이터 구조를 정의하는 타입 */
export type ActionItem = {
    id: string;
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    doneCount: number;
    iconColor: string;
    backgroundColor: string;
};

/** AddRoutineActionForm 에서 사용하는 데이터 타입 (AddRoutineActionForm.tsx 에서도 사용 가능) */
export type RoutineActionData = {
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
    color: string;
};