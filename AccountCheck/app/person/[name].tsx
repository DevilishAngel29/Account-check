import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../../constants/api';

export default function PersonScreen() {
  const { name } = useLocalSearchParams();
  const [splits, setSplits] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE}/people/${name}`)
      .then(res => setSplits(res.data))
      .catch(err => console.log(err));
  }, []);

  // calculate net balance
  const net = splits.reduce((total, split) => {
    return total + split.remaining;
  }, 0);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0d0d0f', padding: 20, paddingTop: 60 }}>
      
      {/* Back button */}
      <TouchableOpacity onPress={() => router.back()} style={{ marginBottom: 24 }}>
        <Text style={{ color: '#8B31C7', fontSize: 16 }}>← Back</Text>
      </TouchableOpacity>

      {/* Header */}
      <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold' }}>{name}</Text>
      <Text style={{ color: '#4ade80', fontSize: 16, marginTop: 4, marginBottom: 32 }}>
        owes you ₹{net}
      </Text>

      {/* Split list */}
      {splits.map(split => (
        <View key={split.id} style={{ backgroundColor: '#1a1a1a', borderRadius: 16, padding: 16, marginBottom: 12 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>
              {split.description || split.category}
            </Text>
            <Text style={{ color: '#4ade80', fontWeight: 'bold', fontSize: 15 }}>
              ₹{split.remaining}
            </Text>
          </View>
          <Text style={{ color: '#555', fontSize: 12, marginTop: 4 }}>
            {split.category} • {split.date}
          </Text>
          {split.amount_paid > 0 && (
            <Text style={{ color: '#888', fontSize: 12, marginTop: 4 }}>
              Paid ₹{split.amount_paid} of ₹{split.amount}
            </Text>
          )}
        </View>
      ))}

    </ScrollView>
  );
}