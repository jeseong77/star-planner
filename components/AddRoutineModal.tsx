// components/AddRoutineModal.tsx
import React from 'react';
import { KeyboardAvoidingView, Platform, ViewStyle } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

// Components
import AddRoutineActionView from '@/components/AddRoutineActionForm';

// Types
import { RoutineActionData } from '@/types/actionTypes';

interface AddRoutineModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSave: (data: RoutineActionData) => void;
    styles: {
        modalOverlay: ViewStyle;
        keyboardAvoidingView: ViewStyle;
    };
}

const AddRoutineModal: React.FC<AddRoutineModalProps> = ({ isVisible, onClose, onSave, styles }) => {
    if (!isVisible) {
        return null;
    }

    return (
        <Animated.View
            style={styles.modalOverlay}
            entering={FadeIn.duration(200)}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingView}
            >
                <AddRoutineActionView
                    onClose={onClose}
                    onSave={onSave}
                />
            </KeyboardAvoidingView>
        </Animated.View>
    );
};

export default AddRoutineModal;