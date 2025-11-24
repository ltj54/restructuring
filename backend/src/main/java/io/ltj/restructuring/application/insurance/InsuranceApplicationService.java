package io.ltj.restructuring.application.insurance;

import io.ltj.restructuring.api.dto.insurance.InsuranceRequestCreateDto;
import io.ltj.restructuring.api.dto.insurance.InsuranceRequestResponseDto;
import io.ltj.restructuring.domain.insurance.InsuranceRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;

@Service
public class InsuranceApplicationService {

    private static final Logger log = LoggerFactory.getLogger(InsuranceApplicationService.class);
    private static final DateTimeFormatter FILE_TIMESTAMP_FORMAT = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmm");

    private final InsuranceRequestService insuranceRequestService;

    public InsuranceApplicationService(InsuranceRequestService insuranceRequestService) {
        this.insuranceRequestService = insuranceRequestService;
    }

    public InsuranceRequestResponseDto generateInsuranceRequest(InsuranceRequestCreateDto requestDto) {
        InsuranceRequest request = insuranceRequestService.createInsuranceRequest(requestDto.userId());
        InsuranceRequestResponseDto response = mapToResponse(request);
        log.atInfo()
                .addKeyValue("requestId", response.requestId())
                .addKeyValue("userId", response.userId())
                .log("Generated insurance request");
        return response;
    }

    private InsuranceRequestResponseDto mapToResponse(InsuranceRequest request) {
        String filename = "insurance_request_" + request.getUserId() + "_" + request.getCreatedAt().format(FILE_TIMESTAMP_FORMAT) + ".xml";
        return new InsuranceRequestResponseDto(
                request.getId(),
                request.getUserId(),
                request.getCreatedAt(),
                request.getStatus(),
                request.getXmlContent(),
                filename
        );
    }
}

