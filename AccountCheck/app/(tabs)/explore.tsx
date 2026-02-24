import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useState } from 'react';
import axios from 'axios';
import { API_BASE } from '@/constants/api';

const CATEGORIES = ['Food', 'Rent', 'Travel', 'Entertainment', 'Health', 'Shopping', 'Utilities', 'Other'];
const TYPES = ['expense', 'split', 'loan'];


export default function AddExpenseScreen() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food');
  const [type, setType] = useState('expense');
  const [paidBy, setPaidBy] = useState('');
  const [splitWith, setSplitWith] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    try {
      const body = {
        amount: parseFloat(amount),
        description,
        category,
        type,
        paid_by: paidBy || null,
        split_with: splitWith ? splitWith.split(',').map(s => s.trim()) : null,
        transaction_date: new Date().toISOString().split('T')[0],
      };
      await axios.post(`${API_BASE}/transactions/`, body);
      setMessage('Expense added!');
      setAmount('');
      setDescription('');
      setSplitWith('');
    } catch (err) {
      setMessage('Something went wrong');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Add Expense</Text>

      <Text style={styles.label}>Amount (₹)</Text>
      <TextInput
        style={styles.input}
        keyboardType='numeric'
        value={amount}
        onChangeText={setAmount}
        placeholder='0'
        placeholderTextColor='#444'
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder='Dinner, rent...'
        placeholderTextColor='#444'
      />

      <Text style={styles.label}>Category</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, category === cat && styles.chipActive]}
            onPress={() => setCategory(cat)}>
            <Text style={[styles.chipText, category === cat && styles.chipTextActive]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Text style={styles.label}>Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
        {TYPES.map(t => (
          <TouchableOpacity
            key={t}
            style={[styles.chip, type === t && styles.chipActive]}
            onPress={() => setType(t)}>
            <Text style={[styles.chipText, type === t && styles.chipTextActive]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {(type === 'split' || type === 'loan') && (
        <>
          <Text style={styles.label}>Paid By</Text>
          <TextInput
            style={styles.input}
            value={paidBy}
            onChangeText={setPaidBy}
            placeholder='Lavish'
            placeholderTextColor='#444'
          />
          <Text style={styles.label}>Split With (comma separated)</Text>
          <TextInput
            style={styles.input}
            value={splitWith}
            onChangeText={setSplitWith}
            placeholder='Shubham, Nipun'
            placeholderTextColor='#444'
          />
        </>
      )}

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Add Expense</Text>
      </TouchableOpacity>
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
  label: {
    fontSize: 14,
    color: '#888888',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    color: '#ffffff',
    fontSize: 16,
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  chip: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#6366f1',
  },
  chipText: {
    color: '#888888',
    fontSize: 14,
  },
  chipTextActive: {
    color: '#ffffff',
  },
  button: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  message: {
    color: '#4ade80',
    marginTop: 12,
    textAlign: 'center',
  },
});