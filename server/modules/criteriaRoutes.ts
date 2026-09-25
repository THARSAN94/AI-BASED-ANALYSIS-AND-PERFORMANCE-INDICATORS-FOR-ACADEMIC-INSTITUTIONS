import { Request, Response } from 'express';
import { db } from '../db/store.js';

export function handleGetCriteria(req: Request, res: Response) {
  const type = req.params.type as 'aicte' | 'ugc';
  if (type !== 'aicte' && type !== 'ugc') {
    return res.status(400).json({ error: 'Invalid criteria type. Must be "aicte" or "ugc".' });
  }

  const criteria = db.criteria.getByType(type);
  return res.json({
    type,
    count: criteria.length,
    criteria,
  });
}

export function handleUpdateCriterion(req: Request, res: Response) {
  const type = req.params.type as 'aicte' | 'ugc';
  const id = req.params.id;

  if (type !== 'aicte' && type !== 'ugc') {
    return res.status(400).json({ error: 'Invalid criteria type.' });
  }

  const updated = db.criteria.update(type, id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Criterion not found.' });
  }

  return res.json({
    message: 'Criterion updated successfully in database.',
    criterion: updated,
  });
}

export function handleResetCriteria(req: Request, res: Response) {
  const type = req.params.type as 'aicte' | 'ugc';
  if (type !== 'aicte' && type !== 'ugc') {
    return res.status(400).json({ error: 'Invalid criteria type.' });
  }

  db.criteria.resetDefaults(type);
  return res.json({
    message: `${type.toUpperCase()} criteria reset to baseline statutory handbook standards.`,
    criteria: db.criteria.getByType(type),
  });
}
