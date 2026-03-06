package com.athan.util;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import com.fasterxml.jackson.databind.JsonNode;

import java.io.IOException;
import java.util.*;

/**
 * Custom deserializer for prayer audio files map
 * Handles backward compatibility:
 * - Old format: "FAJR": "fajr.mp3"
 * - New format: "FAJR": ["fajr.mp3", "dua.mp3"]
 */
public class PrayerAudioFilesDeserializer extends JsonDeserializer<Map<String, List<String>>> {

    @Override
    public Map<String, List<String>> deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        JsonNode node = p.getCodec().readTree(p);
        Map<String, List<String>> result = new LinkedHashMap<>();

        Iterator<Map.Entry<String, JsonNode>> fields = node.fields();
        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> entry = fields.next();
            String prayerName = entry.getKey();
            JsonNode valueNode = entry.getValue();

            List<String> fileList = new ArrayList<>();

            if (valueNode.isArray()) {
                // New format: array of strings
                for (JsonNode element : valueNode) {
                    fileList.add(element.asText());
                }
            } else if (valueNode.isTextual()) {
                // Old format: single string - convert to list
                fileList.add(valueNode.asText());
            }

            result.put(prayerName, fileList);
        }

        return result;
    }
}

