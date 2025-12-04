// app/profile/page.tsx (Server Component 主頁面)
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";
import ProfileForm from "./profileForm";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface UserData {
  id: string;
  name: string;
  email: string;
  image?: string;
  bio?: string;
  balance: number;
  role: string;
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  // 從 DB 拉取最新使用者資料 (包含 bio 等)
  const user = await prisma.user.findUnique({
    where: { id: session.user.id as string },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      bio: true,
      balance: true,
      role: true,
    },
  });

  if (!user) {
    redirect("/login"); // 如果 DB 無使用者，重定向
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">個人資料</h1>
        <Card className="bg-white shadow-lg">
          <CardHeader className="space-y-4">
            <div className="flex flex-col items-center space-y-2">
              <Avatar className="h-32 w-32">
                <AvatarImage
                  src={user.image || "/default-avatar.png"}
                  alt={user.name}
                />
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h2 className="text-2xl font-semibold">{user.name}</h2>
                <p className="text-gray-500">{user.email}</p>
                <p className="text-sm text-gray-400">餘額: ${user.balance}</p>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {user.role}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ProfileForm initialUser={user} /> {/* 傳入 DB 資料 */}
          </CardContent>
        </Card>
        <div className="mt-6 space-y-4">
          <Link href="/dashboard">
            <Button variant="outline" className="w-full">
              返回 Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
