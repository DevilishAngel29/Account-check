import { View, Text } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ScrollView, TouchableOpacity } from 'react-native';

export default function AccountDetailScreen() {
  const { id } = useLocalSearchParams();

  return (
    <View style={{ flex: 1, backgroundColor: '#0d0d0f', padding: 20, paddingTop: 60 }}>
      <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 24 }}>
        <Text style={{ color: '#8B31C7', fontSize: 16 }}>← Back</Text>
      </TouchableOpacity>
      <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}>
        Account {id}
      </Text>
    </View>
  );
}