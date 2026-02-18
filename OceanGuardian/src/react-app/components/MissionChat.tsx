import { useState, useEffect, useRef } from "react";
import { useUserProfile } from "@/react-app/hooks/useUserProfile";
import { Card, CardContent, CardHeader, CardTitle } from "@/react-app/components/ui/card";
import { Button } from "@/react-app/components/ui/button";
import { Input } from "@/react-app/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/react-app/components/ui/avatar";
import { Send, MessageSquare } from "lucide-react";
import type { MissionChatMessage } from "@/shared/types";

interface MissionChatProps {
    missionId: number;
}

export default function MissionChat({ missionId }: MissionChatProps) {
    const { profile: user } = useUserProfile();
    const [messages, setMessages] = useState<MissionChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/missions/${missionId}/chat`);
            if (res.ok) {
                setMessages(await res.json());
            }
        } catch (err) {
            console.error("Failed to fetch messages", err);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, [missionId]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        setSending(true);
        try {
            const res = await fetch(`/api/missions/${missionId}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: newMessage,
                    client_request_id: crypto.randomUUID(),
                }),
            });

            if (res.ok) {
                setNewMessage("");
                fetchMessages();
            }
        } catch (err) {
            console.error("Failed to send message", err);
        } finally {
            setSending(false);
        }
    };

    return (
        <Card className="h-[500px] flex flex-col">
            <CardHeader className="pb-3 border-b">
                <CardTitle className="text-lg flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Mission Chat
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
                {/* Messages messages */}
                <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="text-center text-muted-foreground py-10">
                            <p>No messages yet. Say hello! 👋</p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const isMe = user?.id === msg.user_id;
                            return (
                                <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={msg.avatar_url || undefined} />
                                        <AvatarFallback>{msg.username ? msg.username[0] : "?"}</AvatarFallback>
                                    </Avatar>
                                    <div
                                        className={`max-w-[80%] rounded-lg p-3 text-sm ${isMe
                                            ? "bg-primary text-primary-foreground rounded-tr-none"
                                            : "bg-muted rounded-tl-none"
                                            }`}
                                    >
                                        {!isMe && <p className="text-xs font-semibold mb-1 opacity-70">{msg.username}</p>}
                                        <p>{msg.message}</p>
                                        <p className="text-[10px] opacity-50 mt-1 text-right">
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 border-t bg-background">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                        <Input
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            disabled={sending}
                            className="flex-1"
                        />
                        <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
}
