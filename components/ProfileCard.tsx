import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    TextInput,
    Alert,
    TouchableWithoutFeedback,
    Keyboard,
    Platform, // Platform 추가
} from "react-native";
import { AppTheme, useAppTheme } from "@/contexts/AppThemeProvider";
import { Ionicons } from '@expo/vector-icons';
import Animated, { // Reanimated 임포트
    useSharedValue,
    useAnimatedStyle,
    withTiming,
} from 'react-native-reanimated';

// 프로필 데이터 타입 정의
interface ProfileData {
    name: string;
    username: string;
    role: string;
    gender: string;
    link: string;
    bio: string;
    avatar: any;
}

export default function ProfileCard() {
    const theme = useAppTheme();
    const styles = getStyles(theme);

    const [isEditing, setIsEditing] = useState(false);
    const [profileData, setProfileData] = useState<ProfileData>({
        name: "이그린",
        username: "@greeeeeniii",
        role: "개발자",
        gender: "성별",
        link: "https://example.com",
        bio: "안녕하세요! React Native 개발자 이그린입니다.",
        avatar: require('@/assets/images/bbun.png'),
    });
    const [tempProfileData, setTempProfileData] = useState<ProfileData>(profileData);

    // Reanimated를 위한 Shared Value 생성
    const translateY = useSharedValue(0);

    // 키보드 이벤트 리스너 설정
    useEffect(() => {
        const keyboardDidShowListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
            (e) => {
                // 키보드가 나타날 때 카드를 위로 이동
                // 이동 거리는 필요에 따라 조절하세요.
                translateY.value = withTiming(-180, { duration: 250 });
            }
        );
        const keyboardDidHideListener = Keyboard.addListener(
            Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
            () => {
                // 키보드가 사라질 때 카드를 원래 위치로 이동
                translateY.value = withTiming(0, { duration: 250 });
            }
        );

        // 컴포넌트 언마운트 시 리스너 제거
        return () => {
            keyboardDidShowListener.remove();
            keyboardDidHideListener.remove();
        };
    }, [translateY]);

    // 애니메이션 스타일 정의
    const animatedContainerStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateY: translateY.value }],
        };
    });

    const handleEditPress = () => {
        setTempProfileData(profileData);
        setIsEditing(true);
    };

    const handleSavePress = () => {
        setProfileData(tempProfileData);
        setIsEditing(false);
        Keyboard.dismiss(); // 저장 시 키보드 닫기
        Alert.alert("저장 완료", "프로필 정보가 업데이트되었습니다.");
    };

    const handleCancelPress = () => {
        setIsEditing(false);
        Keyboard.dismiss(); // 취소 시 키보드 닫기
    };

    const handleChange = (field: keyof ProfileData, value: string) => {
        setTempProfileData(prev => ({ ...prev, [field]: value }));
    };

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
            {/* Animated.View로 감싸고 애니메이션 스타일 적용 */}
            <Animated.View style={[styles.cardContainer, animatedContainerStyle]}>
                {!isEditing && (
                    <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
                        <Ionicons name="pencil-outline" size={18} color={theme.primary} />
                        <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                )}

                <View style={styles.container}>
                    <View style={styles.avatarContainer}>
                        <Image style={styles.image} source={profileData.avatar} />
                    </View>

                    {/* 이름 */}
                    {isEditing ? (
                        <TextInput
                            style={styles.input}
                            value={tempProfileData.name}
                            onChangeText={(text) => handleChange('name', text)}
                            placeholder="이름"
                            placeholderTextColor={theme.outlineVariant}
                        />
                    ) : (
                        <Text style={styles.nameText}>{profileData.name}</Text>
                    )}

                    {/* 사용자 이름 */}
                    {isEditing ? (
                        <TextInput
                            style={styles.input}
                            value={tempProfileData.username}
                            onChangeText={(text) => handleChange('username', text)}
                            placeholder="사용자 이름"
                            placeholderTextColor={theme.outlineVariant}
                        />
                    ) : (
                        <Text style={styles.usernameText}>{profileData.username}</Text>
                    )}

                    {/* 역할 */}
                    {isEditing ? (
                        <TextInput
                            style={styles.input}
                            value={tempProfileData.role}
                            onChangeText={(text) => handleChange('role', text)}
                            placeholder="직업"
                            placeholderTextColor={theme.outlineVariant}
                        />
                    ) : (
                        <Text style={styles.text}>{profileData.role}</Text>
                    )}

                    {/* 성별 */}
                    {isEditing ? (
                        <TextInput
                            style={styles.input}
                            value={tempProfileData.gender}
                            onChangeText={(text) => handleChange('gender', text)}
                            placeholder="성별"
                            placeholderTextColor={theme.outlineVariant}
                        />
                    ) : (
                        <Text style={styles.text}>{profileData.gender}</Text>
                    )}

                    {/* 링크 */}
                    {isEditing ? (
                        <TextInput
                            style={styles.input}
                            value={tempProfileData.link}
                            onChangeText={(text) => handleChange('link', text)}
                            placeholder="링크 (예: 웹사이트, GitHub)"
                            keyboardType="url"
                            placeholderTextColor={theme.outlineVariant}
                        />
                    ) : (
                        <Text style={[styles.text, styles.linkText]}>{profileData.link}</Text>
                    )}

                    {/* 소개 */}
                    {isEditing ? (
                        <TextInput
                            style={[styles.input, styles.bioInput]}
                            value={tempProfileData.bio}
                            onChangeText={(text) => handleChange('bio', text)}
                            placeholder="소개"
                            multiline
                            placeholderTextColor={theme.outlineVariant}
                        />
                    ) : (
                        <Text style={styles.text}>{profileData.bio}</Text>
                    )}

                    {isEditing && (
                        <View style={styles.buttonContainer}>
                            <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={handleSavePress}>
                                <Text style={styles.actionButtonText}>저장</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.actionButton, styles.cancelButton]} onPress={handleCancelPress}>
                                <Text style={styles.actionButtonText}>취소</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </Animated.View>
        </TouchableWithoutFeedback>
    );
}

