import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    // Check if user is authenticated
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters' }, { status: 400 });
    }

    // Read the current auth route file
    const authRoutePath = path.join(process.cwd(), 'app/api/auth/[...nextauth]/route.ts');
    let authRouteContent = fs.readFileSync(authRoutePath, 'utf8');

    // Find the current user's password hash
    const userEmail = session.user.email;
    const userMatch = authRouteContent.match(new RegExp(`email: '${userEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}',[\\s\\S]*?password: '([^']+)'`));
    
    if (!userMatch) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentPasswordHash = userMatch[1];

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, currentPasswordHash);
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    // Generate new password hash
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Replace the password hash in the file
    const updatedContent = authRouteContent.replace(
      new RegExp(`(email: '${userEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}',[\\s\\S]*?password: ')${currentPasswordHash.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`),
      `$1${newPasswordHash}'`
    );

    // Write the updated content back to the file
    fs.writeFileSync(authRoutePath, updatedContent, 'utf8');

    return NextResponse.json({ 
      success: true, 
      message: 'Password updated successfully. Please restart the server for changes to take effect.' 
    });

  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}
