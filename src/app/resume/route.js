import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET() {
  try {
    // Serve from public/resume.pdf
    const filePath = path.join(process.cwd(), 'public', 'resume.pdf');
    const data = fs.readFileSync(filePath);
    return new NextResponse(data, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="resume.pdf"',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
  }
}


