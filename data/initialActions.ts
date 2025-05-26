// data/initialActions.ts
import { ActionItem } from '@/types/actionTypes'; // 경로는 프로젝트에 맞게 조정하세요

/** 초기 액션 아이템 데이터 */
export const initialActionsData: ActionItem[] = [
    { id: '1', icon: 'sunny-outline', title: 'Morning Routine', doneCount: 0, iconColor: '#FFA500', backgroundColor: '#FFF3E0' },
    { id: '2', icon: 'restaurant-outline', title: 'Lunch Break', doneCount: 0, iconColor: '#4CAF50', backgroundColor: '#E8F5E9' },
    { id: '3', icon: 'moon-outline', title: 'Evening Routine', doneCount: 0, iconColor: '#673AB7', backgroundColor: '#EDE7F6' },
    { id: '4', icon: 'walk-outline', title: 'Afternoon Walk', doneCount: 0, iconColor: '#03A9F4', backgroundColor: '#E1F5FE' },
    { id: '5', icon: 'book-outline', title: 'Reading Time', doneCount: 0, iconColor: '#795548', backgroundColor: '#EFEBE9' },
    { id: '6', icon: 'fitness-outline', title: 'Workout', doneCount: 0, iconColor: '#F44336', backgroundColor: '#FFEBEE' },
];