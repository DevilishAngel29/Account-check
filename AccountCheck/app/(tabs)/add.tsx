import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE } from '@/constants/api';
import { Picker } from '@react-native-picker/picker';
const CATEGORIES = ['Food', 'Rent', 'Travel', 'Entertainment', 'Health', 'Shopping', 'Utilities', 'Other'];
const TYPES = ['expense', 'income'];
import { Modal } from 'react-native';




export default function AddExpenseScreen() {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Food');
  const [type, setType] = useState('expense');
  const [splitPeople, setSplitPeople] = useState([
    { name: '', amount: '' }  // start with one empty row
]);
  const [message, setMessage] = useState('');
  const [isSplit, setIsSplit] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);


  

 const handleSubmit = async () => {
  try {
        const body = {
  amount: parseFloat(amount),
  description,
  category,
  type,
  is_split: isSplit,
  your_share: null,  // add this — backend calculates if null
  paid_by_me: true, 
  transaction_date: new Date().toISOString().split('T')[0],
  split_with: isSplit ? splitPeople
    .filter(p => p.name.trim() !== '')
    .map(p => p.amount 
      ? { name: p.name.trim(), amount: parseFloat(p.amount) }
      : p.name.trim()
    ) : null,
};
    await axios.post(`${API_BASE}/transactions/`, body);
    setMessage('Expense added!');
    setAmount('');
    setDescription('');
  } catch (err) {
    setMessage('Something went wrong');
  }
};
const addPerson = () => {
  setSplitPeople([...splitPeople, { name: '', amount: '' }]);
};

const updatePerson = (index, field, value) => {
  const updated = [...splitPeople];
  updated[index][field] = value;
  setSplitPeople(updated);
};

const removePerson = (index) => {
  setSplitPeople(splitPeople.filter((_, i) => i !== index));
};

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Add Transaction</Text>

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



      {/* Split Toggle */}
<View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
  <Text style={styles.label}>Split this expense?</Text>

  <TouchableOpacity 
  onPress={() => setIsSplit(!isSplit)}
  style={{
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#6366f1',
    backgroundColor: isSplit ? '#6366f1' : 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  }}>
  {isSplit && <Text style={{ color: '#fff', fontSize: 14 }}>✓</Text>}
</TouchableOpacity>
</View>

{/* Only show when isSplit is true */}
{isSplit && (
  <>
    <Text style={styles.label}>Split With</Text>
      <Text style={{ color: '#555', fontSize: 12, marginBottom: 4}}>
        (Leave amount blank for equal split)
      </Text>
      {splitPeople.map((person, index) => (
        <View key={index} style={{ flexDirection: 'row', marginBottom: 8 }}>
          <TextInput
            style={[styles.input, { flex: 1, marginRight: 8 }]}
            value={person.name}
            onChangeText={(value) => updatePerson(index, 'name', value)}
            placeholder='Name'
            placeholderTextColor='#444'
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            keyboardType='numeric'
            value={person.amount}
            onChangeText={(value) => updatePerson(index, 'amount', value)}
            placeholder='Amount'
            placeholderTextColor='#444'
          />
          <TouchableOpacity onPress={() => removePerson(index)} style={{ padding: 12 }}>
            <Text style={{ color: '#ff0000' }}>Remove</Text>
          </TouchableOpacity>
        </View>
    ))}
    <TouchableOpacity onPress={addPerson}>
      <Text style={{ color: '#6366f1' }}>+ Add Person</Text>
    </TouchableOpacity>
  </>
)}


      {message ? <Text style={styles.message}>{message}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>
          {type === 'income' ? 'Add Income' : 'Add Expense'}
      </Text>
      </TouchableOpacity>
      <View style={{ height: 50 }} />
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
  pickerContainer: {
  backgroundColor: '#1a1a1a',
  borderRadius: 12,
  marginBottom: 8,
},
});