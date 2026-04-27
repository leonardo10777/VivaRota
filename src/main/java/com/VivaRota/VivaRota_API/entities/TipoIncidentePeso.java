package com.VivaRota.VivaRota_API.entities;

import jakarta.persistence.*;

@Entity
@Table(name = "tipo_incidente_peso")
public class TipoIncidentePeso {

    @Id
    private String tipo;

    @Column(nullable = false)
    private Integer peso;

    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public Integer getPeso() { return peso; }
    public void setPeso(Integer peso) { this.peso = peso; }
}