package com.autocart.businessservice.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "variant_colours")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VariantColour {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "variant_id", nullable = false)
    private Long variantId;

    @Column(name = "colour_name", nullable = false, length = 50)
    private String colourName;

    @Column(name = "hex_code", length = 7)
    private String hexCode;
}
