package com.VivaRota.VivaRota_API.controller;

import com.VivaRota.VivaRota_API.DTO.IncidenteRequestDTO;
import com.VivaRota.VivaRota_API.DTO.IncidenteResponseDTO;
import com.VivaRota.VivaRota_API.services.IncidenteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/incidentes")
public class IncidenteController {

    @Autowired
    private IncidenteService incidenteService;

    // POST /incidentes — Reportar novo incidente
    @PostMapping
    public ResponseEntity<IncidenteResponseDTO> reportar(
            @RequestBody @Valid IncidenteRequestDTO dto,
            @AuthenticationPrincipal UserDetails userDetails) {

        var incidente = incidenteService.reportar(dto, userDetails.getUsername());
        return ResponseEntity.status(201).body(new IncidenteResponseDTO(incidente));
    }

    // GET /incidentes/proximos?lat=-23.55&lng=-46.63&raio=500
    // Retorna incidentes num raio (em metros) ao redor de uma coordenada
    // Usado pelo mapa para exibir alertas próximos ao usuário
    @GetMapping("/proximos")
    public ResponseEntity<List<IncidenteResponseDTO>> buscarProximos(
            @RequestParam Double lat,
            @RequestParam Double lng,
            @RequestParam(defaultValue = "500") Double raio) {

        var lista = incidenteService.buscarProximos(lat, lng, raio)
                .stream().map(IncidenteResponseDTO::new).toList();
        return ResponseEntity.ok(lista);
    }

    // GET /incidentes/ativos — Todos os incidentes ativos (para mapa geral)
    @GetMapping("/ativos")
    public ResponseEntity<List<IncidenteResponseDTO>> buscarAtivos() {
        var lista = incidenteService.buscarAtivos()
                .stream().map(IncidenteResponseDTO::new).toList();
        return ResponseEntity.ok(lista);
    }

    // PATCH /incidentes/{id}/confirmar — Confirmar que incidente ainda ocorre
    @PatchMapping("/{id}/confirmar")
    public ResponseEntity<IncidenteResponseDTO> confirmar(@PathVariable UUID id) {
        var incidente = incidenteService.confirmar(id);
        return ResponseEntity.ok(new IncidenteResponseDTO(incidente));
    }

    // PATCH /incidentes/{id}/resolver — Marcar como "Já passou"
    @PatchMapping("/{id}/resolver")
    public ResponseEntity<IncidenteResponseDTO> resolver(@PathVariable UUID id) {
        var incidente = incidenteService.resolver(id);
        return ResponseEntity.ok(new IncidenteResponseDTO(incidente));
    }
}