import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp
} from '@firebase/firestore';
import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut as firebaseSignOut,
  updateProfile,
  type User as FirebaseUser
} from '@firebase/auth';
import { auth, db } from '../firebase';
import type { User, UserRole, UserStatus, AuditLog, RolePermissions } from '../types';

export class AdminService {
  // User Management
  static async getUsers(limitCount: number = 100): Promise<User[]> {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('lastActiveAt', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as User));
  }

  static async getUserById(userId: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.exists() ? { ...userDoc.data(), id: userDoc.id } as User : null;
  }

  static async createUser(userData: Partial<User>, createdBy: string): Promise<User> {
    const now = new Date().toISOString();
    const newUser: User = {
      id: `temp_${Date.now()}`, // This would normally be the Firebase Auth UID
      email: userData.email!,
      displayName: userData.displayName,
      role: userData.role || 'viewer',
      status: userData.status || 'active',
      createdAt: now,
      lastActiveAt: now,
      createdBy,
      permissions: userData.permissions || this.getDefaultPermissions(userData.role || 'viewer')
    };

    const userRef = doc(db, 'users', newUser.id);
    await setDoc(userRef, {
      ...newUser,
      createdAt: serverTimestamp(),
      lastActiveAt: serverTimestamp()
    });

    // Log the user creation
    await this.createAuditLog({
      userId: createdBy,
      action: 'user_created',
      resource: newUser.id,
      details: {
        email: newUser.email,
        role: newUser.role,
        displayName: newUser.displayName
      }
    });

    return newUser;
  }

  static async updateUser(userId: string, updates: Partial<User>, updatedBy: string): Promise<User> {
    const userRef = doc(db, 'users', userId);

    // Get current user data for audit
    const currentUser = await this.getUserById(userId);
    if (!currentUser) {
      throw new Error('User not found');
    }

    const updatedUser: User = {
      ...currentUser,
      ...updates,
      lastActiveAt: new Date().toISOString()
    };

    await updateDoc(userRef, {
      ...updates,
      lastActiveAt: serverTimestamp()
    });

    // Log the user update
    await this.createAuditLog({
      userId: updatedBy,
      action: 'user_updated',
      resource: userId,
      details: {
        changes: this.getUserChanges(currentUser, updatedUser)
      }
    });

    return updatedUser;
  }

  static async deleteUser(userId: string, deletedBy: string): Promise<void> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await deleteDoc(doc(db, 'users', userId));

    // Log the user deletion
    await this.createAuditLog({
      userId: deletedBy,
      action: 'user_deleted',
      resource: userId,
      details: {
        deletedUser: {
          email: user.email,
          role: user.role,
          displayName: user.displayName
        }
      }
    });
  }

  static async getUserRole(userId: string): Promise<UserRole | null> {
    const user = await this.getUserById(userId);
    return user?.role || null;
  }

  static async updateUserRole(userId: string, newRole: UserRole, updatedBy: string): Promise<User> {
    const user = await this.getUserById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const oldRole = user.role;
    const updatedUser = await this.updateUser(userId, {
      role: newRole,
      permissions: this.getDefaultPermissions(newRole)
    }, updatedBy);

    // Log the role change
    await this.createAuditLog({
      userId: updatedBy,
      action: 'role_changed',
      resource: userId,
      details: {
        oldRole,
        newRole,
        targetUser: user.email
      }
    });

    return updatedUser;
  }

  // Role Management
  static getDefaultPermissions(role: UserRole): RolePermissions {
    switch (role) {
      case 'admin':
        return {
          canManageUsers: true,
          canManageDocuments: true,
          canManagePanelists: true,
          canViewAuditLogs: true,
          canManageSystem: true
        };
      case 'editor':
        return {
          canManageUsers: false,
          canManageDocuments: true,
          canManagePanelists: true,
          canViewAuditLogs: false,
          canManageSystem: false
        };
      case 'viewer':
        return {
          canManageUsers: false,
          canManageDocuments: false,
          canManagePanelists: false,
          canViewAuditLogs: false,
          canManageSystem: false
        };
      default:
        return {
          canManageUsers: false,
          canManageDocuments: false,
          canManagePanelists: false,
          canViewAuditLogs: false,
          canManageSystem: false
        };
    }
  }

  // Audit Logging
  static async createAuditLog(logData: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
    const auditLog: Omit<AuditLog, 'id'> = {
      ...logData,
      timestamp: serverTimestamp() as any,
      ipAddress: this.getClientIP(),
      userAgent: navigator.userAgent
    };

    await addDoc(collection(db, 'auditLogs'), auditLog);
  }

  static async getAuditLogs(limitCount: number = 100): Promise<AuditLog[]> {
    const logsRef = collection(db, 'auditLogs');
    const q = query(logsRef, orderBy('timestamp', 'desc'), limit(limitCount));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      timestamp: (doc.data().timestamp as Timestamp)?.toDate()?.toISOString() || new Date().toISOString()
    } as AuditLog));
  }

  static async getAuditLogsByUser(userId: string, limitCount: number = 50): Promise<AuditLog[]> {
    const logsRef = collection(db, 'auditLogs');
    const q = query(
      logsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id,
      timestamp: (doc.data().timestamp as Timestamp)?.toDate()?.toISOString() || new Date().toISOString()
    } as AuditLog));
  }

  // Authentication helpers
  static async inviteUser(email: string, role: UserRole, invitedBy: string): Promise<void> {
    try {
      // Create user in Firebase Auth with temporary password
      const tempPassword = this.generateTemporaryPassword();
      const userCredential = await createUserWithEmailAndPassword(auth, email, tempPassword);

      // Create user profile in Firestore
      await this.createUser({
        id: userCredential.user.uid,
        email,
        role,
        status: 'active'
      }, invitedBy);

      // Send password reset email so user can set their own password
      await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
      console.error('Error inviting user:', error);
      throw new Error(`Failed to invite user: ${error.message}`);
    }
  }

  static async resetUserPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email);

      // Log the password reset
      await this.createAuditLog({
        userId: auth.currentUser?.uid || 'unknown',
        action: 'password_reset_requested',
        resource: email,
        details: { email }
      });
    } catch (error: any) {
      console.error('Error resetting password:', error);
      throw new Error(`Failed to reset password: ${error.message}`);
    }
  }

  // Utility methods
  private static generateTemporaryPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  private static getClientIP(): string {
    // In a real implementation, you would get this from the request context
    // For now, return a placeholder
    return 'client_ip';
  }

  private static getUserChanges(oldUser: User, newUser: User): Record<string, { from: any; to: any }> {
    const changes: Record<string, { from: any; to: any }> = {};

    if (oldUser.displayName !== newUser.displayName) {
      changes.displayName = { from: oldUser.displayName, to: newUser.displayName };
    }
    if (oldUser.role !== newUser.role) {
      changes.role = { from: oldUser.role, to: newUser.role };
    }
    if (oldUser.status !== newUser.status) {
      changes.status = { from: oldUser.status, to: newUser.status };
    }

    return changes;
  }

  // Statistics and analytics
  static async getUserStatistics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    suspendedUsers: number;
    roleDistribution: Record<UserRole, number>;
  }> {
    const users = await this.getUsers(1000); // Get all users for stats

    const stats = {
      totalUsers: users.length,
      activeUsers: users.filter(u => u.status === 'active').length,
      inactiveUsers: users.filter(u => u.status === 'inactive').length,
      suspendedUsers: users.filter(u => u.status === 'suspended').length,
      roleDistribution: {
        admin: users.filter(u => u.role === 'admin').length,
        editor: users.filter(u => u.role === 'editor').length,
        viewer: users.filter(u => u.role === 'viewer').length
      }
    };

    return stats;
  }

  static async getAuditStatistics(days: number = 30): Promise<{
    totalLogs: number;
    actionCounts: Record<string, number>;
    userActivityCounts: Record<string, number>;
  }> {
    const logs = await this.getAuditLogs(1000); // Get recent logs
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentLogs = logs.filter(log =>
      new Date(log.timestamp) >= cutoffDate
    );

    const actionCounts: Record<string, number> = {};
    const userActivityCounts: Record<string, number> = {};

    recentLogs.forEach(log => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
      userActivityCounts[log.userId] = (userActivityCounts[log.userId] || 0) + 1;
    });

    return {
      totalLogs: recentLogs.length,
      actionCounts,
      userActivityCounts
    };
  }
}

export default AdminService;