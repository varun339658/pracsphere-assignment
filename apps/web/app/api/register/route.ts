  // File: apps/web/app/api/register/route.ts
  import { NextResponse } from "next/server";
  import bcrypt from "bcrypt";
  import clientPromise from "../../../lib/mongodb";

  export async function POST(request: Request) {
    try {
      const { name, email, password } = await request.json();

      // All fields are required
      if (!name || !email || !password) {
        return new NextResponse("Missing fields", { status: 400 });
      }

      const hashedPassword = await bcrypt.hash(password, 10); // Hash the password

      const client = await clientPromise;
      const db = client.db("pracsphere");
      const usersCollection = db.collection("users");

      // Check if user already exists
      const existingUser = await usersCollection.findOne({ email });
      if (existingUser) {
        return new NextResponse("User already exists", { status: 409 });
      }

      // Create the new user
      await usersCollection.insertOne({
        name,
        email,
        password: hashedPassword,
        createdAt: new Date(),
      });

      return NextResponse.json({ message: "User created successfully" }, { status: 201 });
    } catch (error) {
      console.error("REGISTRATION_ERROR", error);
      return new NextResponse("Internal Server Error", { status: 500 });
    }
  }