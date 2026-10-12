import { computeAnalyticsData } from './analyticsController.js';

const INSIGHTS_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';

function extractJson(content) {
  const cleaned = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start < 0 || end <= start) throw new Error('The analysis response was not valid JSON');
  return JSON.parse(cleaned.slice(start, end + 1));
}

export async function getAiAnalyticsInsights(req, res, next) {
  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(503).json({ success: false, message: 'AI analytics is not configured on the server yet.' });
    }

    const analytics = await computeAnalyticsData(req.user._id);
    const report = {
      period: `${analytics.meta.currentYear}-${String(analytics.meta.currentMonth).padStart(2, '0')}`,
      currency: 'INR',
      currentMonthTotal: analytics.thisMonthTotal,
      projectedMonthEnd: analytics.projectedTotal,
      dailyAverage: analytics.dailyAverage,
      daysElapsed: analytics.meta.dayOfMonth,
      daysInMonth: analytics.meta.daysInMonth,
      categories: analytics.categoryBreakdown.map(({ category, total, count }) => ({ category, total, transactions: count })),
      monthOverMonthByCategory: analytics.monthComparison,
      recentMonthlyTotals: analytics.monthlyTrend,
      unusualSpending: analytics.unusualExpenses.map(({ amount, category, date }) => ({ amount, category, date })),
      spendingByWeekday: analytics.dayOfWeekPattern,
    };

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(25000),
      body: JSON.stringify({
        model: INSIGHTS_MODEL,
        temperature: 0.2,
        max_tokens: 2500,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: [
              'You are a precise personal expense analyst. Review only the provided aggregate data, in INR.',
              'Do not claim certainty beyond the data. Do not invent amounts, causes, merchants, or future events.',
              'Give practical, non-judgmental spending insights. Avoid investment, tax, or credit advice.',
              'Return JSON only with: headline (string), observations (array of 2-4 concise strings),',
              'recommendations (array of 2-4 objects with title and detail). Do not estimate savings or invent numerical claims.',
            ].join(' '),
          },
          { role: 'user', content: JSON.stringify(report) },
        ],
      }),
    });

    if (!response.ok) {
      const providerError = await response.json().catch(() => ({}));
      console.error(`[AI Analytics] Groq returned HTTP ${response.status}: ${providerError.error?.message || 'request rejected'}`);
      return res.status(502).json({ success: false, message: 'The AI analyst is temporarily unavailable. Please try again shortly.' });
    }

    const completion = await response.json();
    const content = completion.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      return res.status(502).json({ success: false, message: 'The AI analyst returned an empty report. Please try again.' });
    }

    const insights = extractJson(content);
    const data = {
      headline: typeof insights.headline === 'string' ? insights.headline : 'Your spending report is ready.',
      observations: Array.isArray(insights.observations) ? insights.observations.filter((item) => typeof item === 'string').slice(0, 4) : [],
      recommendations: Array.isArray(insights.recommendations)
        ? insights.recommendations.filter((item) => item && typeof item.title === 'string' && typeof item.detail === 'string').slice(0, 4).map((item) => ({
          title: item.title,
          detail: item.detail,
        }))
        : [],
      model: INSIGHTS_MODEL,
      generatedAt: new Date().toISOString(),
      period: report.period,
    };

    res.status(200).json({ success: true, data });
  } catch (error) {
    if (error.name === 'TimeoutError' || error.name === 'AbortError') {
      return res.status(504).json({ success: false, message: 'The AI analysis took too long. Please try again.' });
    }
    if (error instanceof SyntaxError) {
      return res.status(502).json({ success: false, message: 'The AI analyst returned an unreadable report. Please try again.' });
    }
    next(error);
  }
}
