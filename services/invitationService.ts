import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut
} from '@firebase/auth';
import { doc, setDoc, serverTimestamp } from '@firebase/firestore';
import { auth, db } from '../firebase';
import type { User, UserRole } from '../types';

export class InvitationService {
  static async inviteUser(
    email: string,
    role: UserRole,
    displayName?: string,
    invitedBy?: string
  ): Promise<{ success: boolean; message: string; userId?: string }> {
    try {
      // Generate a temporary password
      const temporaryPassword = this.generateSecurePassword();

      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, temporaryPassword);
      const user = userCredential.user;

      if (!user.email) {
        throw new Error('Failed to create user account');
      }

      // Create user profile in Firestore
      const newUser: User = {
        id: user.uid,
        email: user.email,
        displayName: displayName || undefined,
        role,
        status: 'active',
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        createdBy: invitedBy,
        permissions: this.getDefaultPermissions(role)
      };

      // Save user to Firestore
      await setDoc(doc(db, 'users', user.uid), {
        ...newUser,
        createdAt: serverTimestamp(),
        lastActiveAt: serverTimestamp()
      });

      // Send password reset email so user can set their own password
      await sendPasswordResetEmail(auth, email);

      // Sign out from the admin's session (we don't want to stay logged in as the new user)
      await signOut(auth);

      return {
        success: true,
        message: `Invitation sent successfully to ${email}. The user will receive an email to set their password.`,
        userId: user.uid
      };
    } catch (error: any) {
      console.error('Error inviting user:', error);

      let errorMessage = 'Failed to invite user';

      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'A user with this email already exists';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        message: errorMessage
      };
    }
  }

  static async bulkInviteUsers(
    invitations: Array<{
      email: string;
      role: UserRole;
      displayName?: string;
    }>,
    invitedBy?: string
  ): Promise<Array<{
    email: string;
    success: boolean;
    message: string;
    userId?: string;
  }>> {
    const results = [];

    for (const invitation of invitations) {
      const result = await this.inviteUser(
        invitation.email,
        invitation.role,
        invitation.displayName,
        invitedBy
      );

      results.push({
        email: invitation.email,
        ...result
      });

      // Add a small delay between invitations to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return results;
  }

  static async resendInvitation(email: string): Promise<{ success: boolean; message: string }> {
    try {
      await sendPasswordResetEmail(auth, email);
      return {
        success: true,
        message: `Password reset email sent to ${email}`
      };
    } catch (error: any) {
      console.error('Error resending invitation:', error);

      let errorMessage = 'Failed to resend invitation';
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email address';
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        success: false,
        message: errorMessage
      };
    }
  }

  static generateSecurePassword(): string {
    const length = 12;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';

    // Ensure at least one character from each category
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';

    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill the rest with random characters
    for (let i = password.length; i < length; i++) {
      password += charset[Math.floor(Math.random() * charset.length)];
    }

    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  static getDefaultPermissions(role: UserRole) {
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

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static async checkIfUserExists(email: string): Promise<boolean> {
    try {
      // In a real implementation, you would check Firebase Auth or Firestore
      // For now, we'll assume this method would be implemented
      return false;
    } catch (error) {
      console.error('Error checking if user exists:', error);
      return false;
    }
  }
}

export default InvitationService;