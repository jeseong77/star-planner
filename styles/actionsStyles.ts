// styles/actionsStyles.ts
import { StyleSheet, Dimensions, Platform } from 'react-native';
import { AppTheme } from '@/contexts/AppThemeProvider'; // 경로는 프로젝트에 맞게 조정하세요

const { width: screenWidth } = Dimensions.get('window');

/** ActionsScreen 컴포넌트의 스타일을 생성하는 함수 */
export const getScreenStyles = (theme: AppTheme) => StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.background, // SafeAreaView 배경색
    },
    contentContainer: {
        flex: 1,
        backgroundColor: theme.surface, // 페이지 컨테이너의 기본 배경
        overflow: 'hidden', // Animated.View가 넘치지 않도록
    },
    pageContainer: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        width: screenWidth, // 각 페이지는 화면 너비만큼
    },
    routineSection: {
        flex: 1,
        backgroundColor: theme.surface, // 루틴 탭 배경
    },
    logSection: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        backgroundColor: theme.surfaceContainerLow, // 로그 탭 배경 (약간 다르게)
    },
    contentText: {
        fontSize: 18,
        color: theme.onSurfaceVariant,
        textAlign: 'center',
    },
    listStyle: {
        flex: 1,
    },
    listContentStyle: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 20, // Add 버튼과의 간격 확보
    },
    addButton: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 30 : 20, // iOS는 하단 인셋 고려, Android는 20
        left: 20,
        right: 20,
        backgroundColor: theme.primaryContainer,
        borderRadius: 28, // Fully rounded
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10, // 다른 요소 위에 보이도록
        elevation: 3, // Android shadow
        shadowColor: '#000', // iOS shadow
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    addButtonText: {
        color: theme.onPrimaryContainer,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    modalOverlay: {
        ...StyleSheet.absoluteFillObject, // 화면 전체 덮기
        backgroundColor: 'rgba(0, 0, 0, 0.4)', // 반투명 배경
        justifyContent: 'center', // 수직 중앙 정렬
        alignItems: 'center',     // 수평 중앙 정렬
        zIndex: 1000,              // 최상단에 위치
    },
    keyboardAvoidingView: {
        width: '100%',
        alignItems: 'center', // KAV 내부 컨텐츠 중앙 정렬 유지
    }
});