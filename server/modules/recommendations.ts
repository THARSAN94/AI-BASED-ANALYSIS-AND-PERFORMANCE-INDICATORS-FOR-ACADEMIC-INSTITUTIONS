import { GoogleGenAI } from '@google/genai';
import { CriterionEvaluationResult } from '../evaluators/aicteEvaluator.js';

export interface RecommendationItem {
  category: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  title: string;
  description: string;
  actionItems: string[];
  timeline: string;
}

export async function generateRecommendations(
  moduleType: 'aicte' | 'ugc',
  institutionName: string,
  criteriaResults: CriterionEvaluationResult[],
  complianceScore: number
): Promise<{ recommendations: RecommendationItem[]; aiSummary: string }> {
  const failedCriteria = criteriaResults.filter(c => c.status === 'Criteria Not Satisfied');

  const recommendations: RecommendationItem[] = [];

  // Group failed criteria by category
  const failedByCategory = new Map<string, CriterionEvaluationResult[]>();
  for (const crit of failedCriteria) {
    const list = failedByCategory.get(crit.category) || [];
    list.push(crit);
    failedByCategory.set(crit.category, list);
  }

  // Generate actionable recommendations per deficient category
  for (const [category, items] of failedByCategory.entries()) {
    const hasMandatory = items.some(i => i.isMandatory);
    const priority: 'Critical' | 'High' | 'Medium' = hasMandatory ? 'Critical' : 'High';

    let timeline = '30 - 60 Days';
    if (category.includes('Land') || category.includes('Campus') || category.includes('Infrastructure')) {
      timeline = '60 - 90 Days';
    } else if (category.includes('Safety') || category.includes('Governance') || category.includes('Committees')) {
      timeline = '15 - 30 Days';
    }

    const actionItems = items.map(item => {
      const rec = item.recommendation || `Rectify shortfall in ${item.title}`;
      return `${item.title}: ${rec} (Identified Gap: ${item.identifiedGap || 'Below standard'})`;
    });

    recommendations.push({
      category,
      priority,
      title: `Remediation Plan for ${category}`,
      description: `Identified ${items.length} non-compliant item(s) in ${category}. Addressing these is necessary to satisfy statutory regulations.`,
      actionItems,
      timeline,
    });
  }

  // If all criteria satisfied
  if (failedCriteria.length === 0) {
    recommendations.push({
      category: 'Compliance Sustenance',
      priority: 'Low',
      title: 'Institutional Readiness & Document Dossier Preparation',
      description: 'All configured criteria currently satisfy statutory benchmarks. Focus on dossier compilation and physical verification readiness.',
      actionItems: [
        'Assemble original certified copies of land titles, approved building plans, and university affiliation orders.',
        'Keep faculty service books, Form 16, bank statement transfers, and doctoral degree certificates ready for inspection committee.',
        'Ensure laboratory stock registers, equipment invoices, and maintenance logs are updated and countersigned by Head of Department.',
        'Upload all mandatory committee notifications and minutes to the official institutional portal.',
      ],
      timeline: 'Ongoing / Prior to Committee Inspection',
    });
  }

  // AI Executive Summary Generation
  let aiSummary = '';
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a senior accreditation & regulatory consultant specializing in Indian higher education regulatory bodies (AICTE Approval Process Handbook and UGC Act 1956 Section 2(f)/12(B)).
Review the following pre-assessment summary for "${institutionName}":
Module: ${moduleType.toUpperCase()} Compliance Assessment
Compliance Score: ${complianceScore}%
Total Criteria: ${criteriaResults.length}
Criteria Satisfied: ${criteriaResults.length - failedCriteria.length}
Failed Criteria (${failedCriteria.length}):
${failedCriteria.map(f => `- [${f.category}] ${f.title}: ${f.identifiedGap || 'Unsatisfied'}`).join('\n')}

Provide an authoritative, constructive 3-paragraph executive compliance brief:
1. Executive diagnosis: State overall institutional readiness and core vulnerability areas.
2. Statutory risk analysis: Explain the implications of the identified deficiencies regarding AICTE/UGC scrutiny committee rejection risks.
3. Strategic roadmap: Concrete prioritised milestones for the Governing Body to achieve full statutory clearance.
Keep the tone professional, objective, and institutional. Avoid conversational filler.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      if (response && response.text) {
        aiSummary = response.text.trim();
      }
    } catch (err) {
      console.warn('Gemini API call failed or timed out, generating deterministic fallback summary:', err);
    }
  }

  // Fallback high-quality expert summary if AI key absent or request failed
  if (!aiSummary) {
    if (failedCriteria.length === 0) {
      aiSummary = `Executive Compliance Diagnosis for ${institutionName}:
The institutional profile complies with all configured benchmarks under the ${moduleType.toUpperCase()} statutory framework, attaining a 100% compliance rating. Core prerequisites spanning physical infrastructure, instructional capacity, faculty credentials, and governance structures reflect strong alignment with prescribed standards.

Statutory Readiness Assessment:
With zero critical deficits identified across essential parameters, the institution is well-positioned for physical Expert Visit Committee (EVC) or Scrutiny Committee inspections. The risk of statutory show-cause or intake curtailment is minimal under present operating metrics.

Strategic Recommendation:
The Governing Body should institutionalize continuous quality assurance via the IQAC cell, maintain periodic renewals of statutory certificates (Fire Safety NOC, Land Revenue Mutation, EPFO challans), and curate verified physical documentary binders corresponding to each portal declaration.`;
    } else {
      const criticalCount = failedCriteria.filter(f => f.isMandatory).length;
      aiSummary = `Executive Compliance Diagnosis for ${institutionName}:
Preliminary statutory assessment indicates an overall compliance score of ${complianceScore}% against ${moduleType.toUpperCase()} regulations. While positive capabilities exist across satisfied benchmarks, the presence of ${failedCriteria.length} unfulfilled criterion/criteria (${criticalCount} designated as mandatory) poses regulatory non-compliance risks during formal portal scrutiny.

Statutory Risk Analysis:
Regulatory bodies enforce zero tolerance on core statutory pillars including land title legitimacy, building safety approvals, minimum faculty cadre ratios, and mandatory anti-ragging/grievance mechanisms. Unresolved deficiencies in these critical domains typically result in deficiency memos or rejection at the preliminary scrutiny stage.

Strategic Remediation Roadmap:
The institution's management must immediately execute the targeted remediation plans. Priority must be allocated to closing cadre/qualification shortfalls, securing municipal/fire safety NOC renewals, and depositing statutory joint reserve funds within the next 30 to 60 days before scheduling official committee inspection visits.`;
    }
  }

  return { recommendations, aiSummary };
}
