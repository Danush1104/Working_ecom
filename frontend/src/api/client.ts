import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

export const apiClient = axios.create({
 headers: {
 'Content-Type': 'application/json',
 },
});

// Cache the token fetch promise to prevent parallel Cognito requests causing 400 Bad Request
let tokenFetchPromise: Promise<string | undefined> | null = null;

const getAuthToken = async () => {
 if (tokenFetchPromise) {
 return tokenFetchPromise;
 }
 
 tokenFetchPromise = (async () => {
 try {
 const session = await fetchAuthSession();
 return session.tokens?.idToken?.toString();
 } catch (error) {
 console.warn('No active session or failed to fetch token', error);
 return undefined;
 } finally {
 // Clear the promise so next time we fetch a fresh one
 tokenFetchPromise = null;
 }
 })();
 
 return tokenFetchPromise;
};

// Request interceptor to attach Cognito JWT token
apiClient.interceptors.request.use(
 async (config) => {
 const token = await getAuthToken();
 if (token) {
 config.headers.Authorization =`Bearer ${token}`;
 }
 return config;
 },
 (error) => {
 return Promise.reject(error);
 }
);
