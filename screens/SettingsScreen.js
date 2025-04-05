import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Switch, ScrollView, SafeAreaView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SettingsScreen({ navigation }) {
  const [targetCalories, setTargetCalories] = useState('2000');
  const [targetProtein, setTargetProtein] = useState('150');
  const [targetCarbs, setTargetCarbs] = useState('250');
  const [targetFats, setTargetFats] = useState('70');

  useEffect(() => {
    loadTargets();
  }, []);

  const loadTargets = async () => {
    try {
      const savedTargetCalories = await AsyncStorage.getItem('targetCalories');
      const savedTargetProtein = await AsyncStorage.getItem('targetProtein');
      const savedTargetCarbs = await AsyncStorage.getItem('targetCarbs');
      const savedTargetFats = await AsyncStorage.getItem('targetFats');

      if (savedTargetCalories) setTargetCalories(savedTargetCalories);
      if (savedTargetProtein) setTargetProtein(savedTargetProtein);
      if (savedTargetCarbs) setTargetCarbs(savedTargetCarbs);
      if (savedTargetFats) setTargetFats(savedTargetFats);
    } catch (error) {
      console.error('Error loading targets:', error);
    }
  };

  const saveTargets = async () => {
    try {
      await AsyncStorage.setItem('targetCalories', targetCalories);
      await AsyncStorage.setItem('targetProtein', targetProtein);
      await AsyncStorage.setItem('targetCarbs', targetCarbs);
      await AsyncStorage.setItem('targetFats', targetFats);
      navigation.goBack();
    } catch (error) {
      console.error('Error saving targets:', error);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>SETTINGS</Text>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DAILY GOALS</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Calories:</Text>
              <TextInput
                style={styles.input}
                value={targetCalories}
                onChangeText={setTargetCalories}
                keyboardType="numeric"
                placeholder="Enter target calories"
                placeholderTextColor="#666"
                returnKeyType="done"
                blurOnSubmit={true}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Protein (g):</Text>
              <TextInput
                style={styles.input}
                value={targetProtein}
                onChangeText={setTargetProtein}
                keyboardType="numeric"
                placeholder="Enter target protein"
                placeholderTextColor="#666"
                returnKeyType="done"
                blurOnSubmit={true}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Carbs (g):</Text>
              <TextInput
                style={styles.input}
                value={targetCarbs}
                onChangeText={setTargetCarbs}
                keyboardType="numeric"
                placeholder="Enter target carbs"
                placeholderTextColor="#666"
                returnKeyType="done"
                blurOnSubmit={true}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fats (g):</Text>
              <TextInput
                style={styles.input}
                value={targetFats}
                onChangeText={setTargetFats}
                keyboardType="numeric"
                placeholder="Enter target fats"
                placeholderTextColor="#666"
                returnKeyType="done"
                blurOnSubmit={true}
              />
            </View>
          </View>
          <Text style={styles.hint}>
            Set a macro to 0 to hide it from the home screen
          </Text>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={saveTargets}
          >
            <Text style={styles.saveButtonText}>SAVE</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#FF4500',
  },
  title: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'PressStart2P',
    textShadowColor: '#FF4500',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  backButton: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: '#FF4500',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 20,
    fontFamily: 'PressStart2P',
  },
  content: {
    padding: 20,
  },
  section: {
    backgroundColor: '#2a2a2a',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#FF4500',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    fontFamily: 'PressStart2P',
    textAlign: 'center',
    textShadowColor: '#FF4500',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 5,
    fontFamily: 'PressStart2P',
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    padding: 15,
    borderRadius: 5,
    fontFamily: 'PressStart2P',
    fontSize: 12,
    borderWidth: 2,
    borderColor: '#FF4500',
  },
  hint: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 20,
    fontFamily: 'PressStart2P',
    textAlign: 'center',
    opacity: 0.7,
  },
  saveButton: {
    backgroundColor: '#FF4500',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 2,
    borderColor: '#FF4500',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'PressStart2P',
  },
}); 