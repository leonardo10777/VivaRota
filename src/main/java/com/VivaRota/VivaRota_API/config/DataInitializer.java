package com.VivaRota.VivaRota_API.config;

import com.VivaRota.VivaRota_API.entities.TipoIncidentePeso;
import com.VivaRota.VivaRota_API.repository.TipoIncidentePesoRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner inicializarPesos(TipoIncidentePesoRepository repo) {
        return args -> {
            if (repo.count() == 0) {
                repo.saveAll(List.of(
                        criarPeso("assalto",         3),
                        criarPeso("assedio",          3),
                        criarPeso("sem_iluminacao",   2),
                        criarPeso("area_isolada",     2),
                        criarPeso("acidente",         1),
                        criarPeso("outros",           1)
                ));
            }
        };
    }

    private TipoIncidentePeso criarPeso(String tipo, int peso) {
        TipoIncidentePeso t = new TipoIncidentePeso();
        t.setTipo(tipo);
        t.setPeso(peso);
        return t;
    }
}