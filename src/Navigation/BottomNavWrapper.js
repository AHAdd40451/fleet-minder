import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
// screens
import DashboardScreen from '../screens/DashboardScreen';
import WalletScreen from '../screens/Wallet.js';
import ChatScreen from '../screens/ChatScreen.js';
import ProfileScreen from '../screens/ProfileScreen.js';

const Tab = createBottomTabNavigator();

// Custom central button component
const CentralButton = ({ onPress }) => (
  <TouchableOpacity
    onPress={onPress}
    style={styles.centralButton}
  >
    <Icon name="add" size={28} color="#FFFFFF" />
  </TouchableOpacity>
);

// Custom Tab Bar Component
const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          let iconName;
          if (route.name === 'Home') {
            iconName = 'home';
          } else if (route.name === 'Wallet') {
            iconName = 'wallet';
          } else if (route.name === 'Chat') {
            iconName = 'chatbubble';
          } else if (route.name === 'Profile') {
            iconName = 'person';
          }

          if (route.name === 'Add') {
            return (
              <View style={styles.centralButtonContainer1}>
              <View key={route.key} style={styles.centralButtonContainer}>
                <CentralButton onPress={() => {}} />
              </View>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={route.name === 'Wallet' || route.name === 'Chat' || route.name === 'Profile' ? () => {} : onPress}
              onLongPress={onLongPress}
              style={styles.tabItem}
            >
              <Icon 
                name={iconName} 
                size={24} 
                color={isFocused ? '#007AFF' : '#8E8E93'} 
              />
              <View style={[styles.labelContainer, isFocused && styles.activeLabelContainer]}>
                <Text style={[styles.label, isFocused && styles.activeLabel]}>
                  {label}
                </Text>
                {isFocused && <View style={styles.activeIndicator} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default function BottomNavWrapper() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Home',
        }}
      />
      <Tab.Screen
        name="Wallet"
        component={WalletScreen}
        options={{
          tabBarLabel: 'Wallet',
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
          },
        }}
      />
      <Tab.Screen
        name="Add"
        component={DashboardScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: () => <CentralButton onPress={() => {}} />,
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
          },
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarLabel: 'Chat',
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
          },
        }}
      />
    </Tab.Navigator>
  );
}

  const styles = StyleSheet.create({
    tabBarContainer: {
      position: 'absolute',
      bottom: 0,
      left: 15,
      right: 25,
      backgroundColor: 'transparent',
    },
    tabBar: {
      flexDirection: 'row',
      backgroundColor: '#1C1C1E',
      borderRadius: 30,
      height: 70,
      paddingHorizontal: 20,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 10,
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
    },
    centralButtonContainer: {
      width: 80,
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
    },
    centralButtonContainer1: {
      width: 80,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: -25,
    },
    centralButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      marginBottom:20,
      backgroundColor: '#2C2C2E',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    labelContainer: {
      display: 'none',
    },
    activeLabelContainer: {
      display: 'none',
    },
    label: {
      display: 'none',
    },
    activeLabel: {
      display: 'none',
    },
    activeIndicator: {
      display: 'none',
    },
  });
//   tabBarContainer: {
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: 'transparent',
//   },
//   tabBar: {
//     flexDirection: 'row',
//     backgroundColor: '#2C2C2E',
//     borderTopLeftRadius: 20,
//     borderTopRightRadius: 20,
//     height: 100,
//     paddingBottom: 25,
//     paddingTop: 15,
//     paddingHorizontal: 10,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: -2,
//     },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 5,
//   },
//   tabItem: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 5,
//   },
//   centralButtonContainer: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginTop: 45,
//   },
//   centralButtonContainer1:{
//     alignItems: 'center',
//     justifyContent: 'center',
//     width: 90,
//     height: 90,
//     borderRadius: 45,
//     backgroundColor: '#2C2C2E',
//     marginBottom: 20,
//     marginTop: -45,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 4,
//     },
//     shadowOpacity: 0.3,
//     shadowRadius: 8,
//     elevation: 8,
//   },
//   centralButton: {
//     width: 70,
//     height: 70,
//     borderRadius: 35,
//     backgroundColor: '#1C1C1E',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginBottom: 35,
//     marginTop: -10,
//     shadowColor: '#000',
//     shadowOffset: {
//       width: 0,
//       height: 6,
//     },
//     shadowOpacity: 0.4,
//     shadowRadius: 12,
//     elevation: 12,
//     borderWidth: 2,
//     borderColor: '#2C2C2E',
//   },
//   labelContainer: {
//     marginTop: 5,
//     alignItems: 'center',
//   },
//   activeLabelContainer: {
//     position: 'relative',
//   },
//   label: {
//     fontSize: 12,
//     color: '#8E8E93',
//     fontWeight: '500',
//   },
//   activeLabel: {
//     color: '#007AFF',
//   },
//   activeIndicator: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     backgroundColor: '#007AFF',
//     marginTop: 2,
//   },
// });