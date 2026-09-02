package com.agriprocure.service;

import com.agriprocure.dto.FarmerCreateRequest;
import com.agriprocure.dto.FarmerResponse;
import com.agriprocure.entity.Farmer;
import com.agriprocure.entity.Role;
import com.agriprocure.entity.User;
import com.agriprocure.exception.ResourceNotFoundException;
import com.agriprocure.exception.ValidationException;
import com.agriprocure.repository.FarmerRepository;
import com.agriprocure.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class FarmerService {

    private final FarmerRepository farmerRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public FarmerService(FarmerRepository farmerRepository,
                         UserRepository userRepository,
                         PasswordEncoder passwordEncoder,
                         AuditLogService auditLogService) {
        this.farmerRepository = farmerRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditLogService = auditLogService;
    }

    @Transactional(readOnly = true)
    public List<FarmerResponse> getAllFarmers() {
        return farmerRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public FarmerResponse getFarmerById(UUID id) {
        Farmer farmer = farmerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found with ID: " + id));
        return mapToResponse(farmer);
    }

    @Transactional(readOnly = true)
    public FarmerResponse getFarmerByCode(String code) {
        Farmer farmer = farmerRepository.findByFarmerCode(code)
                .orElseThrow(() -> new ResourceNotFoundException("Farmer not found with code: " + code));
        return mapToResponse(farmer);
    }

    public FarmerResponse createFarmer(FarmerCreateRequest request) {
        if (farmerRepository.existsByMobile(request.getMobile())) {
            throw new ValidationException("A farmer with mobile number " + request.getMobile() + " already exists");
        }

        // Generate unique farmer code FAR-XXXXXX
        long count = farmerRepository.count() + 1;
        String farmerCode = String.format("FAR-%06d", count);
        while (farmerRepository.existsByFarmerCode(farmerCode)) {
            count++;
            farmerCode = String.format("FAR-%06d", count);
        }

        // Create linked user account for future authentication
        String username = "farmer_" + request.getMobile();
        User user = new User(
                username,
                request.getEmail(),
                request.getMobile(),
                passwordEncoder.encode("Pass@123"),
                Role.FARMER
        );
        user = userRepository.save(user);

        Farmer farmer = new Farmer(
                farmerCode,
                user,
                request.getFullName(),
                request.getMobile(),
                request.getEmail(),
                request.getVillage(),
                request.getDistrict(),
                request.getState(),
                request.getAddress()
        );

        Farmer savedFarmer = farmerRepository.save(farmer);
        auditLogService.logAction(user, "CREATE_FARMER", "FARMER", savedFarmer.getId().toString(),
                "Farmer profile created: " + savedFarmer.getFarmerCode());

        return mapToResponse(savedFarmer);
    }

    public FarmerResponse mapToResponse(Farmer farmer) {
        return new FarmerResponse(
                farmer.getId(),
                farmer.getFarmerCode(),
                farmer.getFullName(),
                farmer.getMobile(),
                farmer.getEmail(),
                farmer.getVillage(),
                farmer.getDistrict(),
                farmer.getState(),
                farmer.getAddress(),
                farmer.getCreatedAt()
        );
    }
}
