import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Modal, Vibration } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation }) {
  const [calories, setCalories] = useState(0);
  const [protein, setProtein] = useState(0);
  const [carbs, setCarbs] = useState(0);
  const [fats, setFats] = useState(0);
  const [targetCalories, setTargetCalories] = useState(2000);
  const [targetProtein, setTargetProtein] = useState(150);
  const [targetCarbs, setTargetCarbs] = useState(250);
  const [targetFats, setTargetFats] = useState(70);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalValue, setModalValue] = useState('');
  const [modalProtein, setModalProtein] = useState('');
  const [modalCarbs, setModalCarbs] = useState('');
  const [modalFats, setModalFats] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);
  const [isAdding, setIsAdding] = useState(true);
  const [level, setLevel] = useState(1);
  const [trackProtein, setTrackProtein] = useState(true);
  const [trackCarbs, setTrackCarbs] = useState(true);
  const [trackFats, setTrackFats] = useState(true);
  const [lastLoginDate, setLastLoginDate] = useState(null);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [entriesExpanded, setEntriesExpanded] = useState(false);
  const [entries, setEntries] = useState([]);
  const [editingEntryId, setEditingEntryId] = useState(null);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      checkAndResetDaily();
      loadData();
      loadTargets();
      loadTrackingSettings();
      loadEntries();
    });

    // Load initial streak value
    const loadInitialStreak = async () => {
      try {
        const savedStreak = await AsyncStorage.getItem('currentStreak');
        if (savedStreak) {
          setCurrentStreak(parseInt(savedStreak));
        } else {
          // If no streak exists, set to 1
          setCurrentStreak(1);
          await AsyncStorage.setItem('currentStreak', '1');
        }
      } catch (error) {
        console.error('Error loading initial streak:', error);
        setCurrentStreak(1);
      }
    };

    loadInitialStreak();

    return unsubscribe;
  }, [navigation]);

  const checkAndResetDaily = async () => {
    try {
      const today = new Date().toDateString();
      const savedLastLogin = await AsyncStorage.getItem('lastLoginDate');
      const savedStreak = await AsyncStorage.getItem('currentStreak');
      
      if (savedLastLogin) {
        const lastLogin = new Date(savedLastLogin).toDateString();
        
        if (lastLogin !== today) {
          // It's a new day
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (lastLogin === yesterday.toDateString()) {
            // Consecutive day - increment streak
            const newStreak = (parseInt(savedStreak) || 0) + 1;
            setCurrentStreak(newStreak);
            await AsyncStorage.setItem('currentStreak', newStreak.toString());
            setLevel(newStreak);
          } else {
            // Streak broken - reset to 1
            setCurrentStreak(1);
            await AsyncStorage.setItem('currentStreak', '1');
            setLevel(1);
          }
          
          // Reset daily values
          setCalories(0);
          setProtein(0);
          setCarbs(0);
          setFats(0);
          await saveData('calories', '0');
          await saveData('protein', '0');
          await saveData('carbs', '0');
          await saveData('fats', '0');
        }
      } else {
        // First time login
        setCurrentStreak(1);
        await AsyncStorage.setItem('currentStreak', '1');
        setLevel(1);
      }
      
      // Update last login date
      await AsyncStorage.setItem('lastLoginDate', new Date().toISOString());
      setLastLoginDate(today);
      
    } catch (error) {
      console.error('Error checking daily reset:', error);
    }
  };

  const loadData = async () => {
    try {
      const savedCalories = await AsyncStorage.getItem('calories');
      const savedProtein = await AsyncStorage.getItem('protein');
      const savedCarbs = await AsyncStorage.getItem('carbs');
      const savedFats = await AsyncStorage.getItem('fats');
      
      if (savedCalories) setCalories(parseInt(savedCalories));
      if (savedProtein) setProtein(parseInt(savedProtein));
      if (savedCarbs) setCarbs(parseInt(savedCarbs));
      if (savedFats) setFats(parseInt(savedFats));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const loadTargets = async () => {
    try {
      const savedTargetCalories = await AsyncStorage.getItem('targetCalories');
      const savedTargetProtein = await AsyncStorage.getItem('targetProtein');
      const savedTargetCarbs = await AsyncStorage.getItem('targetCarbs');
      const savedTargetFats = await AsyncStorage.getItem('targetFats');
      
      if (savedTargetCalories) setTargetCalories(parseInt(savedTargetCalories));
      if (savedTargetProtein) setTargetProtein(parseInt(savedTargetProtein));
      if (savedTargetCarbs) setTargetCarbs(parseInt(savedTargetCarbs));
      if (savedTargetFats) setTargetFats(parseInt(savedTargetFats));
    } catch (error) {
      console.error('Error loading targets:', error);
    }
  };

  const loadTrackingSettings = async () => {
    try {
      const savedTrackProtein = await AsyncStorage.getItem('trackProtein');
      const savedTrackCarbs = await AsyncStorage.getItem('trackCarbs');
      const savedTrackFats = await AsyncStorage.getItem('trackFats');

      if (savedTrackProtein !== null) {
        setTrackProtein(savedTrackProtein === 'true');
      }
      if (savedTrackCarbs !== null) {
        setTrackCarbs(savedTrackCarbs === 'true');
      }
      if (savedTrackFats !== null) {
        setTrackFats(savedTrackFats === 'true');
      }
    } catch (error) {
      console.error('Error loading tracking settings:', error);
    }
  };

  const loadEntries = async () => {
    try {
      const savedEntries = await AsyncStorage.getItem('entries');
      if (savedEntries) {
        setEntries(JSON.parse(savedEntries));
      }
    } catch (error) {
      console.error('Error loading entries:', error);
    }
  };

  const saveData = async (key, value) => {
    try {
      await AsyncStorage.setItem(key, value.toString());
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const saveEntries = async (newEntries) => {
    try {
      await AsyncStorage.setItem('entries', JSON.stringify(newEntries));
    } catch (error) {
      console.error('Error saving entries:', error);
    }
  };

  const addEntry = (calories, protein, carbs, fats) => {
    const newEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      calories: parseInt(calories) || 0,
      protein: parseInt(protein) || 0,
      carbs: parseInt(carbs) || 0,
      fats: parseInt(fats) || 0
    };
    const newEntries = [...entries, newEntry];
    setEntries(newEntries);
    saveEntries(newEntries);
  };

  const deleteEntry = async (id) => {
    const newEntries = entries.filter(entry => entry.id !== id);
    setEntries(newEntries);
    await saveEntries(newEntries);
    
    // Recalculate totals
    const totals = newEntries.reduce((acc, entry) => {
      acc.calories += entry.calories;
      acc.protein += entry.protein;
      acc.carbs += entry.carbs;
      acc.fats += entry.fats;
      return acc;
    }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

    setCalories(totals.calories);
    setProtein(totals.protein);
    setCarbs(totals.carbs);
    setFats(totals.fats);

    await saveData('calories', totals.calories.toString());
    await saveData('protein', totals.protein.toString());
    await saveData('carbs', totals.carbs.toString());
    await saveData('fats', totals.fats.toString());
  };

  const handleModalSubmit = () => {
    if (modalValue) {
      const value = parseInt(modalValue);
      const proteinValue = parseInt(modalProtein) || 0;
      const carbsValue = parseInt(modalCarbs) || 0;
      const fatsValue = parseInt(modalFats) || 0;

      if (!isNaN(value)) {
        if (isAdding) {
          addEntry(value, proteinValue, carbsValue, fatsValue);
          setCalories(calories + value);
          setProtein(protein + proteinValue);
          setCarbs(carbs + carbsValue);
          setFats(fats + fatsValue);
          saveData('calories', (calories + value).toString());
          saveData('protein', (protein + proteinValue).toString());
          saveData('carbs', (carbs + carbsValue).toString());
          saveData('fats', (fats + fatsValue).toString());

          // Check for goal achievement
          if (calories + value >= targetCalories) {
            Vibration.vibrate(4000);
          }
        } else {
          // Find the entry being edited using the stored ID
          const editedEntry = entries.find(entry => entry.id === editingEntryId);

          if (editedEntry) {
            // Update the entry
            const updatedEntries = entries.map(entry => {
              if (entry.id === editingEntryId) {
                return {
                  ...entry,
                  calories: value,
                  protein: proteinValue,
                  carbs: carbsValue,
                  fats: fatsValue
                };
              }
              return entry;
            });

            // Recalculate totals
            const totals = updatedEntries.reduce((acc, entry) => {
              acc.calories += entry.calories;
              acc.protein += entry.protein;
              acc.carbs += entry.carbs;
              acc.fats += entry.fats;
              return acc;
            }, { calories: 0, protein: 0, carbs: 0, fats: 0 });

            // Update state
            setEntries(updatedEntries);
            setCalories(totals.calories);
            setProtein(totals.protein);
            setCarbs(totals.carbs);
            setFats(totals.fats);

            // Save to storage
            saveEntries(updatedEntries);
            saveData('calories', totals.calories.toString());
            saveData('protein', totals.protein.toString());
            saveData('carbs', totals.carbs.toString());
            saveData('fats', totals.fats.toString());
          }
        }
      }
    }
    setModalVisible(false);
    setModalValue('');
    setModalProtein('');
    setModalCarbs('');
    setModalFats('');
    setEditingEntryId(null);
  };

  const openModal = (category, adding) => {
    setActiveCategory(category);
    setIsAdding(adding);
    setModalVisible(true);
  };

  const ProgressBar = ({ value, max, color, category }) => {
    const remainingValue = max - value;
    const percentage = Math.min(100, (remainingValue / max) * 100);
    
    // Color interpolation from green to red
    const getHealthColor = (percentage) => {
      const hue = (percentage / 100) * 120; // 120 is green, 0 is red
      return `hsl(${hue}, 100%, 50%)`;
    };

    return (
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBar, 
            { 
              width: `${category === 'calories' ? percentage : (value / max) * 100}%`,
              backgroundColor: category === 'calories' ? getHealthColor(percentage) : color
            }
          ]} 
        />
        <View style={styles.progressBarBorder} />
      </View>
    );
  };

  const getLevelEmoji = (level) => {
    if (level >= 20) return '🧙‍♂️'; // Wizard
    if (level >= 15) return '👑'; // King
    if (level >= 10) return '⚔️'; // Knight
    if (level >= 5) return '🛡️'; // Warrior
    return '👤'; // Citizen
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>FIT QUEST</Text>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => navigation.navigate('Settings')}
          >
            <Text style={styles.settingsButtonText}>⚙️</Text>
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.content}>
          <Text style={styles.title}>CALORIES</Text>
          <ProgressBar value={calories} max={targetCalories} color="#FF4500" category="calories" />
          <Text style={styles.value}>{targetCalories - calories} / {targetCalories}</Text>

          {(targetProtein > 0 || targetCarbs > 0 || targetFats > 0) && (
            <>
              <Text style={styles.subtitle}>MACROS</Text>
              <View style={styles.macroContainer}>
                {targetProtein > 0 && (
                  <View style={styles.macroItem}>
                    <Text style={styles.macroLabel}>PROTEIN</Text>
                    <ProgressBar value={protein} max={targetProtein} color="#FF4500" category="protein" />
                    <Text style={styles.macroValue}>{protein}g / {targetProtein}g</Text>
                  </View>
                )}
                {targetCarbs > 0 && (
                  <View style={styles.macroItem}>
                    <Text style={styles.macroLabel}>CARBS</Text>
                    <ProgressBar value={carbs} max={targetCarbs} color="#FF4500" category="carbs" />
                    <Text style={styles.macroValue}>{carbs}g / {targetCarbs}g</Text>
                  </View>
                )}
                {targetFats > 0 && (
                  <View style={styles.macroItem}>
                    <Text style={styles.macroLabel}>FATS</Text>
                    <ProgressBar value={fats} max={targetFats} color="#FF4500" category="fats" />
                    <Text style={styles.macroValue}>{fats}g / {targetFats}g</Text>
                  </View>
                )}
              </View>
            </>
          )}

          <TouchableOpacity 
            style={styles.addEntryButton}
            onPress={() => {
              setIsAdding(true);
              setModalVisible(true);
            }}
          >
            <Text style={styles.addEntryButtonText}>+ ADD ENTRY</Text>
          </TouchableOpacity>

          <View style={styles.entriesSection}>
            <TouchableOpacity 
              style={styles.entriesHeader}
              onPress={() => setEntriesExpanded(!entriesExpanded)}
            >
              <Text style={styles.subtitle}>ENTRIES</Text>
              <Text style={styles.expandButton}>{entriesExpanded ? '▼' : '▶'}</Text>
            </TouchableOpacity>
            
            {entriesExpanded && (
              <View style={styles.entriesList}>
                {entries.map((entry) => (
                  <View key={entry.id} style={styles.entryItem}>
                    <View style={styles.entryInfo}>
                      <Text style={styles.entryTime}>
                        {new Date(entry.timestamp).toLocaleTimeString()}
                      </Text>
                      <Text style={styles.entryValue}>
                        {entry.calories} cal
                        {entry.protein > 0 && ` | ${entry.protein}g protein`}
                        {entry.carbs > 0 && ` | ${entry.carbs}g carbs`}
                        {entry.fats > 0 && ` | ${entry.fats}g fats`}
                      </Text>
                    </View>
                    <View style={styles.entryActions}>
                      <TouchableOpacity 
                        style={styles.editButton}
                        onPress={() => {
                          setModalValue(entry.calories.toString());
                          setModalProtein(entry.protein.toString());
                          setModalCarbs(entry.carbs.toString());
                          setModalFats(entry.fats.toString());
                          setEditingEntryId(entry.id);
                          setIsAdding(false);
                          setModalVisible(true);
                        }}
                      >
                        <Text style={styles.editButtonText}>EDIT</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.deleteButton}
                        onPress={() => deleteEntry(entry.id)}
                      >
                        <Text style={styles.deleteButtonText}>DELETE</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.levelSection}>
            <View style={styles.levelContainer}>
              <Text style={styles.levelText}>LVL {currentStreak}</Text>
            </View>
          </View>
        </ScrollView>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <ScrollView style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {isAdding ? 'ADD' : 'SUBTRACT'} ENTRY
              </Text>
              <View style={styles.modalInputGroup}>
                <Text style={styles.modalLabel}>Calories:</Text>
                <TextInput
                  style={styles.modalInput}
                  value={modalValue}
                  onChangeText={setModalValue}
                  keyboardType="numeric"
                  placeholder="Enter calories"
                  placeholderTextColor="#666"
                  returnKeyType="done"
                  blurOnSubmit={true}
                />
              </View>
              {targetProtein > 0 && (
                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalLabel}>Protein (g):</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={modalProtein}
                    onChangeText={setModalProtein}
                    keyboardType="numeric"
                    placeholder="Enter protein"
                    placeholderTextColor="#666"
                    returnKeyType="done"
                    blurOnSubmit={true}
                  />
                </View>
              )}
              {targetCarbs > 0 && (
                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalLabel}>Carbs (g):</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={modalCarbs}
                    onChangeText={setModalCarbs}
                    keyboardType="numeric"
                    placeholder="Enter carbs"
                    placeholderTextColor="#666"
                    returnKeyType="done"
                    blurOnSubmit={true}
                  />
                </View>
              )}
              {targetFats > 0 && (
                <View style={styles.modalInputGroup}>
                  <Text style={styles.modalLabel}>Fats (g):</Text>
                  <TextInput
                    style={styles.modalInput}
                    value={modalFats}
                    onChangeText={setModalFats}
                    keyboardType="numeric"
                    placeholder="Enter fats"
                    placeholderTextColor="#666"
                    returnKeyType="done"
                    blurOnSubmit={true}
                  />
                </View>
              )}
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.cancelButton]} 
                  onPress={() => setModalVisible(false)}
                >
                  <Text style={[styles.buttonText, styles.modalButtonText]}>CANCEL</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, styles.submitButton]} 
                  onPress={handleModalSubmit}
                >
                  <Text style={[styles.buttonText, styles.modalButtonText]}>SUBMIT</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Modal>
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
    marginBottom: 20,
  },
  title: {
    color: '#fff',
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'PressStart2P',
    textShadowColor: '#FF4500',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  subtitle: {
    color: '#fff',
    fontSize: 16,
    marginTop: 30,
    marginBottom: 10,
    textAlign: 'center',
    fontFamily: 'PressStart2P',
    textShadowColor: '#FF4500',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  value: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'PressStart2P',
  },
  progressBarContainer: {
    height: 40,
    backgroundColor: '#2a2a2a',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
    position: 'relative',
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  progressBarBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 2,
    borderColor: '#FF4500',
    borderRadius: 5,
  },
  progressBarButtons: {
    position: 'absolute',
    right: 5,
    top: 5,
    flexDirection: 'row',
  },
  progressBarButton: {
    width: 30,
    height: 30,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF4500',
    marginLeft: 5,
  },
  macroContainer: {
    marginTop: 20,
  },
  macroItem: {
    marginBottom: 10,
  },
  macroLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 5,
    fontFamily: 'PressStart2P',
  },
  macroValue: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'PressStart2P',
  },
  settingsButton: {
    padding: 10,
  },
  settingsButtonText: {
    fontSize: 24,
    color: '#FF4500',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
    borderWidth: 2,
    borderColor: '#FF4500',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'PressStart2P',
  },
  modalInputGroup: {
    marginBottom: 15,
  },
  modalLabel: {
    color: '#fff',
    fontFamily: 'PressStart2P',
    fontSize: 12,
    marginBottom: 5,
  },
  modalInput: {
    backgroundColor: '#2a2a2a',
    color: '#fff',
    padding: 10,
    borderRadius: 5,
    marginBottom: 20,
    fontFamily: 'PressStart2P',
    fontSize: 12,
    borderWidth: 2,
    borderColor: '#FF4500',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginHorizontal: 5,
    borderWidth: 2,
    borderColor: '#FF4500',
  },
  cancelButton: {
    backgroundColor: '#2a2a2a',
  },
  submitButton: {
    backgroundColor: '#2a2a2a',
  },
  addButton: {
    backgroundColor: '#2a2a2a',
  },
  subtractButton: {
    backgroundColor: '#2a2a2a',
  },
  levelSection: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  levelContainer: {
    backgroundColor: '#FF4500',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 3,
    borderColor: '#FF4500',
    transform: [{ scale: 1.2 }],
  },
  levelText: {
    color: '#fff',
    fontFamily: 'PressStart2P',
    fontSize: 16,
    textShadowColor: '#000',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 0,
  },
  streakText: {
    color: '#fff',
    fontFamily: 'PressStart2P',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 5,
    textShadowColor: '#FF4500',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 0,
  },
  content: {
    padding: 10,
  },
  modalButtonText: {
    fontFamily: 'PressStart2P',
    fontSize: 12,
    color: '#fff',
  },
  buttonText: {
    color: '#fff',
    fontFamily: 'PressStart2P',
    fontSize: 16,
  },
  entriesSection: {
    marginTop: 20,
  },
  entriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  expandButton: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'PressStart2P',
  },
  entriesList: {
    marginTop: 10,
  },
  addEntryButton: {
    backgroundColor: '#FF4500',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 10,
  },
  addEntryButtonText: {
    color: '#fff',
    fontFamily: 'PressStart2P',
    fontSize: 16,
  },
  entryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#2a2a2a',
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#FF4500',
  },
  entryInfo: {
    flex: 1,
    marginRight: 10,
  },
  entryTime: {
    color: '#fff',
    fontFamily: 'PressStart2P',
    fontSize: 10,
    marginBottom: 5,
  },
  entryValue: {
    color: '#fff',
    fontFamily: 'PressStart2P',
    fontSize: 10,
  },
  entryActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#FF4500',
    marginRight: 5,
  },
  editButtonText: {
    color: '#fff',
    fontFamily: 'PressStart2P',
    fontSize: 10,
  },
  deleteButton: {
    padding: 5,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#FF4500',
  },
  deleteButtonText: {
    color: '#fff',
    fontFamily: 'PressStart2P',
    fontSize: 10,
  },
}); 