package com.VivaRota.VivaRota_API.repository;

import com.VivaRota.VivaRota_API.entities.Rota;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface RotaRepository extends JpaRepository<Rota, UUID> {
}