package com.VivaRota.VivaRota_API.repository;

import com.VivaRota.VivaRota_API.entities.Incidente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.UUID;

public interface IncidenteRepository extends JpaRepository<Incidente, UUID> {

    @Query(value = "SELECT * FROM incidentes i " +
            "WHERE ST_DWithin(i.localizacao, ST_SetSRID(ST_MakePoint(:lng, :lat), 4326)::geography, :raio) " +
            "AND i.expira_em > NOW()",
            nativeQuery = true)
    List<Incidente> buscarIncidentesProximos(
            @Param("lat") Double lat,
            @Param("lng") Double lng,
            @Param("raio") Double raio);

    @Query(value = "SELECT COUNT(*) FROM incidentes i " +
            "WHERE ST_DWithin(i.localizacao, ST_GeogFromText(:rotaWkt), :metros)",
            nativeQuery = true)
    Long contarIncidentesNoCaminho(
            @Param("rotaWkt") String rotaWkt,
            @Param("metros") Double metros);

    List<Incidente> findByUsuarioEmail(String email);

    @Query(value = "SELECT * FROM incidentes i WHERE i.expira_em > NOW()",
            nativeQuery = true)
    List<Incidente> listarAtivos();

}