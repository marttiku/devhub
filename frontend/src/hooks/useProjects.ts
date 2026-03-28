import { useState, useEffect, useRef, useCallback } from 'react';
import type { Project } from '../types';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const retryDelayRef = useRef(1000);

  const connect = useCallback(() => {
    const proto = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${proto}://${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onopen = () => { setConnected(true); retryDelayRef.current = 1000; };
    ws.onclose = () => {
      setConnected(false);
      setTimeout(connect, retryDelayRef.current);
      retryDelayRef.current = Math.min(retryDelayRef.current * 2, 30_000);
    };
    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);
        if (msg.type === 'projects') setProjects(msg.data);
      } catch { /* ignore */ }
    };
  }, []);

  useEffect(() => {
    // Load initial data via REST while WS connects
    fetch('/api/projects').then(r => r.json()).then(setProjects).catch(() => {});
    connect();
    return () => wsRef.current?.close();
  }, [connect]);

  return { projects, connected };
}
