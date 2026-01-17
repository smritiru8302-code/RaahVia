import React, { useState, useRef } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TextInput, 
  TouchableOpacity, KeyboardAvoidingView, Platform 
} from 'react-native'; // Removed Dimensions
import { X, Send, Map as MapIcon, Bot } from 'lucide-react-native';
import { SBU_DATA, PERSONNEL_DB } from '../universityData'; 

// --- FIX: Unused width and Dimensions removed ---

export const AiAssistant = ({ onClose, onShowMap }) => {
  const [input, setInput] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { 
      id: 1, 
      type: 'ai', 
      text: "Welcome to RaahVia Assistant. Please enter a personnel name, department, or campus location to begin." 
    }
  ]);
  const scrollViewRef = useRef();

  const getSmartResponse = (userText) => {
    const text = userText.toLowerCase().trim();
    
    const synonymMap = {
      'vc': 'vice chancellor',
      'dg': 'director general',
      'registrar': 'prof. s. b. dandin',
      'hod': 'head of department',
      'admin': 'administrative block'
    };

    let expandedText = text;
    Object.keys(synonymMap).forEach(key => {
      if (text === key || text.includes(` ${key}`) || text.includes(`${key} `)) {
        expandedText = expandedText.replace(key, synonymMap[key]);
      }
    });

    // Search Personnel
    const person = PERSONNEL_DB.find(p => 
      expandedText.includes(p.name.toLowerCase()) || 
      expandedText.includes(p.role.toLowerCase()) ||
      p.name.toLowerCase().includes(expandedText) ||
      p.role.toLowerCase().includes(expandedText)
    );

    if (person) {
      return {
        text: `Record Found: ${person.name}\nDesignation: ${person.role}\nLocation: ${person.block}, Floor ${person.floor}, Room ${person.room}.`,
        type: 'personnel'
      };
    }

    // Search Locations
    const location = SBU_DATA.find(l => 
      expandedText.includes(l.title.toLowerCase()) || 
      expandedText.includes(l.block.toLowerCase()) ||
      l.title.toLowerCase().includes(expandedText)
    );

    if (location) {
      return {
        text: `Location Found: ${location.title}\nArea: ${location.block} Block\nLevel: ${location.floor}.`,
        data: location,
        type: 'map'
      };
    }

    if (text.match(/hi|hello|hey|start/)) {
      return { text: "System Online. Ready for directory or navigation queries." };
    }

    return { text: "Search query not recognized. Please specify a Block name or Personnel title (e.g., 'Pharmacy' or 'VC')." };
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg = { id: Date.now(), type: 'user', text: input };
    const response = getSmartResponse(input);
    const aiMsg = { 
      id: Date.now() + 1, 
      type: 'ai', 
      text: response.text, 
      data: response.data,
      uiType: response.type 
    };

    setChatHistory(prev => [...prev, userMsg, aiMsg]);
    setInput('');
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.fullScreen}
    >
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.aiIconCircle}>
             <Bot color="#2D6A4F" size={18} />
          </View>
          <Text style={styles.headerTitle}>Campus Directory AI</Text>
        </View>
        <TouchableOpacity onPress={onClose}>
          <X color="#2D6A4F" size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.chatArea}
        ref={scrollViewRef}
        contentContainerStyle={{ paddingVertical: 20 }}
        onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
      >
        {chatHistory.map((item) => (
          <View key={item.id} style={[
            styles.wrapper, 
            item.type === 'user' ? {alignItems: 'flex-end'} : {alignItems: 'flex-start'}
          ]}>
            <View style={[
              styles.bubble, 
              item.type === 'user' ? styles.userBubble : styles.aiBubble
            ]}>
              <Text style={[
                styles.chatText, 
                item.type === 'user' ? styles.userText : styles.aiText
              ]}>{item.text}</Text>
            </View>
            
            {item.data && (
              <View style={styles.actionCard}>
                 <TouchableOpacity 
                   style={styles.mapBtn} 
                   onPress={() => onShowMap(item.data)}
                 >
                    <MapIcon color="#40916C" size={16} />
                    <Text style={styles.mapBtnText}>View Navigation Path</Text>
                 </TouchableOpacity>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.inputBox}>
          <TextInput 
            placeholder="Enter name or location..." 
            style={[
              styles.input, 
              Platform.select({
                web: { outlineStyle: 'none' }
              })
            ]} 
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            placeholderTextColor="#999"
          />
          <TouchableOpacity onPress={handleSend}>
            <Send color="#74C69D" size={22} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  fullScreen: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', 
    borderRadius: 20, 
    margin: 10, 
    elevation: 10, 
    overflow: 'hidden' 
  },
  header: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: 18, 
    backgroundColor: 'white', 
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#B7E4C7' 
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  aiIconCircle: { 
    width: 32, 
    height: 32, 
    borderRadius: 8, 
    backgroundColor: '#D8F3DC', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#1B4332', marginLeft: 10 },
  chatArea: { flex: 1, paddingHorizontal: 16 },
  wrapper: { marginVertical: 6, width: '100%' },
  bubble: { 
    padding: 14, 
    borderRadius: 16, 
    maxWidth: '85%'
  },
  userBubble: { 
    backgroundColor: '#B7E4C7', 
    borderBottomRightRadius: 2,
  },
  aiBubble: { 
    backgroundColor: '#F0FFF4', 
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#D8F3DC'
  },
  chatText: { fontSize: 14, lineHeight: 20 },
  userText: { color: '#1B4332', fontWeight: '500' },
  aiText: { color: '#2D6A4F' },
  actionCard: { 
    marginTop: 8, 
    width: 220,
  },
  mapBtn: { 
    flexDirection: 'row', 
    backgroundColor: '#FFFFFF', 
    paddingVertical: 12, 
    borderRadius: 10, 
    alignItems: 'center', 
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#74C69D' 
  },
  mapBtnText: { color: '#2D6A4F', marginLeft: 8, fontWeight: '700', fontSize: 13 },
  footer: { padding: 15, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#B7E4C7' },
  inputBox: { 
    flexDirection: 'row', 
    backgroundColor: '#F0FFF4', 
    borderRadius: 12, 
    paddingHorizontal: 15, 
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: '#D8F3DC'
  },
  input: { flex: 1, fontSize: 14, color: '#1B4332' },
});