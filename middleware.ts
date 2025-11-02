// Temporarily no-op middleware to isolate server error
import { NextResponse } from 'next/server';

export function middleware() {
	return NextResponse.next();
}

export const config = { matcher: [] };
