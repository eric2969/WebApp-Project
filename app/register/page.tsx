// app/register/page.tsx (Next.js App Router, NextAuth v4 相容)
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
const formSchema = z
  .object({
    name: z.string().min(2, "姓名至少 2 個字元").max(50, "姓名最多 50 個字元"),
    email: z.email("請輸入有效 Email"),
    password: z.string().min(6, "密碼至少 6 個字元"),
    confirmPassword: z.string().min(6, "確認密碼至少 6 個字元"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "密碼不匹配",
    path: ["confirmPassword"],
  });

// 表單類型
type FormData = z.infer<typeof formSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      // 呼叫自訂註冊 API (建立使用者)
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password, // 後端會 bcrypt hash
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "註冊失敗",
          description: error.message || "請重試",
          variant: "destructive",
        });
        return;
      }

      // 註冊成功後自動登入
      // const signInResult = await signIn("credentials", {
      //   email: data.email,
      //   password: data.password,
      //   redirect: false, // 不自動重定向
      // });

      // if (signInResult?.error) {
      //   toast({
      //     title: "登入失敗",
      //     description: signInResult.error,
      //     variant: "destructive",
      //   });
      //   return;
      // }

      toast({
        title: "註冊成功",
        description: "歡迎加入！",
      });
      router.push("/login"); // 跳轉到 dashboard
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
          <CardTitle className="text-2xl text-center">註冊帳戶</CardTitle>
          <CardDescription className="text-center">
            建立您的價差投資帳戶，開始模擬交易之旅
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* 姓名 */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>姓名</FormLabel>
                    <FormControl>
                      <Input placeholder="輸入您的姓名" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
                        placeholder="至少 6 個字元"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* 確認密碼 */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>確認密碼</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="重複輸入密碼"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-red-500 hover:bg-red-600 text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    註冊中...
                  </>
                ) : (
                  "註冊"
                )}
              </Button>
            </form>
          </Form>
          <div className="mt-6 text-center text-sm">
            <span className="text-gray-600">
              已有帳戶？{" "}
              <Link href="/login" className="text-red-500 hover:underline">
                登入
              </Link>
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
