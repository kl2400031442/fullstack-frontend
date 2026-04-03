/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import { apiRequest } from '../services/apiClient';

const AuthContext = createContext(null);
const TOKEN_KEY = 'peercollab_token';

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'PC';
}

function normalizeUser(user, fallback = {}) {
  const name = user?.name || fallback.name || 'User';
  const role = user?.role || fallback.role || 'student';

  return {
    id: user?.id || fallback.id || Date.now(),
    name,
    identifier: user?.identifier || fallback.identifier || user?.email || '',
    role,
    avatar: user?.avatar || getInitials(name),
    department: user?.department || 'Computer Science',
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [mfaPending, setMfaPending] = useState(false);
  const [mfaCode, setMfaCode] = useState('');
  const [mfaToken, setMfaToken] = useState('');

  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');

  const loginStudent = async ({ name, studentId, password }) => {
    const response = await apiRequest('/auth/login/student', {
      method: 'POST',
      body: { name, studentId, password },
    });

    const nextUser = normalizeUser(response?.user, {
      name: name || `Student ${studentId}`,
      identifier: name || studentId,
      role: 'student',
    });

    setUser(nextUser);
    setMfaPending(false);

    if (response?.token) {
      localStorage.setItem(TOKEN_KEY, response.token);
      setToken(response.token);
    }

    return { success: true, role: 'student' };
  };

  const loginTeacher = async ({ teacherCode, password }) => {
    const response = await apiRequest('/auth/login/teacher', {
      method: 'POST',
      body: { teacherCode, password },
    });

    const pendingCode = response?.mfaCode || '';
    const pendingToken = response?.mfaToken || '';

    setMfaCode(pendingCode);
    setMfaToken(pendingToken);
    setMfaPending(true);

    setUser(
      normalizeUser(response?.user, {
        name: `Teacher ${teacherCode}`,
        identifier: teacherCode,
        role: 'teacher',
      }),
    );

    if (pendingCode) {
      // Helpful in local/dev environments.
      console.log(`%c[MFA CODE]: ${pendingCode}`, 'color: #6366f1; font-weight: bold; font-size: 16px;');
    }

    return { success: true, mfaRequired: true };
  };

  const verifyMfa = async (enteredCode) => {
    const response = await apiRequest('/auth/verify-mfa', {
      method: 'POST',
      body: { code: enteredCode, mfaToken },
    });

    setMfaPending(false);
    setMfaCode('');
    setMfaToken('');
    setUser((prev) => normalizeUser(response?.user, prev));

    if (response?.token) {
      localStorage.setItem(TOKEN_KEY, response.token);
      setToken(response.token);
    }

    return { success: true };
  };

  const signup = async ({ name, email, password, role }) => {
    const response = await apiRequest('/auth/signup', {
      method: 'POST',
      body: { name, email, password, role },
    });

    const nextUser = normalizeUser(response?.user, { name, identifier: email, role });
    setUser(nextUser);

    if (response?.token) {
      localStorage.setItem(TOKEN_KEY, response.token);
      setToken(response.token);
    }

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setMfaPending(false);
    setMfaCode('');
    setMfaToken('');
    localStorage.removeItem(TOKEN_KEY);
    setToken('');
  };

  const isAuthenticated = !!user && !mfaPending;
  const isTeacher = user?.role === 'teacher' && !mfaPending;
  const isStudent = user?.role === 'student';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loginStudent,
        loginTeacher,
        verifyMfa,
        signup,
        logout,
        isAuthenticated,
        isTeacher,
        isStudent,
        mfaPending,
        mfaCode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
