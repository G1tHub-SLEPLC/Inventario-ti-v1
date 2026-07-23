# Reglas del Agente

- **Monitor de Contexto**: Debes monitorizar la longitud y complejidad de la conversación. Si detectas que la conversación se está haciendo muy larga (por ejemplo, más de 15 turnos de trabajo intenso) o si el rendimiento/precisión podría degradarse, lanza una "ALERTA DE SATURACIÓN DE CONTEXTO" de forma proactiva al usuario.
- Cuando lances esta alerta, ofrécele al usuario generar automáticamente un "Resumen Ejecutivo de Traspaso" en formato Markdown para que puedan abrir un nuevo chat y continuar sin perder el contexto.
