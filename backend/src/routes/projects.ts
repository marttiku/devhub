import { Router, type Request, type Response } from 'express';
import { getProjects, poll } from '../poller';
import {
  startProject,
  stopProject,
  openInBrowser,
  openInCursor,
  buildOpenUrl,
  waitForHealthy,
} from '../actions';
import { listContainers } from '../docker';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  res.json(getProjects());
});

router.post('/:id/start', async (req: Request, res: Response) => {
  const project = getProjects().find((p) => p.id === req.params.id);
  if (!project) {
    res.status(404).json({ ok: false, error: 'Project not found' });
    return;
  }
  if (!project.containerPath) {
    res.status(400).json({ ok: false, error: 'No container path (Docker-only card)' });
    return;
  }

  const result = await startProject(project.containerPath);
  if (!result.ok) {
    res.json(result);
    return;
  }

  const healthy = await waitForHealthy(async () => {
    const containers = await listContainers();
    return containers.filter((c) => c.groupName.toLowerCase() === project.id.toLowerCase());
  });

  await poll(); // refresh state

  const updated = getProjects().find((p) => p.id === req.params.id);
  const port = updated?.primaryPort ?? project.primaryPort;
  res.json({ ok: true, url: buildOpenUrl(port), healthy });
});

router.post('/:id/stop', async (req: Request, res: Response) => {
  const project = getProjects().find((p) => p.id === req.params.id);
  if (!project) {
    res.status(404).json({ ok: false, error: 'Project not found' });
    return;
  }
  if (!project.containerPath) {
    res.status(400).json({ ok: false, error: 'No container path' });
    return;
  }

  const result = await stopProject(project.containerPath);
  await poll();
  res.json(result);
});

router.post('/:id/open-browser', async (req: Request, res: Response) => {
  const project = getProjects().find((p) => p.id === req.params.id);
  if (!project) {
    res.status(404).json({ ok: false, error: 'Project not found' });
    return;
  }
  const url = (req.body as { url?: string } | undefined)?.url || buildOpenUrl(project.primaryPort);
  res.json(await openInBrowser(url));
});

router.post('/:id/open-cursor', async (req: Request, res: Response) => {
  const project = getProjects().find((p) => p.id === req.params.id);
  if (!project) {
    res.status(404).json({ ok: false, error: 'Project not found' });
    return;
  }
  if (!project.hostPath) {
    res.status(400).json({ ok: false, error: 'No host path (Docker-only card)' });
    return;
  }
  res.json(await openInCursor(project.hostPath));
});

export default router;
