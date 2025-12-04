// app/about/page.tsx (Next.js App Router, NextAuth v4 相容)
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth"; // 您的 auth 配置
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"; // 加 import
import { Separator } from "@/components/ui/separator";
import { Users, Shield, TrendingUp, Award } from "lucide-react";

export default async function AboutPage() {
  const session = await getServerSession(authOptions); // 伺服器端檢查 session

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 英雄區塊 */}
        <section className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">關於我們</h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            我們是專注於價差合約投資模擬的平台，讓每位使用者都能安全學習真實市場策略。
          </p>
          {session ? (
            // 已登入：隱藏登入/註冊，只顯示返回
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                返回 Dashboard
              </Button>
            </Link>
          ) : (
            // 未登入：顯示註冊/登入
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  立即註冊
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  登入
                </Button>
              </Link>
            </div>
          )}
        </section>

        <Separator className="my-16" />

        {/* 我們的使命 */}
        <section className="mb-16">
          <Card className="bg-white shadow-lg">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center mb-4">
                <Shield className="h-8 w-8 text-blue-600 mr-2" />
                <CardTitle className="text-2xl">我們的使命</CardTitle>
              </div>
              <CardDescription className="text-lg">
                提供無風險的投資模擬環境，讓初學者從零開始掌握價差合約策略，實現財務自由。
              </CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-6 p-0">
              <div className="p-6 text-center">
                <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">專業工具</h3>
                <p>K 線圖、多時間框架分析，讓您如專業交易員。</p>
              </div>
              <div className="p-6 text-center">
                <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">社群支持</h3>
                <p>加入數千投資者，分享策略與經驗。</p>
              </div>
              <div className="p-6 text-center">
                <Award className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                <h3 className="font-semibold mb-2">安全模擬</h3>
                <p>虛擬資金，零風險練習真實市場。</p>
              </div>
            </CardContent>
          </Card>
        </section>

        <Separator className="my-16" />

        {/* 團隊介紹 */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
            我們的團隊
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="bg-white shadow-lg">
              <CardHeader className="text-center">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarImage src="/team-alice.jpg" />
                  <AvatarFallback>A</AvatarFallback>
                </Avatar>
                <CardTitle>Alice Lee</CardTitle>
                <CardDescription>創辦人 & CEO</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">
                  擁有 10 年金融經驗，專精期貨交易策略。
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-lg">
              <CardHeader className="text-center">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarImage src="/team-bob.jpg" />
                  <AvatarFallback>B</AvatarFallback>
                </Avatar>
                <CardTitle>Bob Chen</CardTitle>
                <CardDescription>技術長</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">
                  軟體工程師，專注於 K 線圖與資料視覺化。
                </p>
              </CardContent>
            </Card>
            <Card className="bg-white shadow-lg">
              <CardHeader className="text-center">
                <Avatar className="h-20 w-20 mx-auto mb-4">
                  <AvatarImage src="/team-carol.jpg" />
                  <AvatarFallback>C</AvatarFallback>
                </Avatar>
                <CardTitle>Carol Wang</CardTitle>
                <CardDescription>產品經理</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">
                  用戶體驗專家，設計直觀的投資介面。
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-16" />

        {/* 聯絡與 CTA */}
        <section className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">加入我們</h2>
          <p className="text-lg text-gray-600 mb-8">
            準備好開始您的投資之旅了嗎？我們隨時歡迎您的加入。
          </p>
          {session ? (
            // 已登入：隱藏登入/註冊，只顯示返回
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                返回 Dashboard
              </Button>
            </Link>
          ) : (
            // 未登入：顯示註冊/登入
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-red-500 hover:bg-red-600 text-white"
                >
                  註冊免費帳戶
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  登入
                </Button>
              </Link>
            </div>
          )}
          <p className="text-sm text-gray-500 mt-4">
            © 2025 價差投資 App. 所有權利保留。
          </p>
        </section>
      </div>
    </div>
  );
}
