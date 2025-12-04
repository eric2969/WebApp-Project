// app/api/profile/route.ts (PATCH 更新)
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  try {
    const { name, bio, image } = await req.json();
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { name, bio, image },
    });
    return NextResponse.json({ message: "更新成功", user: updatedUser });
  } catch (error) {
    return NextResponse.json({ error: "更新失敗" }, { status: 500 });
  }
}
