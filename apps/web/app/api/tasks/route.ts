// File: apps/web/app/api/tasks/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
// Assuming 'authOptions' is imported correctly for your setup
import { authOptions } from "../auth/[...nextauth]/route"; 
import clientPromise from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary with your credentials from .env.local
cloudinary.config({ 
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper function to upload an image file to Cloudinary
async function uploadImage(file: File) {
  const fileBuffer = await file.arrayBuffer();
  const mime = file.type;
  const encoding = 'base64';
  const base64Data = Buffer.from(fileBuffer).toString('base64');
  const fileUri = 'data:' + mime + ';' + encoding + ',' + base64Data;
  
  const result = await cloudinary.uploader.upload(fileUri, {
    folder: 'pracsphere-tasks' // Organizes uploads in a specific folder in Cloudinary
  });
  return result.secure_url; // Return the public URL of the uploaded image
}

// --- API Route Handlers ---

// POST: Create a new task (Handles Priority)
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const dueDate = formData.get('dueDate') as string;
    // 💡 NEW: Extract priority field
    const priority = formData.get('priority') as 'low' | 'medium' | 'high' || 'medium'; 
    const images = formData.getAll('images') as File[];

    if (!title || !description || !dueDate) {
      return new NextResponse("Missing required text fields (title, description, dueDate)", { status: 400 });
    }

    // Upload each valid image to Cloudinary and collect their URLs
    const imageUrls: string[] = [];
    for (const image of images) {
      if (image && image.size > 0) {
        const imageUrl = await uploadImage(image);
        imageUrls.push(imageUrl);
      }
    }

    const client = await clientPromise;
    const db = client.db("pracsphere");
    const result = await db.collection("tasks").insertOne({
      title,
      description,
      dueDate,
      images: imageUrls,
      status: "pending",
      priority, // 💡 NEW: Save priority to the database
      userEmail: session.user.email,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("TASK_CREATION_ERROR", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// PUT: Full update for an existing task (Handles Priority)
export async function PUT(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // The client sends the entire updated task object as JSON
    // 💡 UPDATED: Destructure priority from the request body
    const { _id, title, description, dueDate, status, priority } = await request.json(); 

    if (!_id || !title || !description || !dueDate || !status || !priority) {
        return new NextResponse("Missing required fields for update", { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("pracsphere");

    const result = await db.collection("tasks").updateOne(
        // Find the document by ID and ensure it belongs to the logged-in user
        { _id: new ObjectId(_id), userEmail: session.user.email },
        { 
            $set: { 
                title, 
                description, 
                dueDate, 
                status,
                priority, // 💡 NEW: Update the priority field
            } 
        }
    );

    if (result.matchedCount === 0) {
        // Task not found or user doesn't have permission
        return new NextResponse("Task not found or unauthorized to update", { status: 404 });
    }

    return NextResponse.json({ message: "Task updated successfully" }, { status: 200 });

  } catch (error) {
    console.error("TASK_UPDATE_ERROR (PUT)", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// GET: Fetch all tasks for the logged-in user (Unchanged)
export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const client = await clientPromise;
  const db = client.db("pracsphere");
  // Sorting by dueDate: 1 (ascending/closest date first) is a good default
  const tasks = await db.collection("tasks").find({ userEmail: session.user.email }).sort({ dueDate: 1 }).toArray();

  return NextResponse.json(tasks);
}

// PATCH: Update a task's status (Unchanged)
export async function PATCH(request: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id, status } = await request.json();
    if (!id || !status) {
        return new NextResponse("Missing task ID or status", { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("pracsphere");
    await db.collection("tasks").updateOne(
        { _id: new ObjectId(id), userEmail: session.user.email },
        { $set: { status } }
    );
    
    return NextResponse.json({ message: "Task updated" });
}

// DELETE: Delete a task (Unchanged)
export async function DELETE(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  
  const { id } = await request.json();
  if (!id) {
    return new NextResponse("Missing task ID", { status: 400 });
  }
  
  const client = await clientPromise;
  const db = client.db("pracsphere");
  await db.collection("tasks").deleteOne({ 
      _id: new ObjectId(id), 
      userEmail: session.user.email
  });

  return NextResponse.json({ message: "Task deleted" });
}