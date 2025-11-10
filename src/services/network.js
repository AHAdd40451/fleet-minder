import NetInfo from '@react-native-community/netinfo';

let isConnected = true;
let listeners = [];

// Initialize network state
NetInfo.fetch().then(state => {
  isConnected = state.isConnected;
});

// Listen for network state changes
const unsubscribe = NetInfo.addEventListener(state => {
  const wasConnected = isConnected;
  isConnected = state.isConnected;
  
  // Notify all listeners when connection is restored
  if (!wasConnected && isConnected) {
    listeners.forEach(listener => listener(true));
  } else if (wasConnected && !isConnected) {
    listeners.forEach(listener => listener(false));
  }
});

export const getNetworkState = async () => {
  const state = await NetInfo.fetch();
  isConnected = state.isConnected;
  return state.isConnected;
};

export const isOnline = () => isConnected;

export const addNetworkListener = (callback) => {
  listeners.push(callback);
  return () => {
    listeners = listeners.filter(l => l !== callback);
  };
};

export const removeNetworkListener = (callback) => {
  listeners = listeners.filter(l => l !== callback);
};

