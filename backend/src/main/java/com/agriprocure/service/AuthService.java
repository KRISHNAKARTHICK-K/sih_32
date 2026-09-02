package com.agriprocure.service;

import com.agriprocure.dto.AuthenticatedUserResponse;
import com.agriprocure.dto.LoginRequest;
import com.agriprocure.dto.LoginResponse;
import com.agriprocure.entity.CentreStaff;
import com.agriprocure.entity.Farmer;
import com.agriprocure.entity.User;
import com.agriprocure.exception.ValidationException;
import com.agriprocure.repository.CentreStaffRepository;
import com.agriprocure.repository.FarmerRepository;
import com.agriprocure.repository.UserRepository;
import com.agriprocure.security.CustomUserDetails;
import com.agriprocure.security.CustomUserDetailsService;
import com.agriprocure.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final FarmerRepository farmerRepository;
    private final CentreStaffRepository centreStaffRepository;
    private final AuditLogService auditLogService;

    public AuthService(AuthenticationManager authenticationManager,
                       CustomUserDetailsService userDetailsService,
                       JwtService jwtService,
                       UserRepository userRepository,
                       FarmerRepository farmerRepository,
                       CentreStaffRepository centreStaffRepository,
                       AuditLogService auditLogService) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.farmerRepository = farmerRepository;
        this.centreStaffRepository = centreStaffRepository;
        this.auditLogService = auditLogService;
    }

    public LoginResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
            );

            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            User user = userDetails.getUser();

            String token = jwtService.generateToken(userDetails);
            long expiresIn = jwtService.getExpirationTime();

            AuthenticatedUserResponse userResponse = buildUserResponse(userDetails);

            auditLogService.logAction(user, "LOGIN_SUCCESS", "USER", user.getId().toString(),
                    "User logged in successfully with role: " + user.getRole());

            return new LoginResponse(token, expiresIn, userResponse);
        } catch (BadCredentialsException | UsernameNotFoundException e) {
            // Throw BadCredentialsException to return clean 401 Unauthorized without leaking account existence
            throw new BadCredentialsException("Invalid username or password");
        } catch (DisabledException e) {
            throw new ValidationException("Account is disabled. Please contact administrator.");
        }
    }

    @Transactional(readOnly = true)
    public AuthenticatedUserResponse getMe(CustomUserDetails userDetails) {
        if (userDetails == null) {
            throw new ValidationException("No authenticated user in context");
        }
        return buildUserResponse(userDetails);
    }

    public AuthenticatedUserResponse buildUserResponse(CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        AuthenticatedUserResponse response = new AuthenticatedUserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setMobile(user.getMobile());
        response.setRole(user.getRole());
        response.setFullName(userDetails.getFullName());

        if (userDetails.getFarmerId() != null) {
            response.setFarmerId(userDetails.getFarmerId());
            farmerRepository.findById(userDetails.getFarmerId()).ifPresent(f -> {
                response.setFarmerCode(f.getFarmerCode());
                response.setFullName(f.getFullName());
            });
        }

        if (userDetails.getCentreId() != null) {
            response.setCentreId(userDetails.getCentreId());
            centreStaffRepository.findByUserId(user.getId()).ifPresent(cs -> {
                response.setCentreName(cs.getCentre().getName());
                response.setCentreCode(cs.getCentre().getCentreCode());
            });
        }

        return response;
    }
}
