package com.VivaRota.VivaRota_API.services;

import com.VivaRota.VivaRota_API.DTO.IncidenteResponseDTO;
import com.VivaRota.VivaRota_API.DTO.RotaRequestDTO;
import com.VivaRota.VivaRota_API.DTO.RotaResponseDTO;
import com.VivaRota.VivaRota_API.entities.Incidente;
import com.VivaRota.VivaRota_API.entities.Rota;
import com.VivaRota.VivaRota_API.entities.Usuario;
import com.VivaRota.VivaRota_API.repository.IncidenteRepository;
import com.VivaRota.VivaRota_API.repository.RotaRepository;
import com.VivaRota.VivaRota_API.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class RotaService {

    // Raio em metros para considerar incidentes como risco na rota
    private static final double RAIO_RISCO_METROS = 150.0;

    @Autowired
    private RotaRepository rotaRepository;

    @Autowired
    private IncidenteRepository incidenteRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Calcula rota segura:
    // 1. Busca incidentes ativos próximos à origem e ao destino
    // 2. Registra a rota no banco
    // 3. Retorna os dados para o Mapbox calcular o trajeto desviando das áreas de risco
    public RotaResponseDTO calcularRotaSegura(RotaRequestDTO dto, String emailUsuario) {
        Usuario usuario = getUsuario(emailUsuario);

        // Busca incidentes próximos à origem e ao destino
        List<Incidente> incidentesOrigem = incidenteRepository.buscarIncidentesProximos(
                dto.getOrigemLat(), dto.getOrigemLng(), RAIO_RISCO_METROS);

        List<Incidente> incidentesDestino = incidenteRepository.buscarIncidentesProximos(
                dto.getDestinoLat(), dto.getDestinoLng(), RAIO_RISCO_METROS);

        // Une os incidentes sem duplicatas
        List<Incidente> todosIncidentes = incidentesOrigem;
        incidentesDestino.forEach(i -> {
            if (todosIncidentes.stream().noneMatch(x -> x.getId().equals(i.getId()))) {
                todosIncidentes.add(i);
            }
        });

        // Salva a rota no banco
        Rota rota = new Rota();
        rota.setUsuario(usuario);
        rota.setOrigemLat(dto.getOrigemLat());
        rota.setOrigemLng(dto.getOrigemLng());
        rota.setDestinoLat(dto.getDestinoLat());
        rota.setDestinoLng(dto.getDestinoLng());
        rota.setTipoRota("segura");
        rota.setAlertasEvitados(todosIncidentes.size());
        rotaRepository.save(rota);

        // Monta a resposta com os dados para o Mapbox
        // O front usa os waypoints e a lista de incidentes para:
        // - Solicitar rota ao Mapbox evitando as coordenadas dos incidentes
        // - Exibir os marcadores de alerta no mapa
        RotaResponseDTO resposta = new RotaResponseDTO();
        resposta.setId(rota.getId());
        resposta.setTipoRota("segura");
        resposta.setAlertasEvitados(todosIncidentes.size());
        resposta.setOrigemLat(dto.getOrigemLat());
        resposta.setOrigemLng(dto.getOrigemLng());
        resposta.setDestinoLat(dto.getDestinoLat());
        resposta.setDestinoLng(dto.getDestinoLng());
        resposta.setIncidentesNaRota(
                todosIncidentes.stream().map(IncidenteResponseDTO::new).toList()
        );

        return resposta;
    }

    // Registra rota normal (sem desvio)
    public RotaResponseDTO calcularRotaNormal(RotaRequestDTO dto, String emailUsuario) {
        Usuario usuario = getUsuario(emailUsuario);

        Rota rota = new Rota();
        rota.setUsuario(usuario);
        rota.setOrigemLat(dto.getOrigemLat());
        rota.setOrigemLng(dto.getOrigemLng());
        rota.setDestinoLat(dto.getDestinoLat());
        rota.setDestinoLng(dto.getDestinoLng());
        rota.setTipoRota("normal");
        rota.setAlertasEvitados(0);
        rotaRepository.save(rota);

        RotaResponseDTO resposta = new RotaResponseDTO();
        resposta.setId(rota.getId());
        resposta.setTipoRota("normal");
        resposta.setAlertasEvitados(0);
        resposta.setOrigemLat(dto.getOrigemLat());
        resposta.setOrigemLng(dto.getOrigemLng());
        resposta.setDestinoLat(dto.getDestinoLat());
        resposta.setDestinoLng(dto.getDestinoLng());

        return resposta;
    }

    private Usuario getUsuario(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));
    }
}