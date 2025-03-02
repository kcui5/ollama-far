"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"

interface Message {
    role: "user" | "assistant"
    content: string
}

interface Function {
    name: string
}

const availableFunctions: Function[] = [
    { name: "Sum" },
    { name: "Average" },
    { name: "LinearRegression" }
]

export default function Chat() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [selectedFunctions, setSelectedFunctions] = useState<string[]>([])
    const [useFAR, setUseFAR] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return

        const newMessage: Message = { role: "user", content: input }
        setMessages((prev) => [...prev, newMessage])
        setInput("")
        setIsLoading(true)

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    messages: [...messages, newMessage],
                    functions: selectedFunctions,
                    useFAR: useFAR
                })
            })

            const data = await response.json()
            setMessages((prev) => [...prev, { role: "assistant", content: data.response }])
        } catch (error) {
            console.error("Error:", error)
        } finally {
            setIsLoading(false)
        }
    }

    const toggleFunction = (functionName: string) => {
        setSelectedFunctions(prev => {
            if (prev.includes(functionName)) {
                return prev.filter(f => f !== functionName)
            } else {
                return [...prev, functionName]
            }
        })
    }

    return (
        <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
            <ScrollArea className="flex-1 pr-4">
                <div className="space-y-4 mb-4">
                    {messages.map((message, index) => (
                        <Card
                            key={index}
                            className={`max-w-[80%] ${
                                message.role === "user" ? "ml-auto bg-primary" : "bg-muted"
                            }`}
                        >
                            <CardContent className={`p-4 ${
                                message.role === "user" ? "text-primary-foreground" : ""
                            }`}>
                                {message.content}
                            </CardContent>
                        </Card>
                    ))}
                    {isLoading && (
                        <Card className="max-w-[80%] bg-muted">
                            <CardContent className="p-4">
                                <div className="animate-pulse">Thinking...</div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </ScrollArea>

            <div className="flex justify-between mb-4">
                <div className="flex flex-row gap-4">
                    {availableFunctions.map((func) => (
                        <div key={func.name} className="flex items-center space-x-2">
                            <Checkbox
                                id={func.name}
                                checked={selectedFunctions.includes(func.name)}
                                onCheckedChange={() => toggleFunction(func.name)}
                            />
                            <label
                                htmlFor={func.name}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                                {func.name}
                            </label>
                        </div>
                    ))}
                </div>

                <div className="flex items-center space-x-2">
                    <Checkbox
                        id="far"
                        checked={useFAR}
                        onCheckedChange={(checked) => setUseFAR(!!checked)}
                    />
                    <label
                        htmlFor="far"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Function Augmented Reasoning (FAR)
                    </label>
                </div>
            </div>
            

            <form onSubmit={handleSubmit} className="flex gap-2">
                <Input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                />
                <Button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    size="icon"
                >
                    <Send className="w-4 h-4" />
                </Button>
            </form>
        </div>
    )
}
