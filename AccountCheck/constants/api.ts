
import Constants from 'expo-constants';

const getApiUrl = () => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  const host = debuggerHost?.split(':')[0];
  
  if (host) {
    return `http://${host}:8000`;
  }
  return 'http://localhost:8000';
};

export const API_BASE = getApiUrl();