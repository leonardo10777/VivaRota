package com.VivaRota.VivaRota_API.services;

import com.VivaRota.VivaRota_API.DTO.IncidenteRequestDTO;
import com.VivaRota.VivaRota_API.entities.Incidente;
import com.VivaRota.VivaRota_API.entities.Usuario;
import com.VivaRota.VivaRota_API.repository.IncidenteRepository;
import com.VivaRota.VivaRota_API.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@Service
public class IncidenteService {

    @Autowired
    private IncidenteRepository incidenteRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    // Reportar um novo incidente
    public Incidente reportar(IncidenteRequestDTO dto, String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado."));

        Incidente incidente = new Incidente();
        incidente.setUsuario(usuario);
        incidente.setTipo(dto.getTipo());
        incidente.setDescricao(dto.getDescricao());
        incidente.setLatitude(dto.getLatitude());
        incidente.setLongitude(dto.getLongitude());
        incidente.setEndereco(dto.getEndereco());

        // Incrementa total de reports do usuário
        usuario.setTotalReports(usuario.getTotalReports() + 1);
        usuarioRepository.save(usuario);

        return incidenteRepository.save(incidente);
    }

    // Buscar incidentes próximos a uma coordenada (para exibir no mapa)
    public List<Incidente> buscarProximos(Double lat, Double lng, Double raioMetros) {
        return incidenteRepository.buscarIncidentesProximos(lat, lng, raioMetros);
    }

    // Confirmar que um incidente ainda está acontecendo
    public Incidente confirmar(UUID id) {
        Incidente incidente = incidenteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incidente não encontrado."));

        incidente.setConfirmacoes(incidente.getConfirmacoes() + 1);
        return incidenteRepository.save(incidente);
    }

    // Marcar incidente como resolvido ("Já passou")
    public Incidente resolver(UUID id) {
        Incidente incidente = incidenteRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Incidente não encontrado."));

        incidente.setStatus("resolvido");
        return incidenteRepository.save(incidente);
    }

    // Buscar todos os incidentes ativos (para o mapa geral)
    public List<Incidente> buscarAtivos() {
        return incidenteRepository.findAll().stream()
                .filter(i -> "ativo".equals(i.getStatus()))
                .toList();
    }
}