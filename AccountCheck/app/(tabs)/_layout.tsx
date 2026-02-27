import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { HapticTab } from '@/components/haptic-tab';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#080d1a',
          borderTopWidth: 1,
          borderTopColor: 'rgba(59,130,246,0.15)',
          height: 75,
          paddingBottom: 8,
          paddingTop: 0,
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#4a5568',
        tabBarButton: HapticTab,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', paddingTop: 4 }}>
              {focused && (
                <View style={{
                  width: 40,
                  height: 4,
                  backgroundColor: '#3B82F6',
                  borderRadius: 4,
                  marginBottom: 6,
                }}/>
              )}
              <Ionicons name="home" size={22} color={focused ? '#3B82F6' : '#4a5568'} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="splits"
        options={{
          title: 'Splits',
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', paddingTop: 4 }}>
              {focused && (
                <View style={{
                  width: 40,
                  height: 4,
                  backgroundColor: '#3B82F6',
                  borderRadius: 4,
                  marginBottom: 6,
                }}/>
              )}
              <Ionicons name="people" size={22} color={focused ? '#3B82F6' : '#4a5568'} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarIcon: () => (
            <View style={styles.fab}>
              <Text style={{ color: '#fff', fontSize: 28, fontWeight: '300', marginTop: -2 }}>+</Text>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="goals"
        options={{
          title: 'Goals',
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', paddingTop: 4 }}>
              {focused && (
                <View style={{
                  width: 40,
                  height: 4,
                  backgroundColor: '#3B82F6',
                  borderRadius: 4,
                  marginBottom: 6,
                }}/>
              )}
              <Ionicons name="flag" size={22} color={focused ? '#3B82F6' : '#4a5568'} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: 'Analysis',
          tabBarIcon: ({ focused }) => (
            <View style={{ alignItems: 'center', paddingTop: 4 }}>
              {focused && (
                <View style={{
                  width: 40,
                  height: 4,
                  backgroundColor: '#3B82F6',
                  borderRadius: 4,
                  marginBottom: 6,
                }}/>
              )}
              <Ionicons name="bar-chart" size={22} color={focused ? '#3B82F6' : '#4a5568'} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
});