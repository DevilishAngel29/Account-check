import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../../constants/api';
import { router } from 'expo-router';

export default function SplitsScreen() {
  const [people, setPeople] = useState([]);

  useEffect(() => {
    axios.get(`${API_BASE}/people/`)
      .then(res => setPeople(res.data))
      .catch(err => console.log(err));
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Splits</Text>

      {people.length === 0 ? (
        <Text style={{ color: '#555', textAlign: 'center', marginTop: 40 }}>
          No splits yet
        </Text>
      ) : (
        people.map(person => (
          <TouchableOpacity key={person.name} style={styles.card} onPress={()=> router.push(`/person/${person.name}`)}>
            {/* Avatar circle with first letter */}
            <View style={styles.row}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {person.name.charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.info}>
                <Text style={styles.name}>{person.name}</Text>
                <Text style={[
                  styles.status,
                  person.they_owe_me ? styles.green : styles.red
                ]}>
                  {person.they_owe_me ? 'owes you' : 'you owe'}
                </Text>
              </View>

              <Text style={[
                styles.amount,
                person.they_owe_me ? styles.green : styles.red
              ]}>
                ₹{person.balance}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d0d0f',
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
    padding: 16,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#8B31C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  info: {
    flex: 1,
  },
  name: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    fontSize: 12,
    marginTop: 2,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  green: {
    color: '#4ade80',
  },
  red: {
    color: '#f87171',
  },
});