package com.example.chat.SpringChatApplication.websocket;

import org.springframework.http.server.*;
import org.springframework.web.socket.*;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.net.URI;
import java.util.Map;

public class UserInterceptor implements HandshakeInterceptor {

    @Override
    public boolean beforeHandshake(ServerHttpRequest request,
                                   ServerHttpResponse response,
                                   WebSocketHandler wsHandler,
                                   Map<String, Object> attributes) {

        String username = null;

        URI uri = request.getURI();
        String query = uri.getQuery();

        if (query != null) {
            for (String param : query.split("&")) {
                if (param.startsWith("username=")) {
                    username = param.split("=")[1];
                }
            }
        }

        System.out.println("Connecting user: " + username);

        attributes.put("username", username);

        return true;
    }

    @Override
    public void afterHandshake(ServerHttpRequest request,
                               ServerHttpResponse response,
                               WebSocketHandler wsHandler,
                               Exception exception) {
    }
}