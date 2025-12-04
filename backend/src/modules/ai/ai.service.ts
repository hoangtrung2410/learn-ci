import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export enum AIProvider {
    OPENAI = 'openai',
    GEMINI = 'gemini',
}

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private readonly openaiApiKey: string;
    private readonly geminiApiKey: string;
    private readonly defaultProvider: AIProvider;

    constructor(private readonly configService: ConfigService) {
        this.openaiApiKey = this.configService.get<string>('OPENAI_API_KEY') || '';
        this.geminiApiKey = this.configService.get<string>('GEMINI_API_KEY') || '';
        this.defaultProvider = (this.configService.get<string>('AI_PROVIDER') as AIProvider) || AIProvider.OPENAI;
    }

    /**
     * Call AI model based on provider selection
     */
    private async callAI(
        prompt: string,
        provider?: AIProvider,
        options?: {
            temperature?: number;
            maxTokens?: number;
        }
    ): Promise<string> {
        const selectedProvider = provider || this.defaultProvider;
        const { temperature = 0.7, maxTokens = 1000 } = options || {};

        this.logger.log(`Calling ${selectedProvider} with prompt length: ${prompt.length}`);

        if (selectedProvider === AIProvider.OPENAI) {
            return this.callOpenAI(prompt, temperature, maxTokens);
        } else if (selectedProvider === AIProvider.GEMINI) {
            return this.callGemini(prompt, temperature, maxTokens);
        }

        throw new BadRequestException(`Unsupported AI provider: ${selectedProvider}`);
    }

    /**
     * Call OpenAI GPT API
     */
    private async callOpenAI(
        prompt: string,
        temperature: number,
        maxTokens: number
    ): Promise<string> {
        if (!this.openaiApiKey) {
            throw new BadRequestException('OpenAI API key not configured');
        }

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.openaiApiKey}`,
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an expert CI/CD DevOps assistant. Analyze logs, metrics, and provide actionable recommendations.',
                        },
                        {
                            role: 'user',
                            content: prompt,
                        },
                    ],
                    temperature,
                    max_tokens: maxTokens,
                }),
            });

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`OpenAI API error: ${response.status} ${error}`);
            }

            const data = await response.json();
            return data.choices[0]?.message?.content || '';
        } catch (error) {
            this.logger.error(`OpenAI API call failed: ${error.message}`);
            throw new BadRequestException('Failed to call OpenAI API');
        }
    }

    /**
     * Call Google Gemini API
     */
    private async callGemini(
        prompt: string,
        temperature: number,
        maxTokens: number
    ): Promise<string> {
        if (!this.geminiApiKey) {
            throw new BadRequestException('Gemini API key not configured');
        }

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${this.geminiApiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    {
                                        text: `You are an expert CI/CD DevOps assistant. Analyze logs, metrics, and provide actionable recommendations.\n\n${prompt}`,
                                    },
                                ],
                            },
                        ],
                        generationConfig: {
                            temperature,
                            maxOutputTokens: maxTokens,
                        },
                    }),
                }
            );

            if (!response.ok) {
                const error = await response.text();
                throw new Error(`Gemini API error: ${response.status} ${error}`);
            }

            const data = await response.json();
            return data.candidates[0]?.content?.parts[0]?.text || '';
        } catch (error) {
            this.logger.error(`Gemini API call failed: ${error.message}`);
            throw new BadRequestException('Failed to call Gemini API');
        }
    }

    /**
     * Analyze pipeline logs and provide AI insights
     */
    async analyzePipelineLogs(
        logs: string[],
        provider?: AIProvider
    ): Promise<{
        summary: string;
        issues: string[];
        recommendations: string[];
    }> {
        this.logger.log('Analyzing pipeline logs with AI');

        const prompt = `Analyze the following CI/CD pipeline logs and provide:
1. A brief summary of what happened
2. List of issues found
3. Actionable recommendations to fix the issues

Logs:
${logs.join('\n')}

Respond in JSON format with keys: summary, issues (array), recommendations (array)`;

        try {
            const response = await this.callAI(prompt, provider);
            return JSON.parse(response);
        } catch (error) {
            this.logger.error(`Failed to analyze logs: ${error.message}`);
            return {
                summary: 'Failed to analyze logs',
                issues: [],
                recommendations: [],
            };
        }
    }

    /**
     * Generate optimization recommendations based on metrics
     */
    async generateOptimizationRecommendations(
        metrics: any,
        provider?: AIProvider
    ): Promise<string[]> {
        this.logger.log('Generating optimization recommendations');

        const prompt = `Based on these CI/CD metrics, provide optimization recommendations:
${JSON.stringify(metrics, null, 2)}

Provide 5-10 specific, actionable recommendations to improve pipeline performance.
Respond as a JSON array of strings.`;

        try {
            const response = await this.callAI(prompt, provider);
            return JSON.parse(response);
        } catch (error) {
            this.logger.error(`Failed to generate recommendations: ${error.message}`);
            return [];
        }
    }

    /**
     * Predict pipeline failure likelihood
     */
    async predictFailure(
        pipelineData: any,
        provider?: AIProvider
    ): Promise<{
        likelihood: number;
        factors: string[];
    }> {
        this.logger.log('Predicting pipeline failure');

        const prompt = `Analyze this pipeline data and predict failure likelihood (0-100):
${JSON.stringify(pipelineData, null, 2)}

Consider: branch name, historical success rate, commit patterns, recent changes.
Respond in JSON format with keys: likelihood (number 0-100), factors (array of strings explaining why)`;

        try {
            const response = await this.callAI(prompt, provider);
            return JSON.parse(response);
        } catch (error) {
            this.logger.error(`Failed to predict failure: ${error.message}`);
            return {
                likelihood: 0,
                factors: [],
            };
        }
    }

    /**
     * Suggest code fixes for failed builds
     */
    async suggestFixes(
        errorLogs: string[],
        provider?: AIProvider
    ): Promise<string[]> {
        this.logger.log('Suggesting fixes for errors');

        const prompt = `Analyze these error logs and suggest specific fixes:
${errorLogs.join('\n')}

Provide 3-5 specific, actionable fixes with code examples if applicable.
Respond as a JSON array of strings.`;

        try {
            const response = await this.callAI(prompt, provider);
            return JSON.parse(response);
        } catch (error) {
            this.logger.error(`Failed to suggest fixes: ${error.message}`);
            return [];
        }
    }

    async analysis(data: any, provider?: AIProvider): Promise<any> {
        this.logger.log('Performing AI analysis');

        const prompt = `Perform comprehensive CI/CD analysis:
${JSON.stringify(data, null, 2)}

Provide insights on performance, bottlenecks, and recommendations.
Respond in JSON format.`;

        try {
            const response = await this.callAI(prompt, provider);
            return JSON.parse(response);
        } catch (error) {
            this.logger.error(`Failed to perform analysis: ${error.message}`);
            return {};
        }
    }
}

