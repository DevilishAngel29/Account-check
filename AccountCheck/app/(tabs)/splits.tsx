import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '@/constants/api';

export default function SplitsScreen() {
    const [transactions, setTransactions] = useState([]);

      useEffect(() => {
        axios.get(`${API_BASE}/transactions`)
          .then(res => setTransactions(res.data.filter(t => t.type === 'split' || t.type === 'loan')))
          .catch(err => console.log(err));
      }, []);

      const settleSplit = async (splitId) => {
        await axios.put(`${API_BASE}/splits/${splitId}/settle`);
        const res = await axios.get(`${API_BASE}/transactions/`);
        setTransactions(res.data.filter(t => t.type === 'split' || t.type === 'loan'));
        };

return (
       <ScrollView style={styles.container}>
          <Text style={styles.header}>Splits</Text>
    
          
            {
            transactions.map(t => (
              <TouchableOpacity
                key={t.id}>
                <View style={styles.card}>
                    <Text style={styles.description}>{t.description}</Text>
                    <Text style={styles.amount}>₹{t.amount}</Text>
                    <Text style={styles.category}>{t.category} • {t.transaction_date}</Text>
                    
                    {t.splits.map(split => (
                        <View key={split.id} style={styles.splitRow}>
                            <Text style={styles.splitText}>
                               {split.paid_by} → {split.split_with}: ₹{split.amount.toFixed(0)}
                            </Text>
                            {!split.is_settled ?(
                                <TouchableOpacity 
                                style = {styles.settleButton}
                                onPress={() => {settleSplit(split.id)}}>
                                    <Text style = {styles.settleText}>Settle</Text>
                                </TouchableOpacity>
                            ) : (
                                <Text style={styles.settled}>✓ Settled</Text> 
                            )}
                        </View>
                    ))}
                </View>
              </TouchableOpacity>
        
            ))}
        </ScrollView>
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
  description: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 4,
  },
  category: {
    fontSize: 12,
    color: '#888888',
    marginTop: 4,
    marginBottom: 12,
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#2a2a2a',
  },
  splitText: {
    color: '#cccccc',
    fontSize: 14,
  },
  settleButton: {
    backgroundColor: '#4ade80',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  settleText: {
    color: '#000000',
    fontWeight: 'bold',
    fontSize: 12,
  },
  settled: {
    color: '#4ade80',
    fontSize: 14,
  },
});

  