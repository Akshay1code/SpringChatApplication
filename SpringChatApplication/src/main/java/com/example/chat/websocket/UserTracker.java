package com.example.chat.websocket;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class UserTracker {

    private final Set<String> onlineUsers = ConcurrentHashMap.newKeySet();
    private final SimpMessagingTemplate messagingTemplate;

    public UserTracker(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void userConnected(String username) {
        onlineUsers.add(username);
        broadcast();
    }

    public void userDisconnected(String username) {
        onlineUsers.remove(username);
        broadcast();
    }
    public Set<String> getOnlineUsers() {
        return onlineUsers;
    }
    private void broadcast() {
        messagingTemplate.convertAndSend("/forAll/users", onlineUsers);
    }
}