// 스타일 시트는 이전과 동일하게 유지합니다.
const getStyles = (theme: AppTheme) => StyleSheet.create({
    cardContainer: {
        position: 'relative',
        margin: 16,
        // 키보드에 따라 이동하므로, 화면 중앙이나 상단에 위치하도록
        // 부모 컴포넌트에서 레이아웃을 조정해야 할 수 있습니다.
    },
    container: {
        justifyContent: "center",
        alignItems: "center",
        padding: 16,
        paddingTop: 48, // Edit 버튼 공간 확보
        backgroundColor: theme.surfaceContainer,
        borderRadius: 20,
        shadowColor: 'black',
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 2 },
        elevation: 5,
    },
    text: {
        color: theme.onSurface,
        fontSize: 16,
        fontWeight: "500",
        marginVertical: 4,
        textAlign: 'center', // 텍스트 중앙 정렬
    },
    nameText: {
        color: theme.onSurface,
        fontSize: 22,
        fontWeight: 'bold',
        marginVertical: 4,
        textAlign: 'center',
    },
    usernameText: {
        color: theme.secondary,
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 10,
        textAlign: 'center',
    },
    linkText: {
        color: theme.primary,
        textDecorationLine: 'underline',
    },
    avatarContainer: {
        marginBottom: 16,
        justifyContent: "center",
        alignItems: "center",
    },
    image: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: theme.primary,
    },
    editButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        backgroundColor: theme.surface,
        borderRadius: 15,
        zIndex: 10, // 다른 요소 위에 보이도록
        borderWidth: 1,
        borderColor: theme.primary,
    },
    editButtonText: {
        marginLeft: 5,
        color: theme.primary,
        fontWeight: 'bold',
    },
    input: {
        width: '90%',
        height: 40,
        borderColor: theme.outline,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        marginVertical: 6,
        color: theme.onSurface,
        backgroundColor: theme.surface,
        textAlign: 'center', // 입력 텍스트 중앙 정렬
    },
    bioInput: {
        height: 80,
        textAlignVertical: 'top',
        paddingTop: 10, // 상단 패딩 추가
    },
    buttonContainer: {
        flexDirection: 'row',
        marginTop: 20,
        justifyContent: 'space-around',
        width: '100%',
    },
    actionButton: {
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 20,
        alignItems: 'center',
    },
    saveButton: {
        backgroundColor: theme.primary,
    },
    cancelButton: {
        backgroundColor: theme.error,
    },
    actionButtonText: {
        color: theme.onPrimary,
        fontSize: 16,
        fontWeight: 'bold',
    },
});