package com.agriprocure.security;

import com.agriprocure.entity.CentreStaff;
import com.agriprocure.entity.Farmer;
import com.agriprocure.entity.User;
import com.agriprocure.repository.CentreStaffRepository;
import com.agriprocure.repository.FarmerRepository;
import com.agriprocure.repository.UserRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;
    private final FarmerRepository farmerRepository;
    private final CentreStaffRepository centreStaffRepository;

    public CustomUserDetailsService(UserRepository userRepository,
                                    FarmerRepository farmerRepository,
                                    CentreStaffRepository centreStaffRepository) {
        this.userRepository = userRepository;
        this.farmerRepository = farmerRepository;
        this.centreStaffRepository = centreStaffRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String identifier) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .or(() -> userRepository.findByMobile(identifier))
                .orElseThrow(() -> new UsernameNotFoundException("User not found with identifier: " + identifier));

        return buildCustomUserDetails(user);
    }

    @Transactional(readOnly = true)
    public UserDetails loadUserById(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + userId));

        return buildCustomUserDetails(user);
    }

    private CustomUserDetails buildCustomUserDetails(User user) {
        UUID farmerId = null;
        UUID centreId = null;
        String fullName = user.getUsername();

        switch (user.getRole()) {
            case FARMER -> {
                Farmer farmer = farmerRepository.findByUserId(user.getId()).orElse(null);
                if (farmer != null) {
                    farmerId = farmer.getId();
                    fullName = farmer.getFullName();
                }
            }
            case OPERATOR, CENTRE_MANAGER -> {
                CentreStaff staff = centreStaffRepository.findByUserId(user.getId()).orElse(null);
                if (staff != null) {
                    centreId = staff.getCentre().getId();
                }
            }
            case ADMIN -> {
                fullName = "System Administrator";
            }
        }

        return new CustomUserDetails(user, farmerId, centreId, fullName);
    }
}
