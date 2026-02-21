import { StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function HomeScreen() {
  const [summary, setSummary] = useState({
    total_spent: 0,
    owed_to_me: 0,
    i_owe: 100,
  });

  useEffect(() => {
    axios.get('http://192.168.1.9:8000/summary')
      .then(res => setSummary(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Account Check</Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Total Spent</Text>
        <Text style={styles.amount}>₹{summary.total_spent}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Owed to Me</Text>
        <Text style={styles.amountGreen}>₹{summary.owed_to_me}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>I Owe</Text>
        <Text style={styles.amountRed}>₹{summary.i_owe}</Text>
      </View>
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
    fontSize: 14,
    color: '#888888',
  },
  amount: {
    fontSize: 36,
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
});