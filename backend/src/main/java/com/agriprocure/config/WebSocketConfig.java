package com.agriprocure.config;

import com.agriprocure.security.CustomUserDetails;
import com.agriprocure.security.CustomUserDetailsService;
import com.agriprocure.security.JwtService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import java.security.Principal;
import java.util.UUID;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173}")
    private String[] allowedOrigins;

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public WebSocketConfig(JwtService jwtService, CustomUserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(allowedOrigins);
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(allowedOrigins)
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (accessor != null) {
                    if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                        String authHeader = accessor.getFirstNativeHeader("Authorization");
                        if (authHeader == null) {
                            authHeader = accessor.getFirstNativeHeader("token");
                        }
                        if (authHeader != null && authHeader.startsWith("Bearer ")) {
                            authHeader = authHeader.substring(7);
                        }
                        if (authHeader != null && !authHeader.isBlank()) {
                            try {
                                String username = jwtService.extractUsername(authHeader);
                                if (username != null && !jwtService.isTokenExpired(authHeader)) {
                                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                                    UsernamePasswordAuthenticationToken auth =
                                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                                    accessor.setUser(auth);
                                }
                            } catch (Exception ignored) {
                                // Invalid token: accessor.getUser() remains null
                            }
                        }
                    } else if (StompCommand.SUBSCRIBE.equals(accessor.getCommand())) {
                        String destination = accessor.getDestination();
                        if (destination != null) {
                            Principal principal = accessor.getUser();
                            if (destination.startsWith("/topic/admin/")) {
                                if (principal == null || !(principal instanceof Authentication auth) ||
                                        auth.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                                    throw new AccessDeniedException("Access denied to admin destination: " + destination);
                                }
                            } else if (destination.startsWith("/topic/centres/")) {
                                String[] parts = destination.split("/");
                                if (parts.length >= 4) {
                                    try {
                                        UUID centreId = UUID.fromString(parts[3]);
                                        String subtopic = parts.length > 4 ? parts[4] : "";
                                        // Public queue board is permissible; private operational channels require authorization
                                        if (!"queue".equals(subtopic)) {
                                            if (principal == null || !(principal instanceof Authentication auth)) {
                                                throw new AccessDeniedException("Authentication required for destination: " + destination);
                                            }
                                            if (auth.getAuthorities().stream().noneMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
                                                if (auth.getPrincipal() instanceof CustomUserDetails cud) {
                                                    if (cud.getCentreId() == null || !cud.getCentreId().equals(centreId)) {
                                                        throw new AccessDeniedException("Access denied to other centre's operational events: " + destination);
                                                    }
                                                }
                                            }
                                        }
                                    } catch (IllegalArgumentException ignored) {
                                    }
                                }
                            }
                        }
                    }
                }
                return message;
            }
        });
    }
}
