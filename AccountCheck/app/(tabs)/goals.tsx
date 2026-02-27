import { View, Text } from 'react-native';

export default function GoalsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: '#0d0d0f', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>Goals</Text>
      <Text style={{ color: '#555', marginTop: 8 }}>Coming soon</Text>
    </View>
  );
}