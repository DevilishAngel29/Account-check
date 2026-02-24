import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../../constants/api';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet} from 'react-native';
import { router } from 'expo-router';


export default function AccountsScreen() {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE}/accounts/`)
      .then(res => setAccounts(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0d0d0f', padding: 20, paddingTop: 60 }}>
      <Text style={{ color: '#fff', fontSize: 28, fontWeight: 'bold', marginBottom: 24 }}>
        Accounts
      </Text>

      {accounts.map(account => (
    <TouchableOpacity key={account.id} style={styles.card} onPress={() => router.push(`/account/${account.id}`)}>
            <LinearGradient
                colors={['#D742A0', '#8B31C7', '#4B2BE0']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.heroCard}
                >
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>
                    {account.type.toUpperCase()}
                </Text>
                <Text style={styles.cardTitle}>{account.name}</Text>
                <Text style={styles.amount}>₹{account.balance}</Text>
            </LinearGradient>        
          </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  
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
  
  heroCard: {
    padding: 24,
    borderRadius: 24,
    color: '#ffffff',
    marginBottom: 16
  },
});