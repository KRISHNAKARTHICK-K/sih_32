package com.agriprocure.security;

import com.agriprocure.entity.Role;
import com.agriprocure.entity.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class SecurityUtils {

    public static CustomUserDetails getCurrentUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof CustomUserDetails) {
            return (CustomUserDetails) authentication.getPrincipal();
        }
        return null;
    }

    public static User getCurrentUser() {
        CustomUserDetails details = getCurrentUserDetails();
        return (details != null) ? details.getUser() : null;
    }

    public static UUID getCurrentUserId() {
        CustomUserDetails details = getCurrentUserDetails();
        return (details != null) ? details.getUserId() : null;
    }

    public static Role getCurrentUserRole() {
        CustomUserDetails details = getCurrentUserDetails();
        return (details != null) ? details.getRole() : null;
    }

    public static UUID getCurrentFarmerId() {
        CustomUserDetails details = getCurrentUserDetails();
        return (details != null) ? details.getFarmerId() : null;
    }

    public static UUID getCurrentCentreId() {
        CustomUserDetails details = getCurrentUserDetails();
        return (details != null) ? details.getCentreId() : null;
    }

    public static boolean isFarmer() {
        return getCurrentUserRole() == Role.FARMER;
    }

    public static boolean isOperator() {
        return getCurrentUserRole() == Role.OPERATOR;
    }

    public static boolean isCentreManager() {
        return getCurrentUserRole() == Role.CENTRE_MANAGER;
    }

    public static boolean isAdmin() {
        return getCurrentUserRole() == Role.ADMIN;
    }

    public static boolean isSelfFarmer(UUID farmerId) {
        if (farmerId == null) return false;
        UUID currentFarmerId = getCurrentFarmerId();
        return currentFarmerId != null && currentFarmerId.equals(farmerId);
    }

    public static boolean isAssignedCentre(UUID centreId) {
        if (centreId == null) return false;
        UUID currentCentreId = getCurrentCentreId();
        return currentCentreId != null && currentCentreId.equals(centreId);
    }

    public static boolean canAccessFarmerData(UUID farmerId) {
        if (isAdmin() || isCentreManager() || isOperator()) {
            return true;
        }
        return isSelfFarmer(farmerId);
    }

    public static boolean canAccessCentreData(UUID centreId) {
        if (isAdmin()) {
            return true;
        }
        return isAssignedCentre(centreId);
    }
}
