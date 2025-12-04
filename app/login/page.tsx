// app/login/page.tsx (Next.js App Router, NextAuth v4 相容)
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { toast } from "@/hooks/use-toast"; // Shadcn/ui toast
import { Loader2 } from "lucide-react";
import { signIn } from "next-auth/react"; // v4 登入

// 表單驗證 schema (zod)
const formSchema = z.object({
  email: z.email("請輸入有效 Email"),
  password: z.string().min(6, "密碼至少 6 個字元"),
});

// 表單類型
type FormData = z.infer<typeof formSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      // 呼叫 NextAuth 登入
      const signInResult = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false, // 不自動重定向
      });

      if (signInResult?.error) {
        toast({
          title: "登入失敗",
          description: signInResult.error || "請檢查 Email 和密碼",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "登入成功",
        description: "歡迎回來！",
      });
      router.push("/dashboard"); // 跳轉到 dashboard
    } catch (error) {
      toast({
        title: "錯誤",
        description: "網路問題，請重試",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">登入帳戶</CardTitle>
          <CardDescription className="text-center">
            進入您的價差投資面板
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="user@example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* 密碼 */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>密碼</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="輸入密碼"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    登入中...
                  </>
                ) : (
                  "登入"
                )}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">
              還沒有帳戶？{" "}
              <Link href="/register" className="text-red-500 hover:underline">
                立即註冊
              </Link>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
