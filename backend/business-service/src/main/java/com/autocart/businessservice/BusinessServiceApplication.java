package com.autocart.businessservice;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import com.autocart.businessservice.entity.VariantColour;
import com.autocart.businessservice.entity.CarVariant;
import com.autocart.businessservice.repository.VariantColourRepository;
import com.autocart.businessservice.repository.CarVariantRepository;

import java.util.ArrayList;
import java.util.List;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

@SpringBootApplication
public class BusinessServiceApplication {

	private static final Logger log = LoggerFactory.getLogger(BusinessServiceApplication.class);

	public static void main(String[] args) {
		SpringApplication.run(BusinessServiceApplication.class, args);
	}

	@org.springframework.beans.factory.annotation.Value("${internal.api.key:${INTERNAL_API_KEY:autocart-internal-secure-key-2026}}")
	private String internalApiKey;

	@Bean
	@LoadBalanced
	public RestTemplate restTemplate() {
		SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
		factory.setConnectTimeout(3_000); // 3 s
		factory.setReadTimeout(5_000);    // 5 s
		RestTemplate restTemplate = new RestTemplate(factory);
		restTemplate.getInterceptors().add((request, body, execution) -> {
			if (internalApiKey != null && !internalApiKey.isBlank()) {
				request.getHeaders().add("X-Internal-Token", internalApiKey);
			}
			return execution.execute(request, body);
		});
		return restTemplate;
	}

	@Bean
	public CommandLineRunner initVariantColours(VariantColourRepository colourRepository, CarVariantRepository variantRepository) {
		return args -> {
			if (colourRepository.count() == 0) {
				List<CarVariant> allVariants = variantRepository.findAll();
				List<VariantColour> coloursToSave = new ArrayList<>();

				for (CarVariant v : allVariants) {
					Long vId = v.getId();
					coloursToSave.add(new VariantColour(null, vId, "Pearl Arctic White", "#FFFFFF"));
					coloursToSave.add(new VariantColour(null, vId, "Splendid Silver", "#C0C0C0"));
					coloursToSave.add(new VariantColour(null, vId, "Midnight Black", "#212121"));
				}

				if (!coloursToSave.isEmpty()) {
					colourRepository.saveAll(coloursToSave);
					log.info("Automatically seeded variant_colours table for all {} variants!", allVariants.size());
				}
			}
		};
	}
}
