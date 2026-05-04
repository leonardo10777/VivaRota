package com.VivaRota.VivaRota_API.services;

import com.VivaRota.VivaRota_API.DTO.RotaOpcaoDTO;
import com.VivaRota.VivaRota_API.DTO.RotaRequestDTO;
import com.VivaRota.VivaRota_API.DTO.RotaResponseDTO;
import com.VivaRota.VivaRota_API.entities.Rota;
import com.VivaRota.VivaRota_API.entities.RotaOpcao;
import com.VivaRota.VivaRota_API.entities.Usuario;
import com.VivaRota.VivaRota_API.repository.RotaRepository;
import com.VivaRota.VivaRota_API.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import java.util.Locale;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RotaService {

    @Value("${mapbox.token}")
    private String mapboxToken;

    @Autowired private RotaRepository rotaRepository;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private JdbcTemplate jdbcTemplate;
    @Autowired private RestTemplate restTemplate;

    public RotaResponseDTO calcular(RotaRequestDTO dto, String emailUsuario) {
        Usuario usuario = usuarioRepository.findByEmail(emailUsuario)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Usuário não encontrado."));

        // 1. Busca rotas alternativas na Mapbox Directions API
        String url = String.format(
                Locale.US,
                "https://api.mapbox.com/directions/v5/mapbox/walking/" +
                        "%f,%f;%f,%f" +
                        "?geometries=geojson&alternatives=true&steps=false&access_token=%s",
                dto.getOrigemLng(), dto.getOrigemLat(),
                dto.getDestinoLng(), dto.getDestinoLat(),
                mapboxToken
        );

        @SuppressWarnings("unchecked")
        Map<String, Object> response;

        // ← tratamento de timeout e falha de conexão
        try {
            response = restTemplate.getForObject(url, Map.class);
        } catch (ResourceAccessException e) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Tempo de conexão com o serviço de rotas esgotado. Tente novamente."
            );
        }

        if (response == null) {
            throw new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Serviço de rotas indisponível.");
        }

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> routes =
                (List<Map<String, Object>>) response.get("routes");

        if (routes == null || routes.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Nenhuma rota encontrada.");
        }

        // 2. Para cada rota calcula pontuação de perigo
        List<RotaOpcao> opcoes = routes.stream().map(route -> {

            @SuppressWarnings("unchecked")
            Map<String, Object> geometry =
                    (Map<String, Object>) route.get("geometry");

            @SuppressWarnings("unchecked")
            List<List<Double>> coords =
                    (List<List<Double>>) geometry.get("coordinates");

            double distanciaKm =
                    ((Number) route.get("distance")).doubleValue() / 1000;

            int duracaoMin = Math.max(1,
                    (int) Math.round(
                            ((Number) route.get("duration")).doubleValue() / 60));

            List<double[]> coordenadas = coords.stream()
                    .map(c -> new double[]{c.get(0), c.get(1)})
                    .toList();

            String wkt    = coordsParaWkt(coords);
            double perigo = calcularPerigo(wkt);

            return new RotaOpcao(
                    coordenadas, distanciaKm, duracaoMin, perigo, wkt);

        }).collect(Collectors.toList());

        // 3. Classifica as 3 opções
        RotaResponseDTO resultado = classificarRotas(opcoes);

        // 4. Salva a rota segura no histórico
        salvarHistorico(usuario, dto, resultado.getRotaSegura());

        return resultado;
    }

    // ── CLASSIFICAÇÃO ─────────────────────────────────────────────

    private RotaResponseDTO classificarRotas(List<RotaOpcao> opcoes) {

        double maxPerigo  = opcoes.stream()
                .mapToDouble(RotaOpcao::getPerigo).max().orElse(1);
        double maxDuracao = opcoes.stream()
                .mapToDouble(RotaOpcao::getDuracaoMin).max().orElse(1);

        if (maxPerigo  == 0) maxPerigo  = 1;
        if (maxDuracao == 0) maxDuracao = 1;

        final double mp = maxPerigo;
        final double md = maxDuracao;

        // SEGURA → 80% perigo + 20% tempo
        RotaOpcao segura = opcoes.stream()
                .min(Comparator.comparingDouble(r ->
                        0.8 * (r.getPerigo() / mp) +
                                0.2 * (r.getDuracaoMin() / md)
                )).orElse(opcoes.get(0));

        // RÁPIDA → 20% perigo + 80% tempo
        RotaOpcao rapida = opcoes.stream()
                .min(Comparator.comparingDouble(r ->
                        0.2 * (r.getPerigo() / mp) +
                                0.8 * (r.getDuracaoMin() / md)
                )).orElse(opcoes.get(0));

        // EQUILIBRADA → 50% perigo + 50% tempo
        RotaOpcao equilibrada = opcoes.stream()
                .min(Comparator.comparingDouble(r ->
                        0.5 * (r.getPerigo() / mp) +
                                0.5 * (r.getDuracaoMin() / md)
                )).orElse(opcoes.get(0));

        return new RotaResponseDTO(
                toDTO(segura,      "segura"),
                toDTO(rapida,      "rapida"),
                toDTO(equilibrada, "equilibrada")
        );
    }

    // ── HELPERS ───────────────────────────────────────────────────

    private RotaOpcaoDTO toDTO(RotaOpcao r, String tipo) {
        String nivel = r.getPerigo() == 0  ? "seguro"
                : r.getPerigo() <= 5  ? "atencao"
                  : r.getPerigo() <= 10 ? "moderado"
                    : "perigoso";

        return new RotaOpcaoDTO(
                r.getCoordenadas(),
                r.getDistanciaKm(),
                r.getDuracaoMin(),
                r.getPerigo(),
                nivel,
                tipo
        );
    }

    private double calcularPerigo(String wkt) {
        Double resultado = jdbcTemplate.queryForObject(
                "SELECT calcular_perigo_rota(?, 100)",
                Double.class,
                wkt
        );
        return resultado != null ? resultado : 0.0;
    }

    private String coordsParaWkt(List<List<Double>> coords) {
        StringBuilder sb = new StringBuilder("LINESTRING(");
        for (int i = 0; i < coords.size(); i++) {
            sb.append(coords.get(i).get(0))
                    .append(" ")
                    .append(coords.get(i).get(1));
            if (i < coords.size() - 1) sb.append(", ");
        }
        return sb.append(")").toString();
    }

    private void salvarHistorico(Usuario usuario,
                                 RotaRequestDTO dto,
                                 RotaOpcaoDTO rotaSegura) {
        Rota rota = new Rota();
        rota.setUsuario(usuario);
        rota.setOrigemLat(dto.getOrigemLat());
        rota.setOrigemLng(dto.getOrigemLng());
        rota.setDestinoLat(dto.getDestinoLat());
        rota.setDestinoLng(dto.getDestinoLng());
        rota.setTipoRota("segura");
        rota.setAlertasEvitados(
                rotaSegura.getPontuacaoPerigo().intValue()
        );
        rotaRepository.save(rota);
    }
}