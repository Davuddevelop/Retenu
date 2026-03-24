"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserCircle2 } from "lucide-react"

export default function SplitLoginCard() {
    return (
        <div className="flex flex-col md:flex-row w-full max-w-4xl mx-auto shadow-lg rounded-lg overflow-hidden bg-white border dark:bg-gray-800">

            {/* Left Side: Welcome + Illustration */}
            <div className="md:w-1/2 bg-[#8371F5] dark:bg-blue-600 text-white flex flex-col items-center justify-center p-8">
                <h2 className="text-3xl font-bold mb-4">Welcome Back!</h2>
                <UserCircle2 className="w-32 h-32 mt-8 text-white/90 stroke-[1.5]" />
            </div>

            {/* Right Side: Login Form */}
            <div className="md:w-1/2 p-8 flex flex-col justify-center">
                <h3 className="text-2xl font-semibold mb-6">Sign In</h3>

                <div className="flex flex-col gap-4">
                    <div>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="you@example.com" className="mt-2" />
                    </div>
                    <div>
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" placeholder="********" className="mt-2" />
                    </div>
                </div>

                <Button className="mt-6 w-full">Login</Button>

                <p className="mt-4 text-sm text-gray-500 dark:text-gray-300 text-center">
                    Don’t have an account? <a href="#" className="text-blue-500 hover:underline">Sign up</a>
                </p>
            </div>
        </div>
    )
}
