package com.example.chat.SpringChatApplication.controller;

import com.example.chat.SpringChatApplication.models.ChatMessage;
import com.example.chat.SpringChatApplication.websocket.UserTracker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController

public class MessageController {
    @Autowired
    UserTracker userTracker;
    @RequestMapping("/home")
    public String getMessage(){
        return "Hello Champ From Message Controller";
    }
    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/private")
    public void sendPrivateMessage(ChatMessage message) {
        System.out.println("MESSAGE RECEIVED: " + message.getContent());
        messagingTemplate.convertAndSendToUser(
                message.getReceiver(),   // WHO should receive
                "/queue/messages",       // WHERE to deliver
                message
        );
    }
    @MessageMapping("/broadcast")
    @SendTo("/topic/messages")
    public ChatMessage broadcast(ChatMessage message) {
        System.out.println("Broadcast: " + message.getContent());
        return message;
    }
    @MessageMapping("/getUsers")
    public void sendUsers() {
        messagingTemplate.convertAndSend("/topic/users", userTracker.getOnlineUsers());
    }
}
