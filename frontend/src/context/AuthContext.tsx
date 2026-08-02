import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { 
 signIn, 
 signUp, 
 signOut, 
 getCurrentUser, 
 fetchAuthSession,
 confirmSignUp,
 type SignInInput, 
 type SignUpInput,
 type ConfirmSignUpInput
} from 'aws-amplify/auth';

interface User {
 username: string;
 userId: string;
 email?: string;
 displayName: string;
 isAdmin: boolean;
}

interface AuthContextType {
 user: User | null;
 isAuthenticated: boolean;
 isLoading: boolean;
 login: (input: SignInInput) => Promise<void>;
 register: (input: SignUpInput) => Promise<void>;
 confirmEmail: (input: ConfirmSignUpInput) => Promise<void>;
 logout: () => Promise<void>;
 checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
 const [user, setUser] = useState<User | null>(null);
 const [isLoading, setIsLoading] = useState(true);

 const checkAuth = async () => {
 try {
 const currentUser = await getCurrentUser();
 const session = await fetchAuthSession();
 
 const tokens = session.tokens;
 if (!tokens) throw new Error("No tokens");

 // Check roles via groups or custom attribute in both idToken and accessToken
 const idTokenPayload = tokens.idToken?.payload as any || {};
 const accessTokenPayload = tokens.accessToken?.payload as any || {};
 
 const idGroups = idTokenPayload['cognito:groups'] || [];
 const accessGroups = accessTokenPayload['cognito:groups'] || [];
 const groups = [...(Array.isArray(idGroups) ? idGroups : []), ...(Array.isArray(accessGroups) ? accessGroups : [])];
 
 const customRole = idTokenPayload['custom:role'] || accessTokenPayload['custom:role'];
 
 const isAdmin = 
 groups.some(g => typeof g === 'string'&& g.toLowerCase() === 'admin') || 
 (typeof customRole === 'string'&& customRole.toLowerCase() === 'admin');

 const email = idTokenPayload?.email as string;
  let displayName = idTokenPayload.name || idTokenPayload.display_name;
  if (!displayName && email) {
    displayName = email.split('@')[0]
      .replace(/[._-]/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  } else if (!displayName) {
    displayName = currentUser.username;
  }

 setUser({
 username: currentUser.username,
 userId: currentUser.userId,
 email,
 displayName,
 isAdmin
 });
 } catch (error) {
 setUser(null);
 } finally {
 setIsLoading(false);
 }
 };

 useEffect(() => {
 checkAuth();
 }, []);

 const login = async (input: SignInInput) => {
 await signIn(input);
 await checkAuth();
 };

 const register = async (input: SignUpInput) => {
 await signUp(input);
 };

 const confirmEmail = async (input: ConfirmSignUpInput) => {
 await confirmSignUp(input);
 };

 const logout = async () => {
 await signOut();
 setUser(null);
 };

 return (
 <AuthContext.Provider value={{
 user,
 isAuthenticated: !!user,
 isLoading,
 login,
 register,
 confirmEmail,
 logout,
 checkAuth
 }}>
 {children}
 </AuthContext.Provider>
 );
}

export function useAuth() {
 const context = useContext(AuthContext);
 if (context === undefined) {
 throw new Error('useAuth must be used within an AuthProvider');
 }
 return context;
}
