import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function getAuthUser() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }
  
  return { userId };
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { message: 'Unauthorized' },
    { status: 401 }
  );
}
