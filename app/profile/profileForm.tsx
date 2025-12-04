// components/profileForm.tsx
"use client";

import { useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Edit, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { update } from "next-auth/react"; // 加這行：用來更新 session cookie

const formSchema = z.object({
  name: z.string().min(2, "姓名至少 2 個字元").max(50, "姓名最多 50 個字元"),
  bio: z.string().max(500, "簡介最多 500 個字元").optional(),
  image: z.string().url("請輸入有效圖片 URL").optional(),
});

type FormData = z.infer<typeof formSchema>;

interface ProfileFormProps {
  initialUser: {
    name: string;
    bio?: string;
    image?: string;
  };
}

export default function ProfileForm({ initialUser }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialUser,
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      // 更新 API
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        toast({
          title: "更新失敗",
          description: error.message || "請重試",
          variant: "destructive",
        });
        return;
      }

      // 更新 session cookie (刷新 JWT token)
      await update({ name: data.name, bio: data.bio, image: data.image }); // NextAuth update 函式

      toast({
        title: "更新成功",
        description: "資料已儲存，並同步到您的 session",
      });
      setIsEditing(false);
      // 可選：revalidatePath('/profile') 重新渲染頁面 (Server Action 方式)
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>姓名</FormLabel>
              <FormControl>
                <Input
                  placeholder="輸入姓名"
                  {...field}
                  disabled={!isEditing}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>簡介</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="告訴大家關於您的事..."
                  className="min-h-[100px]"
                  {...field}
                  disabled={!isEditing}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>頭像 (URL)</FormLabel>
              <FormControl>
                <Input
                  placeholder="https://example.com/avatar.jpg"
                  {...field}
                  disabled={!isEditing}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-2">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                取消
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                儲存變更
              </Button>
            </>
          ) : (
            <Button type="button" onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              編輯資料
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
