import { Response } from 'express';
import { db } from '../db/store.js';
import { AuthenticatedRequest } from './auth.js';
import { evaluateAicteSubmission, AicteSubmissionData } from '../evaluators/aicteEvaluator.js';
import { evaluateUgcSubmission, UgcSubmissionData } from '../evaluators/ugcEvaluator.js';
import { generateRecommendations } from './recommendations.js';

export async function handleEvaluate(req: AuthenticatedRequest, res: Response) {
  try {
    const { moduleType, formData, saveResult = false } = req.body;

    if (!moduleType || (moduleType !== 'aicte' && moduleType !== 'ugc')) {
      return res.status(400).json({ error: 'Valid moduleType ("aicte" or "ugc") is required.' });
    }

    if (!formData) {
      return res.status(400).json({ error: 'Form data payload is required.' });
    }

    const criteriaList = db.criteria.getByType(moduleType);

    let evaluation;
    const institutionName = formData.collegeName || req.user?.collegeName || 'Educational Institution';

    if (moduleType === 'aicte') {
      evaluation = evaluateAicteSubmission(formData as AicteSubmissionData, criteriaList);
    } else {
      evaluation = evaluateUgcSubmission(formData as UgcSubmissionData, criteriaList);
    }

    const { recommendations, aiSummary } = await generateRecommendations(
      moduleType,
      institutionName,
      evaluation.criteriaResults,
      evaluation.complianceScore
    );

    const assessmentResult = {
      institutionName,
      moduleType,
      overallStatus: evaluation.overallStatus,
      overallMessage: evaluation.overallMessage,
      complianceScore: evaluation.complianceScore,
      totalCriteria: evaluation.totalCriteria,
      satisfiedCount: evaluation.satisfiedCount,
      gapCount: evaluation.gapCount,
      criteriaResults: evaluation.criteriaResults,
      recommendations,
      aiExecutiveSummary: aiSummary,
      formData,
    };

    // If requested to save or user is logged in
    let savedDoc;
    if (saveResult && req.user) {
      savedDoc = db.assessments.create({
        userId: req.user.id,
        ...assessmentResult,
      });
    }

    return res.json({
      assessment: savedDoc || assessmentResult,
      isSaved: Boolean(savedDoc),
    });
  } catch (error: any) {
    console.error('Assessment evaluation error:', error);
    return res.status(500).json({ error: 'Failed to complete assessment evaluation: ' + error.message });
  }
}

export function handleSaveAssessment(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required to save assessment.' });
    }

    const {
      moduleType,
      institutionName,
      overallStatus,
      overallMessage,
      complianceScore,
      totalCriteria,
      satisfiedCount,
      gapCount,
      criteriaResults,
      recommendations,
      aiExecutiveSummary,
      formData,
    } = req.body;

    if (!moduleType || !criteriaResults) {
      return res.status(400).json({ error: 'Missing mandatory assessment data.' });
    }

    const saved = db.assessments.create({
      userId: req.user.id,
      institutionName: institutionName || req.user.collegeName,
      moduleType,
      overallStatus,
      overallMessage,
      complianceScore,
      totalCriteria,
      satisfiedCount,
      gapCount,
      criteriaResults,
      recommendations: recommendations || [],
      aiExecutiveSummary,
      formData: formData || {},
    });

    return res.status(201).json({
      message: 'Assessment saved successfully to institution record.',
      assessment: saved,
    });
  } catch (error: any) {
    console.error('Save assessment error:', error);
    return res.status(500).json({ error: 'Failed to save assessment.' });
  }
}

export function handleGetHistory(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const assessments = db.assessments.find({ userId: req.user.id });
  return res.json({
    total: assessments.length,
    assessments,
  });
}

export function handleGetAssessmentById(req: AuthenticatedRequest, res: Response) {
  const { id } = req.params;
  const doc = db.assessments.findById(id);

  if (!doc) {
    return res.status(404).json({ error: 'Assessment not found.' });
  }

  // If doc belongs to a registered user, enforce strict ownership isolation
  if (doc.userId) {
    if (!req.user || (doc.userId !== req.user.id && req.user.role !== 'admin')) {
      return res.status(403).json({ error: 'Unauthorized to view this assessment.' });
    }
  }

  return res.json({ assessment: doc });
}

export function handleDeleteAssessment(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const { id } = req.params;
  const deleted = db.assessments.delete(id, req.user.id);

  if (!deleted) {
    return res.status(404).json({ error: 'Assessment not found or already deleted.' });
  }

  return res.json({ message: 'Assessment record removed successfully.' });
}

export function handleGetStatsSummary(req: AuthenticatedRequest, res: Response) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required.' });
  }

  const list = db.assessments.find({ userId: req.user.id });
  const aicteCount = list.filter(a => a.moduleType === 'aicte').length;
  const ugcCount = list.filter(a => a.moduleType === 'ugc').length;
  const totalScore = list.reduce((acc, curr) => acc + (curr.complianceScore || 0), 0);
  const avgScore = list.length > 0 ? Math.round(totalScore / list.length) : 0;
  const fullySatisfiedCount = list.filter(a => a.overallStatus === 'Satisfied').length;

  return res.json({
    totalAssessments: list.length,
    aicteCount,
    ugcCount,
    avgComplianceScore: avgScore,
    fullySatisfiedCount,
    latestAssessment: list[0] || null,
  });
}
