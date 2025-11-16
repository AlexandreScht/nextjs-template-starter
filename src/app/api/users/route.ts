import { NextResponse } from "next/server";
import { usersStore, wait } from "./data";

export async function GET() {
    await wait();
    return NextResponse.json(usersStore.list, { status: 200 });
}

export async function POST(request: Request) {
    await wait();
    const payload = await request.json();

    const newUser = {
        id: usersStore.nextId++,
        name: payload.name ?? `User ${usersStore.nextId}`,
        email: payload.email ?? `user${usersStore.nextId}@example.com`,
    };

    usersStore.list.push(newUser);

    return NextResponse.json(newUser, { status: 201 });
}
