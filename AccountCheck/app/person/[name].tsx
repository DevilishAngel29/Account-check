import { View, Text, ScrollView, TouchableOpacity, StatusBar, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../../constants/api';
import {  Modal, TextInput } from 'react-native';

// Same helper as splits.tsx: whole numbers show as 333, fractions as 333.67
const formatAmount = (n: number): string => {
  return Number.isInteger(n) ? n.toString() : n.toFixed(2);
};

export default function PersonScreen() {
  const { name } = useLocalSearchParams();
  const [splits, setSplits] = useState([]);
  const [settleModalVisible, setSettleModalVisible] = useState(false);
const [selectedSplit, setSelectedSplit] = useState(null);
const [settleAmount, setSettleAmount] = useState('');

const handleSettle = async () => {
  if (!settleAmount) return;
  
  try {
    await axios.post(`${API_BASE}/splits/${selectedSplit.id}/settle`, {
      amount: parseFloat(settleAmount)
    });
    
    // refresh splits after settling
    const res = await axios.get(`${API_BASE}/people/${name}`);
    setSplits(res.data);
    setSettleModalVisible(false);
    setSettleAmount('');
    setSelectedSplit(null);
  } catch (err) {
    Alert.alert('Oops', 'Something went wrong. Please try again.');
  }
};

  useEffect(() => {
    axios.get(`${API_BASE}/people/${name}`)
      .then(res => setSplits(res.data))
      .catch(err => console.log(err));
  }, []);

  // Calculate net balance: sum of all 'remaining' amounts for this person
  // remaining = amount owed - amount already paid
  const net = splits.reduce((total, split) => {
    return total + split.remaining;
  }, 0);

  // If net > 0 → they owe us. If net < 0 → we owe them.
  const theyOweUs = net >= 0;

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Back button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 100 }}>
        {/* Person name + net balance */}
        <Text style={styles.personName}>{name}</Text>
        <Text style={[styles.netBalance, theyOweUs ? styles.green : styles.red]}>
          {theyOweUs
            ? `Owes you ₹${formatAmount(Math.abs(net))}`
            : `You owe ₹${formatAmount(Math.abs(net))}`}
        </Text>

        {/* Split history cards */}
        {splits.map(split => (
          <View key={split.id} style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardTitle}>
                {split.description || split.category}
              </Text>
              {/* Color green if they still owe (remaining > 0), grey if settled */}
              <Text style={[styles.cardAmount, split.remaining > 0 ? styles.green : styles.settled]}>
                ₹{formatAmount(split.remaining)}
              </Text>
            </View>

            <Text style={styles.cardMeta}>
              {split.category} · {split.date}
            </Text>

            {/* Show payment progress if any partial payment was made */}
            {split.amount_paid > 0 && (
              <Text style={styles.cardPaid}>
                Paid ₹{formatAmount(split.amount_paid)} of ₹{formatAmount(split.amount)}
              </Text>
            )}
                    {split.remaining > 0 && (
  <TouchableOpacity
    style={styles.settleBtn}
    onPress={() => {
      setSelectedSplit(split);
      setSettleAmount(String(split.remaining));  // pre-fill full amount
      setSettleModalVisible(true);
    }}
  >
    <Text style={styles.settleBtnText}>Settle</Text>
  </TouchableOpacity>
)}
          </View>
        ))}

        {splits.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>🤝</Text>
            <Text style={styles.emptyTitle}>No splits yet</Text>
          </View>
        )}


      </ScrollView>
      <Modal visible={settleModalVisible} transparent animationType="slide">
  <View style={styles.modalOverlay}>
    <View style={styles.modalBox}>

      {/* Header */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <Text style={styles.modalTitle}>Settle with {name}</Text>
        <TouchableOpacity onPress={() => setSettleModalVisible(false)}>
          <Text style={{ color: '#4a5568', fontSize: 22 }}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Amount input — pre-filled */}
      <Text style={styles.modalLabel}>Amount</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={settleAmount}
        onChangeText={setSettleAmount}
      />

      {/* Settle button */}
      <TouchableOpacity style={styles.saveButton} onPress={handleSettle}>
        <Text style={styles.saveButtonText}>Confirm Settle</Text>
      </TouchableOpacity>

    </View>
  </View>
</Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#080d1a',  // ← matches rest of app (was #0d0d0f)
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#080d1a',
  },
  backBtn: {
    alignSelf: 'flex-start',
  },
  backText: {
    color: '#3B82F6',  // ← app blue (was #8B31C7 purple)
    fontSize: 16,
    fontWeight: '600',
  },
  personName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  netBalance: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 28,
  },
  green: { color: '#4ade80' },
  red: { color: '#f87171' },
  settled: { color: '#4a5568' },
  card: {
    backgroundColor: '#0f1629',  // ← app card bg (was #1a1a1a)
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(59,130,246,0.1)',  // ← subtle blue border
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  cardTitle: {
    color: '#e2e8f0',
    fontWeight: '600',
    fontSize: 15,
    flex: 1,
  },
  cardAmount: {
    fontWeight: '700',
    fontSize: 15,
  },
  cardMeta: {
    color: '#4a5568',
    fontSize: 12,
    marginTop: 2,
  },
  cardPaid: {
    color: '#4a5568',
    fontSize: 12,
    marginTop: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  settleBtn: {
  marginTop: 12,
  backgroundColor: 'rgba(59,130,246,0.15)',
  borderRadius: 10,
  padding: 10,
  alignItems: 'center',
  borderWidth: 1,
  borderColor: 'rgba(59,130,246,0.3)',
},
settleBtnText: {
  color: '#3B82F6',
  fontWeight: '700',
  fontSize: 13,
},
modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0,0,0,0.7)',
  justifyContent: 'flex-end',
},
modalBox: {
  backgroundColor: '#0f1629',
  borderTopLeftRadius: 28,
  borderTopRightRadius: 28,
  padding: 24,
  borderTopWidth: 1,
  borderColor: 'rgba(59,130,246,0.15)',
},
modalTitle: {
  fontSize: 20,
  fontWeight: '800',
  color: '#fff',
},
modalLabel: {
  fontSize: 12,
  color: '#4a5568',
  fontWeight: '600',
  letterSpacing: 0.5,
  textTransform: 'uppercase',
  marginBottom: 10,
},
input: {
  backgroundColor: '#141d35',
  borderRadius: 14,
  padding: 14,
  color: '#fff',
  fontSize: 16,
  borderWidth: 1,
  borderColor: 'rgba(59,130,246,0.1)',
  marginBottom: 16,
},
saveButton: {
  backgroundColor: '#3B82F6',
  borderRadius: 14,
  padding: 16,
  alignItems: 'center',
},
saveButtonText: {
  color: '#fff',
  fontWeight: '800',
  fontSize: 16,
},
});