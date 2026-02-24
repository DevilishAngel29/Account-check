import { StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from '@/constants/api';
import { LinearGradient } from 'expo-linear-gradient';
import { ScrollView } from 'react-native';

export default function HomeScreen() {
  const [summary, setSummary] = useState({
    total_spent: 0,
    owed_to_me: 0,
    i_owe: 0,
  });

  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE}/summary`)
      .then(res => {
        console.log('API response:', res.data);
        setSummary(res.data);
      })
      .catch(err => console.log(err));

    axios.get(`${API_BASE}/transactions/`)
      .then(res => setTransactions(res.data))
      .catch(err => console.log(err));
  }, []);



 return (
  <View style={styles.container}>
    <Text style={styles.header}>Account Check</Text>

    {/* DELETE THE THREE OLD CARDS AND PUT THIS HERE */}
    <LinearGradient
      colors={['#D742A0', '#8B31C7', '#4B2BE0']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.heroCard}
    >
      <Text style={styles.cardTitle}>Total Spending</Text>
      <Text style={styles.amount}>₹{summary.total_spent}</Text>
      <View style={{ flexDirection: 'row', marginTop: 24 }}>
  
  {/* Left stat */}
  <View style={{ flex: 1 }}>
    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>↑ Owed to Me</Text>
    <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>
      ₹{summary.owed_to_me}
    </Text>
  </View>

  {/* Divider */}
  <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.2)' }} />

  {/* Right stat */}
  <View style={{ flex: 1, paddingLeft: 16 }}>
    <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>↓ I Owe</Text>
    <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>
      ₹{summary.i_owe}
    </Text>
  </View>

</View>
    </LinearGradient>

    <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 16 }}>
  Transactions
</Text>

{transactions.map(t => (
  <View key={t.id} style={{ backgroundColor: '#1a1a1a', borderRadius: 16, padding: 16, marginBottom: 12 }}>
    <Text style={{ color: '#fff', fontWeight: '600' }}>{t.description || t.category}</Text>
    <Text style={{ color: '#888', fontSize: 12, marginTop: 4 }}>{t.category} • {t.transaction_date}</Text>
    <Text style={{ color: '#f87171', fontWeight: 'bold', marginTop: 8 }}>₹{t.amount}</Text>
  </View>
))}

  </View>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 20,
    paddingTop: 60,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 24,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    color: '#ffffff',
  },
  amount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 8,
  },
  amountGreen: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#4ade80',
    marginTop: 8,
  },
  amountRed: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#f87171',
    marginTop: 8,
  },
  heroCard: {
    padding: 24,
    borderRadius: 24,
    color: '#ffffff',
  },
});