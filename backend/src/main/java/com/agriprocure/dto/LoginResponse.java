package com.agriprocure.dto;

public class LoginResponse {

    private String accessToken;
    private String tokenType = "Bearer";
    private long expiresIn;
    private AuthenticatedUserResponse user;

    public LoginResponse() {
    }

    public LoginResponse(String accessToken, long expiresIn, AuthenticatedUserResponse user) {
        this.accessToken = accessToken;
        this.tokenType = "Bearer";
        this.expiresIn = expiresIn;
        this.user = user;
    }

    public String getAccessToken() {
        return accessToken;
    }

    public void setAccessToken(String accessToken) {
        this.accessToken = accessToken;
    }

    public String getTokenType() {
        return tokenType;
    }

    public void setTokenType(String tokenType) {
        this.tokenType = tokenType;
    }

    public long getExpiresIn() {
        return expiresIn;
    }

    public void setExpiresIn(long expiresIn) {
        this.expiresIn = expiresIn;
    }

    public AuthenticatedUserResponse getUser() {
        return user;
    }

    public void setUser(AuthenticatedUserResponse user) {
        this.user = user;
    }
}
