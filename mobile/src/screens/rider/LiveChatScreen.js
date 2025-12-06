import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/Header';
import { useAuth } from '../../contexts/AuthContext';
import { useChat } from '../../contexts/ChatContext';

const LiveChatScreen = ({ navigation }) => {
  const { user, userType } = useAuth();
  const insets = useSafeAreaInsets();
  const { currentChat, messages, startChat, sendMessage, endChat } = useChat();
  const [inputText, setInputText] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    // Initialize chat when screen loads
    if (!currentChat && user?.id) {
      startChat(user.id, user.name, userType || 'rider').then((chat) => {
        setChatMessages(messages[chat.id] || []);
      });
    } else if (currentChat) {
      setChatMessages(messages[currentChat.id] || []);
    }
  }, [currentChat, user, userType, startChat, messages]);

  useEffect(() => {
    // Update messages when they change
    if (currentChat) {
      setChatMessages(messages[currentChat.id] || []);
    }
  }, [messages, currentChat]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [chatMessages]);

  const handleSend = async () => {
    if (!inputText.trim() || !currentChat) return;

    const text = inputText.trim();
    setInputText('');

    // Send user message
    await sendMessage(currentChat.id, text, 'user');
    
    // In a real app, this would be sent via WebSocket/API to the backend
    // The backend would then forward to the assigned agent
    // For now, we'll simulate agent response after a delay
    setTimeout(async () => {
      // This would come from the backend/agent in production
      const agentResponse = 'Thank you for your message. Our support agent will respond shortly.';
      await sendMessage(currentChat.id, agentResponse, 'agent');
    }, 2000);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Header title="Live Chat Support" onBackPress={() => navigation.goBack()} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.chatContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {chatMessages.map((message) => (
            <View
              key={message.id}
              style={[
                styles.messageWrapper,
                message.sender === 'user' ? styles.userMessageWrapper : styles.supportMessageWrapper,
              ]}
            >
              {message.sender === 'support' && (
                <View style={styles.supportAvatar}>
                  <Ionicons name="headset" size={20} color="#fff" />
                </View>
              )}
              <View
                style={[
                  styles.messageBubble,
                  message.sender === 'user' ? styles.userMessage : styles.supportMessage,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.sender === 'user' ? styles.userMessageText : styles.supportMessageText,
                  ]}
                >
                  {message.text}
                </Text>
                <Text style={styles.timestamp}>{formatTime(message.timestamp)}</Text>
              </View>
              {message.sender === 'user' && (
                <View style={styles.userAvatar}>
                  <Ionicons name="person" size={20} color="#fff" />
                </View>
              )}
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              placeholderTextColor="#999"
            />
            <TouchableOpacity
              style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!inputText.trim()}
              activeOpacity={0.7}
            >
              <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <View style={[styles.statusBar, Platform.OS === 'ios' && { paddingBottom: Math.max(insets.bottom, 8) }]}>
            <View style={styles.statusIndicator}>
              <View style={styles.statusDot} />
            </View>
            <Text style={styles.statusText}>
              {currentChat?.status === 'waiting'
                ? 'Waiting for agent...'
                : currentChat?.status === 'connected'
                ? `Support agent online`
                : 'Support agent online'}
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messagesContent: {
    paddingBottom: 16,
  },
  inputWrapper: {
    backgroundColor: '#fff',
    ...(Platform.OS === 'ios' && {
      marginBottom: 0,
    }),
  },
  messageWrapper: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  supportMessageWrapper: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  userMessage: {
    backgroundColor: '#667eea',
    borderBottomRightRadius: 4,
  },
  supportMessage: {
    backgroundColor: '#fff',
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 4,
  },
  userMessageText: {
    color: '#fff',
  },
  supportMessageText: {
    color: '#000',
  },
  timestamp: {
    fontSize: 11,
    opacity: 0.7,
    marginTop: 4,
  },
  supportAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 100,
    fontSize: 15,
    color: '#000',
    marginRight: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#ccc',
  },
  statusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: Platform.OS === 'ios' ? 0 : 8,
    backgroundColor: '#f0fdf4',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ade80',
    marginRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ade80',
    opacity: 0.6,
  },
  statusText: {
    fontSize: 12,
    color: '#4ade80',
    fontWeight: '600',
  },
});

export default LiveChatScreen;

