// File: apps/web/app/api/user/profile-picture/route.ts
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import clientPromise from "../../../../lib/mongodb";
import { NextResponse } from "next/server";

// POST - Upload/Update profile picture
export async function POST(request: Request) {
  try {
    console.log('POST /api/user/profile-picture - Starting...');
    
    const session = await getServerSession(authOptions);
    console.log('Session:', session?.user?.email);
    
    if (!session?.user?.email) {
      console.log('Unauthorized: No session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { image } = body;
    
    if (!image) {
      console.log('No image provided');
      return NextResponse.json({ error: 'No image provided' }, { status: 400 });
    }

    // Validate base64 image
    if (!image.startsWith('data:image/')) {
      console.log('Invalid image format');
      return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
    }

    console.log('Connecting to MongoDB...');
    const client = await clientPromise;
    const db = client.db("pracsphere");
    
    console.log('Updating user profile for:', session.user.email);
    const result = await db.collection("users").updateOne(
      { email: session.user.email },
      { 
        $set: { 
          profileImage: image, 
          updatedAt: new Date() 
        } 
      },
      { upsert: true }
    );

    console.log('Update result:', result);

    if (result.acknowledged) {
      return NextResponse.json({ 
        success: true, 
        message: 'Profile picture updated successfully' 
      });
    } else {
      console.log('Failed to update: Not acknowledged');
      return NextResponse.json({ error: 'Failed to update profile picture' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating profile picture:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// DELETE - Remove profile picture
export async function DELETE() {
  try {
    console.log('DELETE /api/user/profile-picture - Starting...');
    
    const session = await getServerSession(authOptions);
    console.log('Session:', session?.user?.email);
    
    if (!session?.user?.email) {
      console.log('Unauthorized: No session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Connecting to MongoDB...');
    const client = await clientPromise;
    const db = client.db("pracsphere");
    
    console.log('Removing profile picture for:', session.user.email);
    const result = await db.collection("users").updateOne(
      { email: session.user.email },
      { 
        $unset: { profileImage: "" }, 
        $set: { updatedAt: new Date() } 
      }
    );

    console.log('Delete result:', result);

    if (result.acknowledged) {
      return NextResponse.json({ 
        success: true, 
        message: 'Profile picture removed successfully' 
      });
    } else {
      console.log('Failed to remove: Not acknowledged');
      return NextResponse.json({ error: 'Failed to remove profile picture' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error removing profile picture:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

// GET - Fetch profile picture
export async function GET() {
  try {
    console.log('GET /api/user/profile-picture - Starting...');
    
    const session = await getServerSession(authOptions);
    console.log('Session:', session?.user?.email);
    
    if (!session?.user?.email) {
      console.log('Unauthorized: No session');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Connecting to MongoDB...');
    const client = await clientPromise;
    const db = client.db("pracsphere");
    
    console.log('Fetching profile picture for:', session.user.email);
    const user = await db.collection("users").findOne(
      { email: session.user.email },
      { projection: { profileImage: 1 } }
    );

    console.log('User found:', !!user, 'Has image:', !!user?.profileImage);

    return NextResponse.json({ 
      profileImage: user?.profileImage || null 
    });
  } catch (error) {
    console.error('Error fetching profile picture:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}