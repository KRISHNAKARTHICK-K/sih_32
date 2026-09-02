package com.agriprocure.service;

import com.agriprocure.dto.CentreCreateRequest;
import com.agriprocure.dto.CentreResponse;
import com.agriprocure.entity.ProcurementCentre;
import com.agriprocure.exception.ResourceNotFoundException;
import com.agriprocure.exception.ValidationException;
import com.agriprocure.repository.ProcurementCentreRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class CentreService {

    private final ProcurementCentreRepository centreRepository;

    public CentreService(ProcurementCentreRepository centreRepository) {
        this.centreRepository = centreRepository;
    }

    @Transactional(readOnly = true)
    public List<CentreResponse> getAllCentres() {
        return centreRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<CentreResponse> getActiveCentres() {
        return centreRepository.findByActiveTrue().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CentreResponse getCentreById(UUID id) {
        ProcurementCentre centre = centreRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Procurement Centre not found with ID: " + id));
        return mapToResponse(centre);
    }

    public CentreResponse createCentre(CentreCreateRequest request) {
        long count = centreRepository.count() + 1;
        String centreCode = String.format("PC-%03d", count);
        while (centreRepository.existsByCentreCode(centreCode)) {
            count++;
            centreCode = String.format("PC-%03d", count);
        }

        ProcurementCentre centre = new ProcurementCentre(
                centreCode,
                request.getName(),
                request.getAddress(),
                request.getVillage(),
                request.getDistrict(),
                request.getState(),
                request.getContactNumber()
        );

        return mapToResponse(centreRepository.save(centre));
    }

    public CentreResponse mapToResponse(ProcurementCentre centre) {
        return new CentreResponse(
                centre.getId(),
                centre.getCentreCode(),
                centre.getName(),
                centre.getAddress(),
                centre.getVillage(),
                centre.getDistrict(),
                centre.getState(),
                centre.getContactNumber(),
                centre.isActive(),
                centre.getCreatedAt()
        );
    }
}
