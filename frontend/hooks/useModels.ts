"use client";

import { useEffect, useCallback } from "react";
import { useChatStore } from "@/store/chatStore";
import { healthApi, modelsApi } from "@/lib/api";

const HEALTH_POLL_INTERVAL = 30_000; // 30s

export function useModels() {
  const { setStatus, setOllamaModels, setSelectedModel, selectedModel } =
    useChatStore();

  const checkHealth = useCallback(async () => {
    try {
      const health = await healthApi.check();
      setStatus(health.ollama_connected ? "connected" : "disconnected");
    } catch {
      setStatus("disconnected");
    }
  }, [setStatus]);

  const fetchModels = useCallback(async () => {
    try {
      const { models, default_model } = await modelsApi.list();
      setOllamaModels(models);
      if (
        models.length > 0 &&
        !models.find((m) => m.name === selectedModel)
      ) {
        setSelectedModel(default_model || models[0].name);
      }
    } catch {
      // Ollama may not be running yet
      setOllamaModels([]);
    }
  }, [setOllamaModels, setSelectedModel, selectedModel]);

  useEffect(() => {
    setStatus("checking");
    checkHealth();
    fetchModels();

    const interval = setInterval(checkHealth, HEALTH_POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [checkHealth, fetchModels, setStatus]);

  return { checkHealth, fetchModels };
}
