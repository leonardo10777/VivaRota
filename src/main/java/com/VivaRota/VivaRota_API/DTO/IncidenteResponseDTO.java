package com.VivaRota.VivaRota_API.DTO;

import com.VivaRota.VivaRota_API.entities.Incidente;

import java.time.LocalDateTime;
import java.util.UUID;

public class IncidenteResponseDTO {

    private UUID id;
    private String tipo;
    private String descricao;
    private Double latitude;
    private Double longitude;
    private String endereco;
    private Integer confirmacoes;
    private String status;
    private LocalDateTime criadoEm;
    private LocalDateTime expiraEm;
    private String nomeUsuario;

    public IncidenteResponseDTO(Incidente incidente) {
        this.id = incidente.getId();
        this.tipo = incidente.getTipo();
        this.descricao = incidente.getDescricao();
        this.latitude = incidente.getLatitude();
        this.longitude = incidente.getLongitude();
        this.endereco = incidente.getEndereco();
        this.confirmacoes = incidente.getConfirmacoes();
        this.status = incidente.getStatus();
        this.criadoEm = incidente.getCriadoEm();
        this.expiraEm = incidente.getExpiraEm();
        this.nomeUsuario = incidente.getUsuario().getNome();
    }

    public UUID getId() { return id; }
    public String getTipo() { return tipo; }
    public String getDescricao() { return descricao; }
    public Double getLatitude() { return latitude; }
    public Double getLongitude() { return longitude; }
    public String getEndereco() { return endereco; }
    public Integer getConfirmacoes() { return confirmacoes; }
    public String getStatus() { return status; }
    public LocalDateTime getCriadoEm() { return criadoEm; }
    public LocalDateTime getExpiraEm() { return expiraEm; }
    public String getNomeUsuario() { return nomeUsuario; }
}