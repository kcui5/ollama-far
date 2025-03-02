"use client"

import { useState, useRef, useEffect } from "react"
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
    const [attachedFile, setAttachedFile] = useState<File | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim()) return

        const newMessage: Message = { role: "user", content: input }
        
        setMessages((prev) => [...prev, newMessage])
        setInput("")
        setAttachedFile(null)
        setIsLoading(true)

        try {
            const startTime = Date.now();
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

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }

            const reader = response.body?.getReader()
            if (!reader) throw new Error("No reader available")

            let accumulatedContent = ""

            while (true) {
                const { done, value } = await reader.read()
                if (done) break

                // Convert the Uint8Array to text
                const text = new TextDecoder().decode(value)
                accumulatedContent += text

                // Update the message as we receive chunks
                setMessages((prev) => {
                    const existing = prev.find(msg => msg.role === "assistant" && msg.content === accumulatedContent.slice(0, -text.length))
                    if (existing) {
                        return prev.map(msg => msg === existing ? { ...msg, content: accumulatedContent } : msg)
                    } else {
                        return [...prev, { role: "assistant", content: text }]
                    }
                })
            }

            const endTime = Date.now();
            const seconds = ((endTime - startTime) / 1000).toFixed(1);
            // setMessages(prev => [...prev, { role: "assistant", content: `\nResponse took ${seconds} seconds.` }]);

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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file && file.name.endsWith('.xlsx')) {
            setAttachedFile(file)
        } else {
            setAttachedFile(null)
            e.target.value = ''
            alert('Please select an XLSX file')
        }
    }

    return (
        <div className="flex flex-col h-screen max-w-4xl mx-auto p-4">
            <ScrollArea className="flex-1 pr-4 overflow-y-auto">
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
                                <pre className="whitespace-pre-wrap font-sans">{message.content}</pre>
                            </CardContent>
                        </Card>
                    ))}
                    <div ref={messagesEndRef} />
                </div>
            </ScrollArea>

            <div className="flex mt-4">
                <span className="font-bold mr-8 ">Tools:</span>
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
            </div>


            <div className="flex justify-between items-center space-x-2 mb-4">
                <div className="space-x-2">

                
                <Checkbox
                    id="far"
                    checked={useFAR}
                    onCheckedChange={(checked) => setUseFAR(!!checked)}
                />
                <label
                    htmlFor="far"
                    className="text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Function Augmented Reasoning (FAR)
                </label>
                </div>
                <Input
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileChange}
                    className="w-[200px] ml-4"
                />
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
