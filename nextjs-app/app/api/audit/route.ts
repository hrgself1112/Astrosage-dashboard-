import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from '@/lib/auth';
import { db } from '@/lib/firebase';
import { collection, getDocs, query, orderBy, limit } from '@firebase/firestore';
import type { AuditLog } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user || !session.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      search = '',
      userId = '',
      action = '',
      startDate = '',
      endDate = '',
    } = request.query;

    const logsRef = collection(db, 'auditLogs');
    let queryBuilder = query(
      logsRef,
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    // Apply filters
    if (userId) {
      queryBuilder = query(queryBuilder, where('userId', '==', userId));
    }
    if (action) {
      queryBuilder = query(queryBuilder, where('action', '==', action));
    }
    if (startDate && endDate) {
      const startDateObj = new Date(startDate as string);
      const endDateObj = new Date(endDate as string);
      endDateObj.setHours(23, 59, 59, 999);
      queryBuilder = query(
        queryBuilder,
        where('timestamp', '>=', startDateObj),
        where('timestamp', '<=', endDateObj)
      );
    }

    const snapshot = await getDocs(queryBuilder);
    const logs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      timestamp: doc.data().timestamp?.toDate?.toISOString(),
    })) as AuditLog[];

    return NextResponse.json({ success: true, data: logs });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
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
    const { userId, action, resource, details } = body;

    // Create audit log entry
    const auditLog: Omit<AuditLog, 'id'> = {
      userId: userId || session.user.id,
      action: action || 'manual_action',
      resource: resource || 'unknown',
      details: details || {},
      ipAddress: request.ip || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      timestamp: new Date().toISOString(),
    };

    const logsRef = collection(db, 'auditLogs');
    const docRef = await addDoc(logsRef, {
      ...auditLog,
      timestamp: serverTimestamp(),
    });

    return NextResponse.json({
      success: true,
      data: { id: docRef.id },
      message: 'Audit log created successfully',
    });
  } catch (error) {
    console.error('Error creating audit log:', error);
    return NextResponse.json(
      { error: 'Failed to create audit log' },
      { status: 500 }
    );
  }
}