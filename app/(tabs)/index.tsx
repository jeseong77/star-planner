import { StyleSheet } from 'react-native';
import { Link } from 'expo-router'; // Import Link for navigation

import { ThemedText } from '@/components/ThemedText'; // Kept for themed text
import { ThemedView } from '@/components/ThemedView'; // Kept for themed background

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.headerText}>
        Main Screen
      </ThemedText>
      <ThemedText style={styles.descriptionText}>
        This is your cleared home screen.
      </ThemedText>

      <Link href="./actions" style={styles.buttonLink}>
        <ThemedView style={styles.buttonView}>
          <ThemedText type="link" style={styles.buttonText}>
            Go to Actions Page
          </ThemedText>
        </ThemedView>
      </Link>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  headerText: {
    fontSize: 28, // Example size for title
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  buttonLink: {
    // If using Link directly and want to style the touchable area
    // you might need to wrap its content in a <View> or use asChild prop with a <Pressable>
    // For simplicity, this example will style a View inside the Link
  },
  buttonView: { // This view receives the button styling
    backgroundColor: '#007AFF', // Example blue color
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 3, // for Android shadow
    shadowColor: '#000', // for iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  buttonText: {
    color: '#FFFFFF', // White text for the button
    fontSize: 16,
    fontWeight: 'bold',
  },
});