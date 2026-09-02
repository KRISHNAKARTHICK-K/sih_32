package com.agriprocure.service;

import com.agriprocure.dto.CropPriceResponse;
import com.agriprocure.dto.CropResponse;
import com.agriprocure.entity.Crop;
import com.agriprocure.entity.CropPrice;
import com.agriprocure.exception.ResourceNotFoundException;
import com.agriprocure.repository.CropPriceRepository;
import com.agriprocure.repository.CropRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class CropService {

    private final CropRepository cropRepository;
    private final CropPriceRepository cropPriceRepository;

    public CropService(CropRepository cropRepository, CropPriceRepository cropPriceRepository) {
        this.cropRepository = cropRepository;
        this.cropPriceRepository = cropPriceRepository;
    }

    @Transactional(readOnly = true)
    public List<CropResponse> getAllActiveCrops() {
        LocalDate today = LocalDate.now();
        return cropRepository.findByActiveTrue().stream()
                .map(crop -> {
                    BigDecimal price = cropPriceRepository.findCurrentPriceByCropId(crop.getId(), today)
                            .map(CropPrice::getPricePerUnit)
                            .orElse(BigDecimal.ZERO);
                    return new CropResponse(
                            crop.getId(),
                            crop.getCode(),
                            crop.getName(),
                            crop.getUnit(),
                            price,
                            crop.isActive(),
                            crop.getCreatedAt()
                    );
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CropResponse getCropById(UUID id) {
        Crop crop = cropRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Crop not found with ID: " + id));
        BigDecimal price = cropPriceRepository.findCurrentPriceByCropId(crop.getId(), LocalDate.now())
                .map(CropPrice::getPricePerUnit)
                .orElse(BigDecimal.ZERO);
        return new CropResponse(crop.getId(), crop.getCode(), crop.getName(), crop.getUnit(), price, crop.isActive(), crop.getCreatedAt());
    }

    @Transactional(readOnly = true)
    public List<CropPriceResponse> getCropPriceHistory(UUID cropId) {
        return cropPriceRepository.findByCropIdAndActiveTrue(cropId).stream()
                .map(cp -> new CropPriceResponse(
                        cp.getId(),
                        cp.getCrop().getId(),
                        cp.getCrop().getCode(),
                        cp.getCrop().getName(),
                        cp.getPricePerUnit(),
                        cp.getEffectiveFrom(),
                        cp.getEffectiveTo(),
                        cp.isActive(),
                        cp.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }
}
