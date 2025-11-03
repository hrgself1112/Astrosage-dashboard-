import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { collection, doc, getDocs, setDoc, updateDoc, deleteDoc } from '@firebase/firestore';
import { type { User } from '@/types';

const UserSchema = z.object({
  email: z.string().email('Invalid email address'),
  displayName: z.string().optional(),
  role: z.enum(['admin', 'edgeitor', 'viewer']),
  status: z.enum(['active', 'inactive', 'suspended']),
  permissions: z.object({
    canManageUsers: z.boolean(),
    canManageDocuments: z.boolean(),
    canManagePanelists: z.boolean(),
    canViewAuditLogs: z.boolean(),
    canManageSystem: z.boolean(),
  }).optional(),
});

const UpdateUserSchema = UserSchema.partial();

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user || !session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const usersRef = collection(db, 'users');
    const snapshot = await getDocs(usersRef);
    const users = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.toISOString(),
      lastActiveAt: doc.data().lastActiveAt?.toDate()?.toISOString(),
    })) as User[];

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user || !session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = UserSchema.parse(body);

    // Check if user with this email already exists
    const usersRef = collection(db, 'users');
    const existingUserSnapshot = await getDocs(
      query(usersRef, where('email', '==', validatedData.email))
    );

    if (!existingUserSnapshot.empty) {
      const newUser = {
        ...validatedData,
        createdAt: new Date(),
        lastActiveAt: new Date(),
        createdBy: session.user.id,
        permissions: getDefaultPermissions(validatedData.role),
      };

      const userDoc = doc(usersRef, newUser.id);
      await setDoc(userDoc);
      await setDoc(doc(db, 'users', newUser.id, {
        ...newUser,
        createdAt: serverTimestamp(),
        lastActiveAt: serverTimestamp(),
      }, { merge: true });

      return NextResponse.json(
        { success: true, data: { id: newUser.id } },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }
  } catch (error: any) {
    console.error('Error creating user:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user || !session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = request.query;
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = UpdateUserSchema.parse(body);

    const userRef = doc(db, 'users', id as string);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedUser = {
      ...userDoc.data(),
      ...validatedData,
      lastActiveAt: new Date(),
    };

    await updateDoc(userRef, updatedUser, { merge: true });

    return NextResponse.json({
      success: true,
      data: updatedUser,
    });
  } catch (error: any) {
    console.error('Error updating user:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user || !session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = request.query;
    if (!id) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const userRef = doc(db, 'users', id as string);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await deleteDoc(userRef);

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}

function getDefaultPermissions(role: string): User['permissions'] {
  switch (role) {
    case 'admin':
      return {
        canManageUsers: true,
        canManageDocuments: true,
        canManagePanelists: true,
        canViewAuditLogs: true,
        canManageSystem: true,
      };
    case 'editor':
      return {
        canManageUsers: false,
        canManageDocuments: true,
        canManagePanelists: true,
        canViewAuditLogs: false,
        canManageSystem: false,
      };
    case 'viewer':
      return {
        canManageUsers: false,
        canManageDocuments: false,
        canManagePanelists: false,
        canViewAuditLogs: false,
        canManageSystem: false,
      };
    default:
      return {
        canManageUsers: false,
        canManageDocuments: false,
        canManagePanelists: false,
        canViewAuditLogs: false,
        canManageSystem: false,
      };
  }
}