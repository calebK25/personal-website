import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'public', 'pfp', 'clipart3102766.png');
    const data = fs.readFileSync(filePath);
    return new NextResponse(data, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Icon not found' }, { status: 404 });
  }
}


