import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_KEY || ""
});

export interface NarrativeRequest {
  kpis: Record<string, any>;
  plData: any[];
  audienceLevel: 'executive' | 'team_leads' | 'all_company';
  reportType: 'executive_summary' | 'kpi_analysis' | 'trend_analysis';
}

export interface NarrativeResponse {
  executiveSummary: string;
  keyInsights: string[];
  recommendations: string[];
  talkingPoints: string[];
  wins: string[];
  areasOfFocus: string[];
}

export class AINarrativeGenerator {
  async generateNarrative(request: NarrativeRequest): Promise<NarrativeResponse> {
    try {
      const prompt = this.buildPrompt(request);
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a financial analyst expert who creates clear, professional business narratives from P&L data. Generate insights that are actionable and appropriate for the target audience."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
        max_tokens: 2000,
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");
      return this.validateAndStructureResponse(result);
    } catch (error) {
      throw new Error(`AI narrative generation failed: ${(error as Error).message}`);
    }
  }

  private buildPrompt(request: NarrativeRequest): string {
    const { kpis, plData, audienceLevel, reportType } = request;
    
    let audienceGuidance = "";
    switch (audienceLevel) {
      case 'executive':
        audienceGuidance = "Include all financial details, margins, and strategic recommendations. Focus on high-level performance and strategic implications.";
        break;
      case 'team_leads':
        audienceGuidance = "Focus on departmental performance and operational metrics. Avoid sensitive company-wide profitability details.";
        break;
      case 'all_company':
        audienceGuidance = "Focus on positive achievements, growth metrics, and company-wide goals. Keep it motivational and accessible.";
        break;
    }

    return `
Analyze the following P&L data and generate a professional financial narrative.

KPIs:
${JSON.stringify(kpis, null, 2)}

P&L Data:
${JSON.stringify(plData, null, 2)}

Report Type: ${reportType}
Audience Level: ${audienceLevel}
Audience Guidance: ${audienceGuidance}

Generate a JSON response with the following structure:
{
  "executiveSummary": "3-5 sentence paragraph summarizing overall performance",
  "keyInsights": ["insight 1", "insight 2", "insight 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "talkingPoints": ["talking point 1", "talking point 2", "talking point 3"],
  "wins": ["positive achievement 1", "positive achievement 2"],
  "areasOfFocus": ["area needing attention 1", "area needing attention 2"]
}

Make the narrative professional, data-driven, and actionable. Use specific numbers from the KPIs and highlight meaningful trends or changes.
`;
  }

  private validateAndStructureResponse(response: any): NarrativeResponse {
    const defaults: NarrativeResponse = {
      executiveSummary: "Financial analysis completed. Please review the detailed metrics for insights.",
      keyInsights: ["Analysis shows current financial position"],
      recommendations: ["Continue monitoring key performance indicators"],
      talkingPoints: ["Review quarterly performance metrics"],
      wins: ["Maintained operational efficiency"],
      areasOfFocus: ["Monitor ongoing financial performance"]
    };

    return {
      executiveSummary: response.executiveSummary || defaults.executiveSummary,
      keyInsights: Array.isArray(response.keyInsights) ? response.keyInsights : defaults.keyInsights,
      recommendations: Array.isArray(response.recommendations) ? response.recommendations : defaults.recommendations,
      talkingPoints: Array.isArray(response.talkingPoints) ? response.talkingPoints : defaults.talkingPoints,
      wins: Array.isArray(response.wins) ? response.wins : defaults.wins,
      areasOfFocus: Array.isArray(response.areasOfFocus) ? response.areasOfFocus : defaults.areasOfFocus,
    };
  }
}
